import React, { useState, useMemo, useRef, useEffect, useId, useCallback } from 'react';

const MAX_SUGGESTIONS = 50;

function normalize(s) {
    return (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/** Search make, model, year, config label, segment, powertrain category, drivetrain */
function scoreConfig(c, q) {
    const nq = normalize(q);
    const hay = normalize(
        [c.make, c.model, c.model_year, c.config_label, c.segment, c.powertrain_summary, c.powertrain_category, c.drivetrain]
            .filter(Boolean)
            .join(' ')
    );
    if (!nq) return hay ? 1 : 0;
    // Exact full-string inclusion
    if (hay.includes(nq)) return 100;
    // All query tokens present somewhere in the haystack
    const parts = nq.split(' ').filter(Boolean);
    if (parts.every((p) => hay.includes(p))) return 80;
    // Partial — at least half of tokens match (forgives extra words like "Hybrid")
    const matched = parts.filter((p) => hay.includes(p));
    if (matched.length > 0 && matched.length >= parts.length * 0.5) return 40 + (matched.length / parts.length) * 30;
    return 0;
}

function filterConfigs(configs, query, segmentFilter) {
    let list = configs;
    if (typeof segmentFilter === 'function') {
        list = list.filter(segmentFilter);
    }
    const q = normalize(query);
    if (!q) {
        return list.slice(0, MAX_SUGGESTIONS);
    }
    return list
        .map((c) => ({ c, score: scoreConfig(c, q) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_SUGGESTIONS)
        .map(({ c }) => c);
}

function labelForConfig(c) {
    const yr = c.model_year != null ? c.model_year : '—';
    const lbl = c.config_label || 'Representative';
    return `${c.make} ${c.model} (${yr} · ${lbl})`;
}

/**
 * Searchable combobox for vehicle_configs via v_vehicle_config_profile rows.
 * value: vehicle_config_id (uuid string) or ''.
 */
export default function VehicleConfigCombobox({
    configs = [],
    value = '',
    onChange,
    placeholder = 'Search make, model, year, trim…',
    disabled = false,
    segmentFilter,
    className = '',
    id: idProp,
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const wrapRef = useRef(null);
    const reactId = useId();
    const listboxId = idProp || `vcc-${reactId}`;

    const selected = useMemo(
        () => configs.find((c) => c.vehicle_config_id === value) || null,
        [configs, value]
    );

    useEffect(() => {
        if (selected) setQuery(labelForConfig(selected));
        else if (!value) setQuery('');
    }, [value, selected]);

    const suggestions = useMemo(
        () => filterConfigs(configs, query, segmentFilter),
        [configs, query, segmentFilter]
    );

    const close = useCallback(() => setOpen(false), []);

    useEffect(() => {
        function onDoc(e) {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) close();
        }
        document.addEventListener('mousedown', onDoc);
        return () => document.removeEventListener('mousedown', onDoc);
    }, [close]);

    const pick = (c) => {
        onChange?.(c.vehicle_config_id);
        setQuery(labelForConfig(c));
        close();
    };

    return (
        <div ref={wrapRef} className={`relative ${className}`}>
            <input
                type="text"
                role="combobox"
                aria-expanded={open}
                aria-controls={open ? listboxId : undefined}
                aria-autocomplete="list"
                disabled={disabled}
                placeholder={placeholder}
                value={open ? query : selected ? labelForConfig(selected) : query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    if (!open) setOpen(true);
                    if (value) onChange?.('');
                }}
                onFocus={() => setOpen(true)}
                className="studio-touch-input w-full min-w-[280px] px-4 py-2.5 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] text-sm focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/25 disabled:opacity-50"
            />
            {open && suggestions.length > 0 && (
                <ul
                    id={listboxId}
                    role="listbox"
                    className="absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-[#2A2A35] bg-[#14141B] py-1 shadow-xl"
                >
                    {suggestions.map((c) => (
                        <li
                            key={c.vehicle_config_id}
                            role="option"
                            aria-selected={c.vehicle_config_id === value}
                            className={`cursor-pointer px-3 py-2 text-sm text-[#FAF8F5]/90 hover:bg-[#1A1A24] ${
                                c.vehicle_config_id === value ? 'bg-[#1A1A24]' : ''
                            }`}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => pick(c)}
                        >
                            {labelForConfig(c)}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
