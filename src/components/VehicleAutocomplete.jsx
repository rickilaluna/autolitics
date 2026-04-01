import React, { useState, useMemo, useRef, useEffect, useCallback, useId } from 'react';

import vehiclesData from '../data/autolitics_vehicle_autocomplete.json';

const MAX_SUGGESTIONS = 8;
const MIN_CHARS = 2;

/** Normalize for matching: lowercase, collapse spaces */
function normalize(s) {
    return (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/** Search across display_name and all aliases. Rank: prefix match highest, then substring. */
function scoreVehicle(vehicle, q) {
    const nq = normalize(q);
    if (!nq) return 0;
    const searchable = [
        normalize(vehicle.display_name),
        ...(Array.isArray(vehicle.aliases) ? vehicle.aliases.map(a => normalize(String(a))) : []),
    ];
    let best = 0;
    for (const s of searchable) {
        if (!s) continue;
        if (s.startsWith(nq)) best = Math.max(best, 1000);
        else if (nq.startsWith(s)) best = Math.max(best, 700);
        else if (s.includes(nq)) best = Math.max(best, 100);
    }
    const b = normalize(vehicle.brand);
    if (b.startsWith(nq)) best = Math.max(best, 500);
    else if (b.includes(nq)) best = Math.max(best, 50);
    return best;
}

function searchVehicles(vehicles, query) {
    const q = normalize(query);
    if (q.length < MIN_CHARS) return [];
    return vehicles
        .filter(v => v.is_active === true)
        .map(v => ({ vehicle: v, score: scoreVehicle(v, query) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_SUGGESTIONS)
        .map(({ vehicle }) => vehicle);
}

/** Labels from Decision Engine / worksheets / profile — shown when query is short or as extra matches */
function contextStringsMatching(contextRecent, query) {
    if (!contextRecent?.length) return [];
    const q = normalize(query);
    const uniq = [...new Set(contextRecent.map((s) => (s || '').trim()).filter(Boolean))];
    if (!q.length) return uniq.slice(0, 6);
    return uniq
        .filter((s) => {
            const ns = normalize(s);
            return ns.includes(q) || q.includes(ns);
        })
        .slice(0, 6);
}

function mergeCatalogAndContext(vehicles, query, contextRecent) {
    const q = normalize(query);
    const catalog =
        q.length >= MIN_CHARS
            ? searchVehicles(vehicles, query)
            : [];
    const ctxLabels = contextStringsMatching(contextRecent, query);
    const catalogNorms = new Set(catalog.map((v) => normalize(v.display_name)));
    const fromContext = ctxLabels
        .filter((label) => !catalogNorms.has(normalize(label)))
        .map((label, i) => ({
            id: `ctx-${i}-${label.slice(0, 24)}`,
            display_name: label,
            brand: 'From your tools',
            is_active: true,
            _fromContext: true,
        }));
    return [...fromContext, ...catalog].slice(0, MAX_SUGGESTIONS + 4);
}

/** Find start index in original text that corresponds to normalized match start */
function findMatchRange(text, query) {
    const nq = normalize(query);
    const nt = normalize(text);
    if (!nq || !nt.includes(nq)) return null;
    const normStart = nt.indexOf(nq);
    let origStart = 0;
    let ni = 0;
    for (let i = 0; i < text.length && ni < normStart; i++) {
        if (/\s/.test(text[i])) {
            if (ni < nt.length && /\s/.test(nt[ni])) ni++;
        } else {
            if (ni < nt.length && text[i].toLowerCase() === nt[ni]) ni++;
        }
        origStart = i + 1;
    }
    let origEnd = origStart;
    let consumed = 0;
    for (let i = origStart; i < text.length && consumed < nq.length; i++) {
        if (/\s/.test(text[i])) {
            if (consumed < nt.length && /\s/.test(nt[normStart + consumed])) consumed++;
        } else {
            if (consumed < nt.length && text[i].toLowerCase() === nt[normStart + consumed]) consumed++;
        }
        origEnd = i + 1;
    }
    return { start: origStart - 1, end: origEnd };
}

/** Wrap matched substring in bold for display */
function boldMatch(text, query) {
    const range = findMatchRange(text, query);
    if (!range) return text;
    const start = text.slice(0, range.start);
    const mid = text.slice(range.start, range.end);
    const end = text.slice(range.end);
    return (
        <>
            {start}
            <strong>{mid}</strong>
            {end}
        </>
    );
}

const VehicleAutocomplete = React.forwardRef(function VehicleAutocomplete(
    {
        value = '',
        onChange,
        onSelectVehicle,
        onUnmatchedEntry,
        placeholder = 'Enter vehicle name',
        helperText = 'Start typing to search supported models, or enter a custom vehicle manually.',
        className = '',
        /** Recent / cross-tool labels (Decision Engine, worksheets, etc.) */
        contextRecent = [],
        id,
        'aria-label': ariaLabel,
        ...inputProps
    },
    ref
) {
    const { onKeyDown: onKeyDownProp, ...restInputProps } = inputProps;
    const [open, setOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const listRef = useRef(null);
    const wrapperRef = useRef(null);
    const listboxId = useId();

    const vehicles = useMemo(() => vehiclesData, []);
    const suggestions = useMemo(
        () => mergeCatalogAndContext(vehicles, value, contextRecent),
        [vehicles, value, contextRecent]
    );

    const exactMatch = useMemo(() => {
        const n = normalize(value.trim());
        if (!n) return false;
        return vehicles.some(v => {
            if (v.is_active !== true) return false;
            if (normalize(v.display_name) === n) return true;
            return (v.aliases || []).some(a => normalize(String(a)) === n);
        });
    }, [vehicles, value]);

    const showDropdown = open && suggestions.length > 0;

    const closeDropdown = useCallback(() => {
        setOpen(false);
        setHighlightedIndex(-1);
    }, []);

    const select = useCallback(
        (vehicle) => {
            onChange(vehicle.display_name);
            onSelectVehicle?.(vehicle);
            closeDropdown();
        },
        [onChange, onSelectVehicle, closeDropdown]
    );

    useEffect(() => {
        setHighlightedIndex(showDropdown ? 0 : -1);
    }, [showDropdown, suggestions.length, value, contextRecent]);

    useEffect(() => {
        if (!showDropdown) return;
        const el = listRef.current;
        if (!el) return;
        const item = el.children[highlightedIndex];
        if (item) item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, [highlightedIndex, showDropdown]);

    useEffect(() => {
        function handleClickOutside(e) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                closeDropdown();
                if (onUnmatchedEntry && value.trim() && !exactMatch) {
                    onUnmatchedEntry(value.trim());
                }
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [closeDropdown, exactMatch, onUnmatchedEntry, value]);

    const handleKeyDown = (e) => {
        if (!showDropdown) return;
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex((i) => (i < suggestions.length - 1 ? i + 1 : i));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex((i) => (i > 0 ? i - 1 : -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
                    select(suggestions[highlightedIndex]);
                } else if (onUnmatchedEntry && value.trim() && !exactMatch) {
                    onUnmatchedEntry(value.trim());
                }
                closeDropdown();
                break;
            case 'Escape':
                e.preventDefault();
                closeDropdown();
                break;
            default:
                break;
        }
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <input
                ref={ref}
                type="text"
                id={id}
                aria-label={ariaLabel ?? placeholder}
                aria-autocomplete="list"
                aria-expanded={!!showDropdown}
                aria-controls={showDropdown ? listboxId : undefined}
                role="combobox"
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onKeyDown={(e) => {
                    handleKeyDown(e);
                    onKeyDownProp?.(e);
                }}
                placeholder={placeholder}
                className={['studio-touch-input', className].filter(Boolean).join(' ')}
                autoComplete="off"
                {...restInputProps}
            />
            {showDropdown && (
                <ul
                    id={listboxId}
                    ref={listRef}
                    role="listbox"
                    className="absolute z-50 left-0 right-0 mt-1 py-1 bg-[#14141B] border border-[#2A2A35] rounded-lg shadow-lg max-h-[280px] overflow-auto"
                >
                    {suggestions.map((vehicle, i) => (
                        <li
                            key={vehicle.id}
                            role="option"
                            aria-selected={i === highlightedIndex}
                            className={`px-3 py-2.5 cursor-pointer text-sm text-[#FAF8F5] hover:bg-[#2A2A35] ${
                                i === highlightedIndex ? 'bg-[#2A2A35]' : ''
                            }`}
                            onMouseEnter={() => setHighlightedIndex(i)}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                select(vehicle);
                            }}
                        >
                            <span className="font-medium">
                                {boldMatch(vehicle.display_name, value)}
                            </span>
                            <span className="block text-xs text-[#FAF8F5]/50 mt-0.5">
                                {vehicle._fromContext ? 'Decision Engine · worksheets · saved' : vehicle.brand}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
            {helperText && (
                <p className="mt-1.5 text-xs text-[#FAF8F5]/50">{helperText}</p>
            )}
        </div>
    );
});

export default VehicleAutocomplete;
export { searchVehicles };
