import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import {
    Printer, Plus, Trash2, HelpCircle,
    Gauge, Sofa, Monitor, Package, Zap, Shield, Sparkles, DollarSign,
} from 'lucide-react';
import ResourcePageShell from '../../components/ResourcePageShell';
import VehicleAutocomplete from '../../components/VehicleAutocomplete';
import { logUnmatched } from '../../utils/unmatchedVehicleLogger';
import {
    loadDecisionEngineSnapshot,
    saveDecisionEngineSnapshot,
    getConsideringModelStrings,
    recordConsideringModel,
} from '../../lib/vehicleContextStorage';
import {
    CATEGORY_KEYS,
    WEIGHT_MULTIPLIERS,
    averageScore,
    weightedScore,
    isComplete,
    getWinnerIndex,
    getCategoryLeaders,
    hasQualifiedWinner,
} from './vehicleDecisionEngineModel';

/* ─── Evaluation model (v2 / v2.1) ───────────────────────────────── */
const CATEGORIES = [
    { id: 'driving', label: 'Driving Experience', Icon: Gauge, consider: ['Steering feel', 'Ride quality', 'Responsiveness', 'Overall composure'] },
    { id: 'interior', label: 'Interior Quality', Icon: Sofa, consider: ['Materials', 'Fit and finish', 'Switchgear feel', 'Design cohesion'] },
    { id: 'technology', label: 'Technology', Icon: Monitor, consider: ['Infotainment usability', 'Responsiveness', 'Driver assistance capability', 'Connectivity'] },
    { id: 'practicality', label: 'Practicality', Icon: Package, consider: ['Rear seat space', 'Cargo capacity', 'Visibility', 'Storage solutions'] },
    { id: 'efficiency', label: 'Efficiency', Icon: Zap, consider: ['Fuel economy', 'Electric range', 'Energy consumption'] },
    { id: 'reliability', label: 'Reliability', Icon: Shield, consider: ['Brand reputation', 'Powertrain maturity', 'Warranty'] },
    { id: 'design', label: 'Design', Icon: Sparkles, consider: ['Exterior styling', 'Interior design', 'Emotional appeal'] },
    { id: 'cost', label: 'Ownership Cost', Icon: DollarSign, consider: ['Purchase price', 'Insurance', 'Fuel or electricity cost', 'Expected depreciation'] },
];

/* Scale: single column, 5 at top → 1 at bottom (v2.1) */
const SCALE = [
    { value: 5, label: 'Best in this group' },
    { value: 4, label: 'Strong / above average' },
    { value: 3, label: 'Competitive / acceptable' },
    { value: 2, label: 'Noticeable weaknesses' },
    { value: 1, label: 'Clearly worst in this group' },
];

const defaultWeights = () => Object.fromEntries(CATEGORY_KEYS.map(k => [k, 3]));

const defaultScores = () => Object.fromEntries(CATEGORY_KEYS.map(k => [k, null]));
const newVehicle = (name = '') => ({ id: crypto.randomUUID?.() ?? `v-${Date.now()}-${Math.random().toString(36).slice(2)}`, name: name || '', scores: defaultScores() });

function FadeIn({ children, className = '' }) {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const id = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(id);
    }, []);
    return (
        <div className={`transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'} ${className}`}>
            {children}
        </div>
    );
}

/* ─── Radar chart: icon axes, legend, vehicle colors, morph animation ─── */
const MAX_WEIGHT = 1.30;
const RADAR_SIZE_FACTOR = 1.28;
const VEHICLE_COLORS = ['#3B82F6', '#6B7280', '#C9A84C', '#10B981'];

function parsePoints(s) {
    return s.split(' ').map(p => p.split(',').map(Number));
}
function formatPoints(arr) {
    return arr.map(p => p.join(',')).join(' ');
}
function interpolatePoints(a, b, t) {
    return a.map((p, i) => [p[0] + (b[i][0] - p[0]) * t, p[1] + (b[i][1] - p[1]) * t]);
}

function DecisionRadar({ vehicles, winnerIndex, useWeighted, setUseWeighted, weights, categoryLeaders = {} }) {
    const completed = vehicles.filter(isComplete);
    const n = CATEGORIES.length;
    const cx = 200;
    const cy = 200;
    const r = Math.round(130 * RADAR_SIZE_FACTOR);
    const iconRadius = r + 48;

    const angleFor = (i) => (i / n) * Math.PI * 2 - Math.PI / 2;

    const polygonPoints = (vehicle) => {
        return CATEGORY_KEYS.map((key, i) => {
            const raw = vehicle.scores[key];
            const score = raw != null && raw >= 1 && raw <= 5 ? raw : 0;
            const w = WEIGHT_MULTIPLIERS[weights[key]] ?? 1;
            const radius = useWeighted
                ? (score / 5) * (w / MAX_WEIGHT) * r
                : (score / 5) * r;
            const a = angleFor(i);
            return `${cx + radius * Math.cos(a)},${cy + radius * Math.sin(a)}`;
        }).join(' ');
    };

    const gridPoints = CATEGORIES.map((_, i) => {
        const a = angleFor(i);
        return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
    });

    const winnerVehicleId = winnerIndex >= 0 && vehicles[winnerIndex] ? vehicles[winnerIndex].id : null;
    const winnerName = winnerIndex >= 0 && vehicles[winnerIndex] ? (vehicles[winnerIndex].name || '').trim() : '';

    const [displayPoints, setDisplayPoints] = useState({});
    const displayedPointsRef = useRef({});

    const targetsSignature = useMemo(
        () => JSON.stringify(completed.map((v) => ({ id: v.id, scores: v.scores }))) + JSON.stringify(weights) + useWeighted,
        [completed, weights, useWeighted]
    );

    useEffect(() => {
        completed.forEach((v) => {
            const nextStr = polygonPoints(v);
            const next = parsePoints(nextStr);
            const fromStr = displayedPointsRef.current[v.id] || nextStr;
            const from = parsePoints(fromStr);
            if (fromStr === nextStr) return;
            if (from.length !== next.length) {
                setDisplayPoints((dp) => ({ ...dp, [v.id]: nextStr }));
                displayedPointsRef.current[v.id] = nextStr;
                return;
            }
            gsap.to({ t: 0 }, {
                t: 1,
                duration: 0.22,
                ease: 'power2.out',
                onUpdate: function () {
                    const t = this.targets()[0].t;
                    const str = formatPoints(interpolatePoints(from, next, t));
                    displayedPointsRef.current[v.id] = str;
                    setDisplayPoints((dp) => ({ ...dp, [v.id]: str }));
                },
                onComplete: () => {
                    displayedPointsRef.current[v.id] = nextStr;
                },
            });
        });
    }, [targetsSignature]);

    const pointsToRender = (v) => displayPoints[v.id] || polygonPoints(v);

    return (
        <div className="bg-[#14141B] rounded-2xl border border-[#2A2A35] p-6 md:p-8 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4 mb-2">
                <div className="flex rounded-full bg-[#0D0D12] border border-[#2A2A35] p-0.5">
                    <button
                        type="button"
                        onClick={() => setUseWeighted?.(false)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!useWeighted ? 'bg-[#C9A84C] text-[#0D0D12]' : 'text-[#FAF8F5]/50 hover:text-[#FAF8F5]/80'}`}
                    >
                        Simple average
                    </button>
                    <button
                        type="button"
                        onClick={() => setUseWeighted?.(true)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${useWeighted ? 'bg-[#C9A84C] text-[#0D0D12]' : 'text-[#FAF8F5]/50 hover:text-[#FAF8F5]/80'}`}
                    >
                        Priority weighted
                    </button>
                </div>
                <a
                    href="/resources/vehicle-comparison-matrix/print-radar"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                        try {
                            localStorage.setItem('vehicleDecisionEnginePrint', JSON.stringify({ vehicles, weights, useWeighted }));
                        } catch (_) {
                            e.preventDefault();
                        }
                    }}
                    className="flex items-center justify-center gap-2 text-sm font-semibold text-[#C9A84C] border border-[#C9A84C]/30 px-4 py-2 rounded-full hover:bg-[#C9A84C]/10 transition-colors"
                >
                    <Printer size={14} />
                    Print radar & recommendation
                </a>
            </div>
            <p className="text-xs text-[#FAF8F5]/40 text-center mb-[55px]">
                {completed.length > 0
                    ? (useWeighted ? 'Weighted by your priorities' : 'Raw scores across 8 dimensions')
                    : 'Add vehicles to see how they compare.'}
            </p>
            <div className="flex flex-col items-center mb-[45px]">
                <div className="w-full max-w-[460px] mx-auto shrink-0 relative">
                    <svg viewBox="0 0 400 400" className="w-full h-auto" aria-hidden>
                        {[1, 2, 3, 4, 5].map(level => (
                            <polygon
                                key={level}
                                points={gridPoints.map(p => {
                                    const scale = level / 5;
                                    return `${cx + (p.x - cx) * scale},${cy + (p.y - cy) * scale}`;
                                }).join(' ')}
                                fill="none"
                                stroke="#2A2A35"
                                strokeWidth="0.5"
                            />
                        ))}
                        {gridPoints.map((p, i) => (
                            <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#2A2A35" strokeWidth="0.5" />
                        ))}
                        {completed.map((vehicle, idx) => {
                            const isWinner = vehicle.id === winnerVehicleId;
                            const strokeColor = isWinner ? '#C9A84C' : (VEHICLE_COLORS[idx % VEHICLE_COLORS.length] || '#6B7280');
                            const fillColor = isWinner ? 'rgba(201,168,76,0.22)' : (VEHICLE_COLORS[idx % VEHICLE_COLORS.length] || '#6B7280');
                            return (
                                <polygon
                                    key={vehicle.id}
                                    points={pointsToRender(vehicle)}
                                    fill={fillColor}
                                    fillOpacity={isWinner ? 1 : 0.2}
                                    stroke={strokeColor}
                                    strokeWidth={isWinner ? 2.5 : 1.2}
                                />
                            );
                        })}
                    </svg>
                    {/* Axis icons outside outer ring (position in % of container; ring at r/200*50 ≈ 41.5%) */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="relative w-full h-full" style={{ aspectRatio: '1' }}>
                            {CATEGORIES.map((cat, i) => {
                                const a = angleFor(i);
                                const radiusPct = (iconRadius / 200) * 50;
                                const left = 50 + radiusPct * Math.cos(a);
                                const top = 50 + radiusPct * Math.sin(a);
                                const Icon = cat.Icon;
                                const leaderName = categoryLeaders[cat.id];
                                const isLeaderGold = winnerName && leaderName && leaderName === winnerName;
                                return (
                                    <div
                                        key={cat.id}
                                        role="img"
                                        aria-label={cat.label}
                                        className="absolute w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200 pointer-events-auto"
                                        style={{
                                            left: `${left}%`,
                                            top: `${top}%`,
                                            transform: 'translate(-50%, -50%)',
                                        }}
                                    >
                                        <Icon
                                            size={20}
                                            className={isLeaderGold ? 'text-[#C9A84C] drop-shadow-[0_0_6px_rgba(201,168,76,0.6)]' : 'text-[#FAF8F5]/40 hover:text-[#FAF8F5]/70'}
                                            aria-hidden
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                {completed.length > 0 && (
                    <div className="w-full max-w-2xl mt-12 pt-5 flex flex-wrap justify-center gap-x-8 gap-y-2">
                        {completed.map((v, idx) => {
                            const isWinner = v.id === winnerVehicleId;
                            const avg = useWeighted
                                ? weightedScore(v.scores, weights).toFixed(1)
                                : averageScore(v.scores).toFixed(1);
                            const swatch = VEHICLE_COLORS[idx % VEHICLE_COLORS.length];
                            return (
                                <div key={v.id} className="flex items-center gap-3 shrink-0">
                                    <span
                                        className="w-3 h-3 rounded-sm shrink-0"
                                        style={{ backgroundColor: isWinner ? '#C9A84C' : swatch }}
                                    />
                                    <span className="text-sm font-black text-[#FAF8F5]/80">{v.name || `Vehicle ${idx + 1}`}</span>
                                    {isWinner && <span className="text-[10px] font-mono text-[#C9A84C] uppercase tracking-wider">Recommended</span>}
                                    <span className="text-xs font-mono text-[#FAF8F5]/40">{useWeighted ? 'weighted ' : ''}avg {avg}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
                {completed.length === 1 && (
                    <p className="text-sm text-[#FAF8F5]/50 mt-4">Add another vehicle to compare.</p>
                )}
            </div>
            {/* Category legend — three columns */}
            <p className="text-xs text-[#FAF8F5]/50 mt-8 mb-3 text-left border-t border-[#6B7280] pt-3 pb-2 pl-10">
                Autolitics evaluates vehicles across eight ownership dimensions:
            </p>
            <div className="grid grid-cols-3 gap-x-10 gap-y-[9px] text-[11px] text-[#FAF8F5]/60 max-w-2xl mx-auto">
                {CATEGORIES.map((cat) => {
                    const Icon = cat.Icon;
                    return (
                        <div key={cat.id} className="flex items-center gap-2">
                            <Icon size={14} className="text-[#FAF8F5]/50 shrink-0" aria-hidden />
                            <span>{cat.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ─── Category guidance tooltip (portal so it isn't clipped) ───────── */
function GuidancePopover({ category }) {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef(null);

    useEffect(() => {
        if (!open || !triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const padding = 4;
        const popoverHeight = 180;
        const spaceBelow = window.innerHeight - rect.bottom;
        const openDown = spaceBelow >= popoverHeight;
        setPosition({
            left: rect.left,
            top: openDown ? rect.bottom + padding : rect.top - popoverHeight - padding,
        });
    }, [open]);

    const popoverContent = open && (
        <>
            <div className="fixed inset-0 z-[100]" aria-hidden onClick={() => setOpen(false)} />
            <div
                className="fixed z-[101] w-56 rounded-lg bg-[#1a1a24] border border-[#2A2A35] shadow-xl p-3 text-left"
                style={{ left: position.left, top: position.top }}
            >
                <p className="text-[10px] font-['JetBrains_Mono'] text-[#C9A84C]/80 uppercase tracking-wider mb-2">Consider</p>
                <ul className="text-xs text-[#FAF8F5]/70 space-y-1">
                    {category.consider.map((item, i) => (
                        <li key={i}>· {item}</li>
                    ))}
                </ul>
            </div>
        </>
    );

    return (
        <div className="relative inline-block">
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setOpen(!open)}
                className="text-[#C9A84C]/70 hover:text-[#C9A84C] p-0.5 rounded"
                aria-label="Scoring guidance"
            >
                <HelpCircle size={14} />
            </button>
            {typeof document !== 'undefined' && popoverContent && createPortal(popoverContent, document.body)}
        </div>
    );
}

/* ─── Score input (1–5) ──────────────────────────────────────────── */
function ScoreInput({ value, onChange }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(n => (
                <button
                    key={n}
                    type="button"
                    onClick={() => onChange(value === n ? null : n)}
                    className={`w-7 h-7 rounded text-xs font-mono font-medium transition-colors ${
                        value === n
                            ? 'bg-[#C9A84C] text-[#0D0D12]'
                            : 'bg-[#2A2A35] text-[#FAF8F5]/40 hover:bg-[#2A2A35]/80 hover:text-[#FAF8F5]/70'
                    }`}
                >
                    {n}
                </button>
            ))}
        </div>
    );
}

/* ─── Weight dot input (1–5 for priority) ───────────────────────── */
function WeightDots({ value, onChange }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(n => (
                <button
                    key={n}
                    type="button"
                    onClick={() => onChange(n)}
                    className={`w-5 h-5 rounded-full transition-colors ${
                        n <= value ? 'bg-[#C9A84C]/70 text-[#0D0D12]' : 'bg-[#2A2A35] text-[#FAF8F5]/30 hover:bg-[#2A2A35]/80'
                    }`}
                    aria-label={`Priority ${n}`}
                />
            ))}
        </div>
    );
}

function initialEngineState() {
    const saved = loadDecisionEngineSnapshot();
    if (saved?.vehicles?.length >= 1) {
        return {
            vehicles: saved.vehicles.map((v) => ({
                ...v,
                scores: v.scores && typeof v.scores === 'object' ? { ...defaultScores(), ...v.scores } : defaultScores(),
            })),
            weights: saved.weights && typeof saved.weights === 'object' ? { ...defaultWeights(), ...saved.weights } : defaultWeights(),
            useWeighted: !!saved.useWeighted,
        };
    }
    return {
        vehicles: [newVehicle(''), newVehicle('')],
        weights: defaultWeights(),
        useWeighted: false,
    };
}

const initEngine = initialEngineState();

/* ─── Main Component ────────────────────────────────────────────── */
export default function VehicleComparisonMatrix() {
    const [vehicles, setVehicles] = useState(initEngine.vehicles);
    const [weights, setWeights] = useState(initEngine.weights);
    const [useWeighted, setUseWeighted] = useState(initEngine.useWeighted);
    const [contextRecent, setContextRecent] = useState(() => getConsideringModelStrings());
    const [lastAddedId, setLastAddedId] = useState(null);
    const [shownNewId, setShownNewId] = useState(null);
    const newCardRef = useRef(null);
    const nameInputRef = useRef(null);

    useEffect(() => {
        const t = setTimeout(() => {
            saveDecisionEngineSnapshot({ vehicles, weights, useWeighted, savedAt: Date.now() });
        }, 450);
        return () => clearTimeout(t);
    }, [vehicles, weights, useWeighted]);

    useEffect(() => {
        setContextRecent(getConsideringModelStrings());
    }, [vehicles]);

    useEffect(() => {
        const t = setTimeout(() => {
            vehicles.forEach((v) => {
                const n = (v.name || '').trim();
                if (n) recordConsideringModel(n);
            });
        }, 800);
        return () => clearTimeout(t);
    }, [vehicles]);

    const winnerIndex = useMemo(() => getWinnerIndex(vehicles, useWeighted, weights), [vehicles, useWeighted, weights]);
    const categoryLeaders = useMemo(() => getCategoryLeaders(vehicles), [vehicles]);
    const completedCount = useMemo(() => vehicles.filter(isComplete).length, [vehicles]);
    const showQualifiedWinner = useMemo(() => hasQualifiedWinner(vehicles, useWeighted, weights), [vehicles, useWeighted, weights]);
    const winner = showQualifiedWinner && winnerIndex >= 0 ? vehicles[winnerIndex] : null;
    const showNoRecommendation = completedCount >= 2 && !showQualifiedWinner;

    const addVehicle = () => {
        if (vehicles.length >= 4) return;
        const v = newVehicle('');
        setLastAddedId(v.id);
        setVehicles([v, ...vehicles]);
    };

    useEffect(() => {
        if (!lastAddedId) return;
        const t = setTimeout(() => {
            setShownNewId(lastAddedId);
        }, 0);
        return () => clearTimeout(t);
    }, [lastAddedId]);

    useEffect(() => {
        if (!lastAddedId || !shownNewId) return;
        const t = setTimeout(() => {
            newCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            nameInputRef.current?.focus();
            setLastAddedId(null);
            setShownNewId(null);
        }, 150);
        return () => clearTimeout(t);
    }, [lastAddedId, shownNewId]);

    const removeVehicle = (id) => {
        if (vehicles.length <= 1) return;
        setVehicles(vehicles.filter(v => v.id !== id));
    };

    const updateVehicle = (id, patch) => {
        setVehicles(vehicles.map(v => v.id === id ? { ...v, ...patch } : v));
    };

    const updateScore = (id, key, value) => {
        setVehicles(vehicles.map(v => v.id === id ? { ...v, scores: { ...v.scores, [key]: value } } : v));
    };

    const updateWeight = (catId, value) => {
        setWeights(w => ({ ...w, [catId]: value }));
    };

    return (
        <ResourcePageShell navTitle="Vehicle Decision Engine" maxWidth="4xl" mainClassName="md:px-6 !pb-24">
                        {/* Hero — taller, workflow includes Category Leaders */}
                        <section className="mb-12 pt-2">
                            <div className="inline-flex items-center gap-2 text-[10px] font-['JetBrains_Mono'] text-[#C9A84C]/60 uppercase tracking-widest mb-4 border border-[#C9A84C]/20 px-3 py-1 rounded-full">
                                Autolitics Studio Resource
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
                                Autolitics Vehicle<br />
                                <span className="font-['Playfair_Display'] italic text-[#C9A84C]">Decision Engine</span>
                            </h1>
                            <p className="text-lg text-[#FAF8F5]/55 max-w-2xl leading-relaxed mb-8">
                                Compare vehicles digitally, see a clear visual recommendation, and export a printable worksheet.
                            </p>
                            <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-[#FAF8F5]/50 font-['JetBrains_Mono'] max-w-[554px]">
                                <span>Test Drive Scorecard</span>
                                <span>→</span>
                                <span>Vehicle Comparison</span>
                                <span>→</span>
                                <span>Decision Radar</span>
                                <span>→</span>
                                <span className="text-[#C9A84C]/80">Category Leaders</span>
                                <span>→</span>
                                <span className="text-[#C9A84C]/80">Final Recommendation</span>
                                <span>→</span>
                                <span>Printable Worksheet</span>
                            </div>
                        </section>

                        {/* Vehicle Comparison Radar — 100px gap from hero */}
                        <section className="mb-8 pt-[65px]">
                            <h2 className="text-3xl md:text-[40px] font-bold text-[#FAF8F5]/90 mb-6">Vehicle Comparison <span className="font-['Playfair_Display'] italic text-[#C9A84C]">Radar</span></h2>
                            <DecisionRadar
                                vehicles={vehicles}
                                winnerIndex={winnerIndex}
                                useWeighted={useWeighted}
                                setUseWeighted={setUseWeighted}
                                weights={weights}
                                categoryLeaders={categoryLeaders}
                            />
                        </section>

                        {/* Category leaders — always present; placeholder until at least one vehicle is complete */}
                        <section className="mb-8 min-h-[200px]">
                            <h2 className="text-lg font-bold text-[#FAF8F5]/90 mb-4">Category leaders</h2>
                            <div className="rounded-2xl border border-[#2A2A35] bg-[#14141B] p-5 min-h-[180px]">
                                {Object.keys(categoryLeaders).length > 0 ? (
                                    <FadeIn>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                                            {CATEGORIES.map(cat => {
                                                const Icon = cat.Icon;
                                                const leader = categoryLeaders[cat.id];
                                                return (
                                                    <div key={cat.id} className="flex items-center gap-3 py-2">
                                                        {Icon && <Icon size={14} className="text-[#C9A84C]/50 shrink-0" />}
                                                        <span className="text-sm text-[#FAF8F5]/60 shrink-0">{cat.label}:</span>
                                                        <span className="text-sm font-medium text-[#FAF8F5]/90 truncate">{leader ?? '—'}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </FadeIn>
                                ) : (
                                    <p className="text-sm text-[#FAF8F5]/50 py-8">
                                        Complete at least one vehicle above to see category leaders.
                                    </p>
                                )}
                            </div>
                        </section>

                        {/* Recommendation — always present; placeholder, no-recommendation, or winner */}
                        <section className="mb-10 min-h-[140px]">
                            <h2 className="text-lg font-bold text-[#FAF8F5]/90 mb-4">Recommendation</h2>
                            <div
                                className={`rounded-2xl border-2 p-6 md:p-8 min-h-[120px] transition-colors duration-300 ${
                                    winner ? 'border-[#C9A84C]/40 bg-[#C9A84C]/10' : 'border-[#2A2A35] bg-[#14141B]'
                                }`}
                            >
                                {winner ? (
                                    <FadeIn>
                                        <p className="text-[10px] font-['JetBrains_Mono'] text-[#C9A84C]/80 uppercase tracking-widest mb-2">Recommended vehicle</p>
                                        <h3 className="text-2xl font-bold text-[#FAF8F5] mb-1">
                                            {winner.name.trim() || 'Your top choice'}
                                        </h3>
                                        <p className="text-sm text-[#FAF8F5]/60">
                                            Strongest overall balance across the eight ownership dimensions in this comparison.
                                        </p>
                                    </FadeIn>
                                ) : showNoRecommendation ? (
                                    <FadeIn>
                                        <p className="text-[10px] font-['JetBrains_Mono'] text-[#FAF8F5]/50 uppercase tracking-widest mb-2">No Recommendation</p>
                                        <p className="text-sm text-[#FAF8F5]/70">
                                            Currently none of the rated vehicles meet the minimum required score threshold.
                                        </p>
                                    </FadeIn>
                                ) : (
                                    <p className="text-sm text-[#FAF8F5]/50 py-2">
                                        Add and complete at least two vehicles to see a recommendation.
                                    </p>
                                )}
                            </div>
                        </section>

                        {/* Vehicle scores — header first, then scale explanation, then cards */}
                        <section className="mb-10 mt-5">
                            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                                <h2 className="text-2xl font-bold text-[#FAF8F5]/90">Vehicle scores</h2>
                                <button
                                    type="button"
                                    onClick={addVehicle}
                                    disabled={vehicles.length >= 4}
                                    className="flex items-center gap-2 text-sm font-semibold text-[#C9A84C] border border-[#C9A84C]/30 px-4 py-2 rounded-full hover:bg-[#C9A84C]/10 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    <Plus size={16} />
                                    Add vehicle
                                </button>
                            </div>

                            {/* Comparison scale — info for user to understand how to use the scoring tool */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-[#FAF8F5]/90 mb-3">Comparison scale</h3>
                                <p className="text-xs text-[#FAF8F5]/50 mb-4">
                                    Scores are <strong className="text-[#FAF8F5]/70">relative within your comparison set</strong>, not the entire market.
                                </p>
                                <ul className="space-y-2 text-xs">
                                    {SCALE.map(s => (
                                        <li key={s.value} className="flex gap-3">
                                            <span className="font-mono text-[#C9A84C]/80 w-5 shrink-0">{s.value}</span>
                                            <span className="text-[#FAF8F5]/60">{s.label}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="space-y-6">
                                {vehicles.map((vehicle, idx) => {
                                    const isNewCard = vehicle.id === lastAddedId;
                                    const isShown = !isNewCard || vehicle.id === shownNewId;
                                    return (
                                    <div
                                        key={vehicle.id}
                                        ref={isNewCard ? newCardRef : undefined}
                                        className="rounded-2xl border border-[#2A2A35] bg-[#14141B] overflow-hidden transition-all duration-200 ease-out"
                                        style={isNewCard && !isShown ? { opacity: 0, transform: 'translateY(12px)' } : isNewCard && isShown ? { opacity: 1, transform: 'translateY(0)' } : undefined}
                                    >
                                        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#2A2A35]">
                                            <div className="flex-1 min-w-0">
                                                <VehicleAutocomplete
                                                    ref={isNewCard ? nameInputRef : undefined}
                                                    value={vehicle.name}
                                                    onChange={(name) => updateVehicle(vehicle.id, { name, vehicleData: undefined })}
                                                    onSelectVehicle={(selectedVehicle) => updateVehicle(vehicle.id, { name: selectedVehicle.display_name, vehicleData: selectedVehicle })}
                                                    contextRecent={contextRecent}
                                                    placeholder="Enter vehicle name"
                                                    helperText={idx === 0 ? 'Start typing to search supported models, or enter a custom vehicle manually. Models from your OTD runs and offer worksheet appear here too.' : undefined}
                                                    onUnmatchedEntry={logUnmatched}
                                                    className="studio-touch-input w-full bg-transparent text-[#FAF8F5] font-medium placeholder:text-[#FAF8F5]/30 focus:outline-none focus:ring-0 border-0 p-0"
                                                />
                                            </div>
                                            {vehicles.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeVehicle(vehicle.id)}
                                                    className="p-1.5 text-[#FAF8F5]/40 hover:text-red-400 transition-colors"
                                                    aria-label="Remove vehicle"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {CATEGORIES.map(cat => {
                                                    const Icon = cat.Icon;
                                                    return (
                                                        <div key={cat.id} className="flex items-center justify-between gap-4 py-2 border-b border-[#2A2A35]/50 last:border-0">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                {Icon && <Icon size={16} className="text-[#C9A84C]/60 shrink-0" />}
                                                                <span className="text-sm text-[#FAF8F5]/80 truncate">{cat.label}</span>
                                                                <GuidancePopover category={cat} />
                                                            </div>
                                                            <ScoreInput
                                                                value={vehicle.scores[cat.id]}
                                                                onChange={v => updateScore(vehicle.id, cat.id, v)}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Priority weighting */}
                        <section className="mb-10">
                            <h2 className="text-lg font-bold text-[#FAF8F5]/90 mb-2">Priority weighting</h2>
                            <p className="text-xs text-[#FAF8F5]/50 mb-4">
                                How important is each category to you? More dots = higher influence on the recommendation.
                            </p>
                            <div className="rounded-2xl border border-[#2A2A35] bg-[#14141B] p-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {CATEGORIES.map(cat => {
                                        const Icon = cat.Icon;
                                        return (
                                            <div key={cat.id} className="flex items-center justify-between gap-4 py-2 border-b border-[#2A2A35]/50 last:border-0">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    {Icon && <Icon size={14} className="text-[#C9A84C]/50 shrink-0" />}
                                                    <span className="text-sm text-[#FAF8F5]/70 truncate">{cat.label}</span>
                                                </div>
                                                <WeightDots value={weights[cat.id]} onChange={v => updateWeight(cat.id, v)} />
                                            </div>
                                        );
                                    })}
                                </div>
                                <p className="mt-4 text-xs text-[#FAF8F5]/40">
                                    Toggle above to switch between simple and weighted view.
                                </p>
                            </div>
                        </section>

                        {/* Printable worksheet */}
                        <section className="mb-8">
                            <h2 className="text-lg font-bold text-[#FAF8F5]/90 mb-2">Printable worksheet</h2>
                            <p className="text-xs text-[#FAF8F5]/50 mb-4">
                                Use the worksheet to capture scores on paper during test drives, then enter them here.
                            </p>
                            <Link
                                to="/resources/vehicle-comparison-matrix/template"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm font-semibold text-[#C9A84C] border border-[#C9A84C]/30 px-4 py-2.5 rounded-full hover:bg-[#C9A84C]/10 transition-colors"
                            >
                                <Printer size={16} />
                                Print comparison matrix (PDF)
                            </Link>
                        </section>

                        <p className="text-xs text-[#FAF8F5]/20 font-['JetBrains_Mono'] text-center">
                            Autolitics Studio · Vehicle Decision Engine · studio.autolitics.com
                        </p>
        </ResourcePageShell>
    );
}
