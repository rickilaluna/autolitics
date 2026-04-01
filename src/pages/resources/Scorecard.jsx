import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Printer, Loader2, Save, Plus, Trash2, GitBranch } from 'lucide-react';
import ResourcePageShell from '../../components/ResourcePageShell';
import VehicleAutocomplete from '../../components/VehicleAutocomplete';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
    getConsideringModelStrings,
    loadScorecardBundle,
    saveScorecardBundle,
    recordConsideringModel,
} from '../../lib/vehicleContextStorage';
import {
    normalizeScorecardBundle,
    bundleToRemotePayload,
    getActiveEntry,
    upsertEntry,
    setActiveEntry,
    removeEntry,
    createEmptyEntry,
} from '../../lib/scorecardBundle';
import { applyScorecardEntryToDecisionEngine } from '../../lib/scorecardDecisionBridge';

const sections = [
    {
        number: '01',
        title: 'Driving Experience',
        rows: [
            { id: 'driving_dynamics', label: 'Driving Dynamics', desc: 'Acceleration, braking, and steering feel' },
            { id: 'ride_comfort', label: 'Ride Comfort', desc: 'Suspension comfort and cabin smoothness' },
            { id: 'noise_nvh', label: 'Noise / NVH', desc: 'Road noise, wind noise, vibration' },
            { id: 'visibility', label: 'Visibility', desc: 'Driver sightlines and mirror placement' },
        ],
    },
    {
        number: '02',
        title: 'Interior & Ergonomics',
        rows: [
            { id: 'seat_comfort', label: 'Seat Comfort', desc: 'Support, adjustability, driving position' },
            { id: 'materials', label: 'Interior Materials', desc: 'Perceived quality of materials and finishes' },
            { id: 'cabin_ambience', label: 'Cabin Ambience', desc: 'Lighting, design, and overall environment' },
            { id: 'controls_layout', label: 'Controls & Layout', desc: 'Ease of reaching and understanding controls' },
            { id: 'roominess', label: 'Space & Roominess', desc: 'Driver and passenger comfort' },
        ],
    },
    {
        number: '03',
        title: 'Technology & Usability',
        rows: [
            { id: 'infotainment', label: 'Infotainment Usability', desc: 'Menu clarity and responsiveness' },
            { id: 'software_ui', label: 'Software & Interface', desc: 'Navigation, screen layout, and usability' },
            { id: 'adas', label: 'Driver Assistance Systems', desc: 'Adaptive cruise, lane assist, etc.' },
            { id: 'phone_integration', label: 'Phone Integration', desc: 'CarPlay / Android Auto experience' },
            { id: 'cluster', label: 'Digital Gauge Cluster', desc: 'Clarity and usefulness of information' },
        ],
    },
    {
        number: '04',
        title: 'Practicality',
        rows: [
            { id: 'cargo', label: 'Cargo Space', desc: 'Storage and trunk usability' },
            { id: 'rear_comfort', label: 'Rear Seat Comfort', desc: 'Passenger space and seating' },
            { id: 'child_seat', label: 'Child Seat Compatibility', desc: 'Ease of installing child seats' },
            { id: 'storage', label: 'Interior Storage', desc: 'Cupholders, bins, and daily usability' },
            { id: 'entry_exit', label: 'Entry / Exit', desc: 'Ease of getting in and out of the vehicle' },
        ],
    },
    {
        number: '05',
        title: 'Efficiency & Ownership',
        rows: [
            { id: 'efficiency', label: 'Fuel Economy / Efficiency', desc: 'Observed efficiency expectations' },
            { id: 'charging', label: 'Charging / Refueling', desc: 'EV charging speed or gas efficiency' },
            { id: 'maintenance', label: 'Maintenance Expectations', desc: 'Perceived long-term ownership cost' },
            { id: 'warranty', label: 'Warranty Coverage', desc: 'Confidence in warranty protection' },
        ],
    },
    {
        number: '06',
        title: 'Intangibles - The "Feel" Score',
        rows: [
            { id: 'exterior', label: 'Exterior Design', desc: 'Overall aesthetic appeal' },
            { id: 'interior_design', label: 'Interior Design', desc: 'Style and character of the cabin' },
            { id: 'quality_feel', label: 'Perceived Quality', desc: 'Does the vehicle feel well built?' },
            { id: 'cool_factor', label: 'Cool Factor', desc: 'Emotional appeal of the vehicle' },
            { id: 'ownership_excitement', label: 'Ownership Excitement', desc: 'How excited would you be to own this?' },
        ],
    },
];

const rowIds = sections.flatMap((section) => section.rows.map((row) => row.id));
const blankScores = Object.fromEntries(rowIds.map((id) => [id, null]));
const blankNotes = Object.fromEntries(rowIds.map((id) => [id, '']));

/** @param {Record<string, unknown> | null | undefined} saved */
function initialFormState(saved) {
    const today = new Date().toISOString().slice(0, 10);
    return {
        vehicleModel: saved?.vehicleModel || '',
        trim: saved?.trim || '',
        dateTested: saved?.dateTested || today,
        msrp: saved?.msrp || '',
        dealer: saved?.dealer || '',
        quotedPrice: saved?.quotedPrice || '',
        salesperson: saved?.salesperson || '',
        vinStock: saved?.vinStock || '',
        scores: { ...blankScores, ...(saved?.scores || {}) },
        notes: { ...blankNotes, ...(saved?.notes || {}) },
        overallScore: saved?.overallScore ?? null,
        shortlist: saved?.shortlist || '',
        strengths: saved?.strengths || '',
        weaknesses: saved?.weaknesses || '',
        questions: saved?.questions || '',
        comparedVehicles: Array.isArray(saved?.comparedVehicles)
            ? [...saved.comparedVehicles, '', '', '', ''].slice(0, 4)
            : ['', '', '', ''],
    };
}

function formToEntry(form, entryId) {
    return {
        id: entryId,
        savedAt: Date.now(),
        vehicleModel: form.vehicleModel,
        trim: form.trim,
        dateTested: form.dateTested,
        msrp: form.msrp,
        dealer: form.dealer,
        quotedPrice: form.quotedPrice,
        salesperson: form.salesperson,
        vinStock: form.vinStock,
        scores: form.scores,
        notes: form.notes,
        overallScore: form.overallScore,
        shortlist: form.shortlist,
        strengths: form.strengths,
        weaknesses: form.weaknesses,
        questions: form.questions,
        comparedVehicles: form.comparedVehicles,
    };
}

function bundleLatestSavedAt(bundle) {
    if (!bundle?.entries?.length) return 0;
    return Math.max(0, ...bundle.entries.map((e) => Number(e.savedAt) || 0));
}

function entryLabel(entry) {
    const t = [entry?.vehicleModel, entry?.trim].filter(Boolean).join(' ').trim();
    return t || 'Untitled evaluation';
}

function sectionAverageFromEntry(entry, section) {
    const vals = section.rows.map((r) => entry?.scores?.[r.id]).filter((n) => Number.isFinite(n));
    if (!vals.length) return '—';
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
}

const ScoreBox = ({ n, selected, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`score-box inline-flex items-center justify-center min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 sm:w-7 sm:h-7 rounded border text-sm sm:text-xs font-['JetBrains_Mono'] transition-colors duration-200 touch-manipulation active:opacity-90 ${
            selected
                ? 'border-[#C9A84C] bg-[#C9A84C]/20 text-[#C9A84C]'
                : 'border-[#2A2A35] text-[#FAF8F5]/40 hover:border-[#C9A84C]/50 hover:text-[#C9A84C]'
        }`}
    >
        {n}
    </button>
);

const ScoreRow = ({ row, score, note, onScore, onNote }) => (
    <div className="score-row py-4 border-b border-[#2A2A35] last:border-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-[#FAF8F5]/90 mb-0.5">{row.label}</div>
                {row.desc && <div className="text-xs text-[#FAF8F5]/40">{row.desc}</div>}
            </div>
            <div className="flex items-center justify-between gap-2 sm:gap-1.5 shrink-0 w-full sm:w-auto">
                {[1, 2, 3, 4, 5].map((n) => (
                    <ScoreBox key={n} n={n} selected={score === n} onClick={() => onScore(row.id, n)} />
                ))}
            </div>
        </div>
        <textarea
            rows={2}
            value={note}
            onChange={(e) => onNote(row.id, e.target.value)}
            placeholder="Notes"
            className="studio-touch-input mt-2 w-full min-h-[2.75rem] sm:min-h-[2.75rem] bg-transparent border-b border-dashed border-[#2A2A35] text-[#FAF8F5]/75 placeholder:text-[#FAF8F5]/25 focus:outline-none pb-1 resize-y sm:resize-none"
        />
    </div>
);

const SectionHeader = ({ number, title }) => (
    <div className="section-header flex items-center gap-3 mb-0 px-4 sm:px-6 py-3 sm:py-4 border-b border-[#2A2A35] bg-[#14141B]">
        <span className="text-xs font-['JetBrains_Mono'] text-[#C9A84C]/70 uppercase tracking-widest shrink-0">{number}</span>
        <h2 className="font-bold text-sm tracking-tight text-[#FAF8F5]/90">{title}</h2>
    </div>
);

const FieldInput = ({ label, value, onChange, type = 'text' }) => (
    <div className="field-row min-w-0">
        <label className="block text-xs text-[#FAF8F5]/40 font-['JetBrains_Mono'] mb-1.5">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="studio-touch-input w-full bg-[#0D0D12] border border-[#2A2A35] rounded-lg px-3 py-2.5 sm:py-2 text-[#FAF8F5] focus:outline-none focus:border-[#C9A84C]/70"
        />
    </div>
);

/** Plain-text duplicate for print/PDF (some browsers omit styled controls). */
function PrintScorecardSummary({ form, avgScore }) {
    const lines = [];
    sections.forEach((sec) => {
        sec.rows.forEach((row) => {
            const s = form.scores[row.id];
            const n = form.notes[row.id];
            const scoreStr = Number.isFinite(s) ? String(s) : '—';
            const noteStr = (n || '').trim();
            lines.push(`${sec.title} — ${row.label}: ${scoreStr}/5${noteStr ? ` — ${noteStr}` : ''}`);
        });
    });
    return (
        <div className="print-summary-only border-b border-[#e0e0e0] pb-4 mb-4 text-[11px] leading-relaxed text-[#111]">
            <h2 className="text-sm font-bold mb-2 text-[#111]">Evaluation summary (for print)</h2>
            <p>
                <strong>Vehicle:</strong> {form.vehicleModel || '—'}
                {form.trim ? ` · ${form.trim}` : ''}
            </p>
            <p>
                <strong>Date:</strong> {form.dateTested || '—'} · <strong>Dealer:</strong> {form.dealer || '—'} · <strong>MSRP / Quote:</strong>{' '}
                {form.msrp || '—'} / {form.quotedPrice || '—'}
            </p>
            <p>
                <strong>Overall:</strong> {Number.isFinite(form.overallScore) ? `${form.overallScore}/5` : '—'} · <strong>Section avg:</strong> {avgScore ?? '—'} ·{' '}
                <strong>Shortlist:</strong> {form.shortlist || '—'}
            </p>
            {form.strengths?.trim() && (
                <p>
                    <strong>Strengths:</strong> {form.strengths}
                </p>
            )}
            {form.weaknesses?.trim() && (
                <p>
                    <strong>Weaknesses:</strong> {form.weaknesses}
                </p>
            )}
            {form.questions?.trim() && (
                <p>
                    <strong>Questions:</strong> {form.questions}
                </p>
            )}
            <ul className="list-disc pl-4 mt-2 space-y-0.5">
                {lines.map((line, i) => (
                    <li key={i}>{line}</li>
                ))}
            </ul>
        </div>
    );
}

export default function Scorecard() {
    const { user } = useAuth();
    const [bundle, setBundle] = useState(null);
    const [form, setForm] = useState(null);
    const [syncReady, setSyncReady] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [deMessage, setDeMessage] = useState('');
    const [contextRecent, setContextRecent] = useState(() => getConsideringModelStrings());
    const bundleRef = useRef(null);

    useEffect(() => {
        bundleRef.current = bundle;
    }, [bundle]);

    const handlePrint = () => window.print(); // eslint-disable-line no-undef

    const persistBundle = useCallback(
        (next, showToast) => {
            saveScorecardBundle(next);
            if (user?.id) {
                const payload = bundleToRemotePayload(next);
                void supabase.from('client_scorecard_snapshots').upsert(
                    {
                        user_id: user.id,
                        payload,
                        updated_at: new Date().toISOString(),
                    },
                    { onConflict: 'user_id' }
                );
            }
            if (showToast) {
                setSaveMessage(user?.id ? 'Saved (this device + your account)' : 'Saved on this device');
                setTimeout(() => setSaveMessage(''), 2800);
            }
        },
        [user?.id]
    );

    const persistNow = useCallback(() => {
        const b = bundleRef.current;
        if (!b || !form) return;
        const next = upsertEntry(b, b.activeEntryId, formToEntry(form, b.activeEntryId));
        setBundle(next);
        persistBundle(next, true);
    }, [form, persistBundle]);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            const local = loadScorecardBundle();
            if (!user?.id) {
                if (!cancelled) {
                    setBundle(local);
                    setForm(initialFormState(getActiveEntry(local)));
                    setSyncReady(true);
                }
                return;
            }
            const { data, error } = await supabase
                .from('client_scorecard_snapshots')
                .select('payload, updated_at')
                .eq('user_id', user.id)
                .maybeSingle();
            if (cancelled) return;
            if (error) {
                console.warn('Scorecard cloud load:', error.message);
                setBundle(local);
                setForm(initialFormState(getActiveEntry(local)));
                setSyncReady(true);
                return;
            }
            const remoteTs = data?.updated_at ? new Date(data.updated_at).getTime() : 0;
            const localTs = bundleLatestSavedAt(local);
            const rp = data?.payload;
            const remoteNorm = rp ? normalizeScorecardBundle(rp) : null;
            const hasRemote = remoteNorm && remoteNorm.entries?.length > 0;
            if (hasRemote && remoteTs >= localTs) {
                setBundle(remoteNorm);
                setForm(initialFormState(getActiveEntry(remoteNorm)));
                saveScorecardBundle(remoteNorm);
            } else {
                setBundle(local);
                setForm(initialFormState(getActiveEntry(local)));
            }
            setSyncReady(true);
        }
        load();
        return () => {
            cancelled = true;
        };
    }, [user?.id]);

    useEffect(() => {
        if (!syncReady || !form || !bundle) return;
        const t = setTimeout(() => {
            const b = bundleRef.current;
            if (!b) return;
            const next = upsertEntry(b, b.activeEntryId, formToEntry(form, b.activeEntryId));
            bundleRef.current = next;
            setBundle(next);
            persistBundle(next, false);
        }, 400);
        return () => clearTimeout(t);
    }, [form, syncReady, bundle?.activeEntryId, persistBundle]);

    useEffect(() => {
        if (!form) return;
        const t = setTimeout(() => {
            const model = (form.vehicleModel || '').trim();
            const trim = (form.trim || '').trim();
            if (model) {
                recordConsideringModel(model);
                if (trim) recordConsideringModel(`${model} ${trim}`.trim());
            }
            (form.comparedVehicles || []).forEach((v) => recordConsideringModel(v));
            setContextRecent(getConsideringModelStrings());
        }, 700);
        return () => clearTimeout(t);
    }, [form?.vehicleModel, form?.trim, form?.comparedVehicles]);

    const avgScore = useMemo(() => {
        if (!form) return null;
        const vals = Object.values(form.scores).filter((v) => Number.isFinite(v));
        if (!vals.length) return null;
        return Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2));
    }, [form]);

    const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleNewEvaluation = () => {
        const b = bundleRef.current;
        if (!b || !form) return;
        const committed = upsertEntry(b, b.activeEntryId, formToEntry(form, b.activeEntryId));
        const ne = createEmptyEntry();
        const next = { ...committed, entries: [...committed.entries, ne], activeEntryId: ne.id };
        setBundle(next);
        bundleRef.current = next;
        setForm(initialFormState(ne));
        persistBundle(next, true);
    };

    const handleSelectEntry = (entryId) => {
        const b = bundleRef.current;
        if (!b || !form || entryId === b.activeEntryId) return;
        const committed = upsertEntry(b, b.activeEntryId, formToEntry(form, b.activeEntryId));
        const target = committed.entries.find((e) => e.id === entryId);
        if (!target) return;
        const next = setActiveEntry(committed, entryId);
        setBundle(next);
        bundleRef.current = next;
        setForm(initialFormState(target));
        persistBundle(next, false);
    };

    const handleDeleteEntry = (entryId) => {
        const b = bundleRef.current;
        if (!b || !form || b.entries.length <= 1) return;
        const committed = upsertEntry(b, b.activeEntryId, formToEntry(form, b.activeEntryId));
        const next = removeEntry(committed, entryId);
        const active = getActiveEntry(next);
        setBundle(next);
        bundleRef.current = next;
        setForm(initialFormState(active));
        persistBundle(next, true);
    };

    const handleApplyToDecisionEngine = () => {
        if (!form) return;
        const entry = formToEntry(form, bundle?.activeEntryId || 'x');
        applyScorecardEntryToDecisionEngine(entry);
        setDeMessage('Merged into Vehicle Comparison Matrix (local).');
        setTimeout(() => setDeMessage(''), 4000);
    };

    if (!syncReady || !form || !bundle) {
        return (
            <div className="w-full min-w-0 min-h-[100dvh] bg-[#0D0D12] text-[#FAF8F5] font-['Inter'] flex items-center justify-center px-4">
                <Loader2 className="w-8 h-8 text-[#C9A84C] animate-spin" aria-hidden />
            </div>
        );
    }

    return (
        <>
            <style>{`
                .print-summary-only { display: none !important; }
                @media print {
                    body { background: white !important; color: #111 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    .no-print { display: none !important; }
                    .print-summary-only { display: block !important; }
                    .print-page {
                        background: white !important;
                        color: #111 !important;
                        box-shadow: none !important;
                        border-radius: 0 !important;
                        max-width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    .score-section { break-inside: avoid; }
                    .section-header {
                        background: #f5f5f5 !important;
                        border-bottom: 1px solid #ddd !important;
                    }
                    .section-header h2, .section-header span { color: #111 !important; }
                    .score-row { border-color: #e0e0e0 !important; }
                    .score-box {
                        border-color: #333 !important;
                        color: #111 !important;
                        background: #fff !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .score-box.border-\\[\\#C9A84C\\] { border-color: #b8860b !important; background: #fff8e6 !important; }
                    .field-row input, .field-row textarea, .score-row textarea {
                        border-color: #ccc !important;
                        background: white !important;
                        color: #111 !important;
                    }
                    .field-row label, .score-row textarea::placeholder { color: #666 !important; }
                    .scorecard-header { background: white !important; border-color: #e0e0e0 !important; }
                    .scorecard-title { color: #111 !important; }
                    .scorecard-subtitle { color: #666 !important; }
                    .scorecard-badge { background: #f5f5f5 !important; color: #555 !important; border-color: #ddd !important; }
                    .scorecard-brand { color: #111 !important; }
                    .scorecard-brand .text-\\[\\#FAF8F5\\]\\/40 { color: #555 !important; }
                    .final-section { background: #f9f9f9 !important; border-color: #ddd !important; break-before: page; break-inside: avoid; }
                    .final-section * { color: #111 !important; border-color: #ccc !important; }
                    .comparison-section { background: #f9f9f9 !important; border-color: #ddd !important; break-inside: avoid; }
                    .compare-table-section {
                        break-inside: avoid;
                        background: #f9f9f9 !important;
                        border-color: #ddd !important;
                    }
                    .compare-table-section th,
                    .compare-table-section td { color: #111 !important; border-color: #e0e0e0 !important; }
                }

                @page {
                    margin: 0.6in;
                    size: letter;
                }
            `}</style>

            <ResourcePageShell navTitle="Vehicle Scorecard" maxWidth="3xl" mainClassName="!px-0 sm:!px-4 selection:bg-[#C9A84C]/20">
                        <div className="no-print flex flex-col gap-3 mb-6 sm:mb-8">
                            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-2 min-w-0">
                                <label className="text-xs text-[#FAF8F5]/50 font-['JetBrains_Mono'] uppercase tracking-widest shrink-0 w-full sm:w-auto">
                                    Saved evaluations
                                </label>
                                <div className="flex flex-wrap items-center gap-2 w-full min-w-0">
                                    <select
                                        value={bundle.activeEntryId}
                                        onChange={(e) => handleSelectEntry(e.target.value)}
                                        className="studio-touch-input min-w-0 flex-1 sm:max-w-[min(100%,20rem)] bg-[#14141B] border border-[#2A2A35] rounded-lg px-3 py-2.5 sm:py-2 text-[#FAF8F5] touch-manipulation"
                                    >
                                        {bundle.entries.map((e) => (
                                            <option key={e.id} value={e.id}>
                                                {entryLabel(e)}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={handleNewEvaluation}
                                        className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#FAF8F5]/90 border border-[#2A2A35] min-h-[44px] px-3 rounded-lg hover:border-[#C9A84C]/50 touch-manipulation shrink-0"
                                    >
                                        <Plus size={14} />
                                        New
                                    </button>
                                    {bundle.entries.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (window.confirm('Delete this evaluation from the list?')) handleDeleteEntry(bundle.activeEntryId);
                                            }}
                                            className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] text-[#FAF8F5]/50 hover:text-red-400 touch-manipulation"
                                            aria-label="Delete this evaluation"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end sm:gap-2">
                                <button
                                    type="button"
                                    onClick={persistNow}
                                    className="flex items-center justify-center gap-2 text-sm font-semibold text-[#0D0D12] bg-[#C9A84C]/90 min-h-[48px] px-4 rounded-full hover:bg-[#C9A84C] transition-colors touch-manipulation"
                                >
                                    <Save size={15} />
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={handlePrint}
                                    className="flex items-center justify-center gap-2 text-sm font-semibold text-[#0D0D12] bg-[#C9A84C] min-h-[48px] px-4 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-transform duration-300 touch-manipulation"
                                    style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
                                >
                                    <Printer size={15} />
                                    <span className="hidden sm:inline">Print / PDF</span>
                                    <span className="sm:hidden">PDF</span>
                                </button>
                            </div>
                        </div>
                        {(saveMessage || deMessage) && (
                            <div className="no-print mb-4 text-xs text-[#C9A84C]/90 font-['JetBrains_Mono']">
                                {saveMessage}
                                {deMessage && <span className="block mt-1 text-[#FAF8F5]/70">{deMessage}</span>}
                            </div>
                        )}
                        <p className="no-print text-xs text-[#FAF8F5]/45 mb-6 max-w-xl leading-relaxed">
                            Changes save automatically after you pause typing. Use <strong className="text-[#FAF8F5]/70">Save</strong> to confirm storage
                            {user?.id ? ' on this device and your account' : ' on this device'}. Log in on your phone to sync the same account data—localhost and production use separate browser storage.
                        </p>

                        <div className="print-page w-full min-w-0 bg-[#0D0D12] rounded-none sm:rounded-[2rem] border border-[#2A2A35] border-x-0 sm:border-x shadow-2xl overflow-visible sm:overflow-hidden">
                            <PrintScorecardSummary form={form} avgScore={avgScore} />

                            <div className="scorecard-header px-4 sm:px-8 py-6 sm:py-8 border-b border-[#2A2A35] bg-[#14141B]">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                                    <div className="min-w-0 flex-1">
                                        <div className="scorecard-badge inline-flex items-center gap-2 text-[10px] font-['JetBrains_Mono'] text-[#C9A84C]/60 uppercase tracking-widest mb-3 border border-[#C9A84C]/20 px-3 py-1 rounded-full">
                                            Autolitics Studio Resource
                                        </div>
                                        <h1 className="scorecard-title text-xl sm:text-2xl md:text-3xl font-bold tracking-tight mb-1">
                                            Vehicle Evaluation Scorecard
                                        </h1>
                                        <p className="scorecard-subtitle text-sm text-[#FAF8F5]/40 max-w-sm">
                                            Save your ratings and notes as you test drive vehicles.
                                        </p>
                                    </div>
                                    <div className="scorecard-brand shrink-0 text-left sm:text-right w-full sm:w-auto pt-1 border-t border-[#2A2A35] sm:border-t-0 sm:pt-0">
                                        <div className="text-xs font-['JetBrains_Mono'] text-[#C9A84C]/50 uppercase tracking-widest">Score Scale</div>
                                        <div className="mt-1 text-xs text-[#FAF8F5]/40 font-['JetBrains_Mono'] space-y-0.5">
                                            <div>1 - Poor</div>
                                            <div>3 - Acceptable</div>
                                            <div>5 - Excellent</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="no-print mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                                    <button
                                        type="button"
                                        onClick={handleApplyToDecisionEngine}
                                        className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-[#C9A84C] border border-[#C9A84C]/40 min-h-[44px] px-3 rounded-lg hover:bg-[#C9A84C]/10 touch-manipulation text-left sm:text-center"
                                    >
                                        <GitBranch size={14} className="shrink-0" />
                                        <span className="text-left">Apply scores to Vehicle Comparison Matrix</span>
                                    </button>
                                    <Link
                                        to="/resources/vehicle-comparison-matrix"
                                        className="text-xs text-[#FAF8F5]/50 underline hover:text-[#C9A84C] min-h-[44px] flex items-center touch-manipulation"
                                    >
                                        Open matrix →
                                    </Link>
                                </div>

                                <div className="mt-6 sm:mt-7 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 sm:gap-y-5">
                                    <div className="field-row col-span-1 sm:col-span-2 min-w-0">
                                        <label className="block text-xs text-[#FAF8F5]/40 font-['JetBrains_Mono'] mb-1.5">Vehicle</label>
                                        <VehicleAutocomplete
                                            value={form.vehicleModel}
                                            onChange={(value) => setField('vehicleModel', value)}
                                            contextRecent={contextRecent}
                                            placeholder="e.g., 2024 Honda CR-V EX-L"
                                            helperText=""
                                            className="studio-touch-input w-full bg-[#0D0D12] border border-[#2A2A35] rounded-lg px-3 py-2.5 sm:py-2 text-[#FAF8F5] focus:outline-none focus:border-[#C9A84C]/70"
                                        />
                                    </div>
                                    <FieldInput label="Date Tested" type="date" value={form.dateTested} onChange={(v) => setField('dateTested', v)} />
                                    <FieldInput label="Trim / Configuration" value={form.trim} onChange={(v) => setField('trim', v)} />
                                    <FieldInput label="Price (MSRP)" value={form.msrp} onChange={(v) => setField('msrp', v)} />
                                    <FieldInput label="Dealership" value={form.dealer} onChange={(v) => setField('dealer', v)} />
                                    <FieldInput label="Quoted Price" value={form.quotedPrice} onChange={(v) => setField('quotedPrice', v)} />
                                    <FieldInput label="Salesperson Name" value={form.salesperson} onChange={(v) => setField('salesperson', v)} />
                                    <FieldInput label="VIN / Stock #" value={form.vinStock} onChange={(v) => setField('vinStock', v)} />
                                </div>
                            </div>

                            {bundle.entries.length >= 2 && (
                                <div className="compare-table-section border-b border-[#2A2A35] bg-[#14141B] px-3 sm:px-6 py-5">
                                    <h3 className="text-xs font-['JetBrains_Mono'] text-[#C9A84C]/70 uppercase tracking-widest mb-3">Compare saved evaluations</h3>
                                    <div className="overflow-x-auto overscroll-x-contain -mx-1 px-1 sm:mx-0 sm:px-0 touch-pan-x">
                                        <table className="w-full min-w-[520px] text-xs text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-[#2A2A35]">
                                                    <th className="py-2 pr-2 text-[#FAF8F5]/50 font-normal sticky left-0 z-10 bg-[#14141B] shadow-[2px_0_4px_rgba(0,0,0,0.2)]">
                                                        Section
                                                    </th>
                                                    {bundle.entries.map((e) => (
                                                        <th key={e.id} className="py-2 px-2 text-[#FAF8F5]/80 font-semibold max-w-[120px] align-bottom">
                                                            {entryLabel(e)}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sections.map((sec) => (
                                                    <tr key={sec.number} className="border-b border-[#2A2A35]/60">
                                                        <td className="py-2 pr-2 text-[#FAF8F5]/70 sticky left-0 z-10 bg-[#14141B] shadow-[2px_0_4px_rgba(0,0,0,0.15)]">
                                                            {sec.title}
                                                        </td>
                                                        {bundle.entries.map((e) => (
                                                            <td key={e.id} className="py-2 px-2 text-[#FAF8F5]/90 font-['JetBrains_Mono']">
                                                                {sectionAverageFromEntry(e, sec)}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {sections.map((section) => (
                                <div key={section.number} className="score-section border-b border-[#2A2A35]">
                                    <SectionHeader number={section.number} title={section.title} />
                                    <div className="px-4 sm:px-6">
                                        {section.rows.map((row) => (
                                            <ScoreRow
                                                key={row.id}
                                                row={row}
                                                score={form.scores[row.id]}
                                                note={form.notes[row.id]}
                                                onScore={(id, value) =>
                                                    setForm((prev) => ({ ...prev, scores: { ...prev.scores, [id]: value } }))
                                                }
                                                onNote={(id, value) =>
                                                    setForm((prev) => ({ ...prev, notes: { ...prev.notes, [id]: value } }))
                                                }
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <div className="final-section border-b border-[#2A2A35] bg-[#14141B]">
                                <SectionHeader number="-" title="Final Evaluation" />
                                <div className="px-4 sm:px-6 py-5 space-y-5">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                                        <span className="text-xs font-['JetBrains_Mono'] text-[#FAF8F5]/50 uppercase tracking-widest shrink-0">Overall Score</span>
                                        <div className="flex items-center justify-between gap-2 sm:gap-1.5 sm:justify-start w-full sm:w-auto">
                                            {[1, 2, 3, 4, 5].map((n) => (
                                                <ScoreBox key={n} n={n} selected={form.overallScore === n} onClick={() => setField('overallScore', n)} />
                                            ))}
                                        </div>
                                        <span className="text-xs text-[#FAF8F5]/45 font-['JetBrains_Mono']">Avg section score: {avgScore ?? '-'}</span>
                                    </div>

                                    <div className="no-print">
                                        <div className="text-xs font-['JetBrains_Mono'] text-[#FAF8F5]/50 uppercase tracking-widest mb-3">Would you shortlist this vehicle?</div>
                                        <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
                                            {['Yes', 'Maybe', 'No'].map((opt) => (
                                                <button
                                                    type="button"
                                                    key={opt}
                                                    onClick={() => setField('shortlist', opt)}
                                                    className="flex items-center gap-3 min-h-[44px] sm:min-h-0 py-1 touch-manipulation w-full sm:w-auto"
                                                >
                                                    <div className={`w-5 h-5 min-w-[20px] border rounded-sm flex-shrink-0 ${form.shortlist === opt ? 'border-[#C9A84C] bg-[#C9A84C]/25' : 'border-[#2A2A35]'}`}></div>
                                                    <span className={`text-base sm:text-sm ${form.shortlist === opt ? 'text-[#C9A84C]' : 'text-[#FAF8F5]/60'}`}>{opt}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {[
                                        ['Biggest Strengths', 'strengths'],
                                        ['Biggest Weaknesses', 'weaknesses'],
                                        ['Questions to Research', 'questions'],
                                    ].map(([label, key]) => (
                                        <div key={key} className="field-row min-w-0">
                                            <div className="text-xs font-['JetBrains_Mono'] text-[#FAF8F5]/50 uppercase tracking-widest mb-2">{label}</div>
                                            <textarea
                                                rows={3}
                                                value={form[key]}
                                                onChange={(e) => setField(key, e.target.value)}
                                                className="studio-touch-input w-full min-h-[5rem] sm:min-h-[5rem] bg-[#0D0D12] border border-[#2A2A35] rounded-lg px-3 py-2.5 text-[#FAF8F5] focus:outline-none focus:border-[#C9A84C]/70 resize-y"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="comparison-section bg-[#14141B]">
                                <SectionHeader number="-" title="Vehicles Compared" />
                                <div className="px-4 sm:px-6 py-5">
                                    <p className="text-xs text-[#FAF8F5]/40 font-['JetBrains_Mono'] mb-4 no-print">
                                        List shortlisted alternatives and circle your top choice.
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                                        {['Vehicle A', 'Vehicle B', 'Vehicle C', 'Vehicle D'].map((label, i) => (
                                            <div key={label} className="field-row">
                                                <label className="block text-xs text-[#FAF8F5]/40 font-['JetBrains_Mono'] mb-1.5">{label}</label>
                                                <VehicleAutocomplete
                                                    value={form.comparedVehicles[i]}
                                                    onChange={(value) =>
                                                        setForm((prev) => {
                                                            const next = [...prev.comparedVehicles];
                                                            next[i] = value;
                                                            return { ...prev, comparedVehicles: next };
                                                        })
                                                    }
                                                    contextRecent={contextRecent}
                                                    helperText=""
                                                    className="studio-touch-input w-full bg-[#0D0D12] border border-[#2A2A35] rounded-lg px-3 py-2.5 sm:py-2 text-[#FAF8F5] focus:outline-none focus:border-[#C9A84C]/70"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="px-4 sm:px-6 py-4 border-t border-[#2A2A35] flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <span className="text-[10px] font-['JetBrains_Mono'] text-[#FAF8F5]/20 uppercase tracking-widest">
                                    Autolitics Studio · Vehicle Evaluation Scorecard
                                </span>
                                <span className="text-[10px] font-['JetBrains_Mono'] text-[#FAF8F5]/20">studio.autolitics.com</span>
                            </div>
                        </div>
            </ResourcePageShell>
        </>
    );
}
