import React, { useEffect, useMemo, useState } from 'react';
import { Printer, Loader2 } from 'lucide-react';
import MinimalHeader from '../../components/MinimalHeader';
import ResourceNav from '../../components/ResourceNav';
import VehicleAutocomplete from '../../components/VehicleAutocomplete';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
    getConsideringModelStrings,
    loadScorecardSnapshot,
    recordConsideringModel,
    saveScorecardSnapshot,
} from '../../lib/vehicleContextStorage';

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

/** @param {Record<string, unknown> | null | undefined} savedSource — pass remote payload; omit to use localStorage */
function initialFormState(savedSource) {
    const saved = savedSource !== undefined ? savedSource : loadScorecardSnapshot();
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

const ScoreBox = ({ n, selected, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`score-box inline-flex items-center justify-center w-7 h-7 rounded border text-xs font-['JetBrains_Mono'] transition-colors duration-200 ${
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
        <div className="flex items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-[#FAF8F5]/90 mb-0.5">{row.label}</div>
                {row.desc && <div className="text-xs text-[#FAF8F5]/40">{row.desc}</div>}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
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
            className="mt-2 w-full bg-transparent border-b border-dashed border-[#2A2A35] text-xs text-[#FAF8F5]/75 placeholder:text-[#FAF8F5]/25 focus:outline-none pb-1 resize-none"
        />
    </div>
);

const SectionHeader = ({ number, title }) => (
    <div className="section-header flex items-center gap-3 mb-0 px-6 py-4 border-b border-[#2A2A35] bg-[#14141B]">
        <span className="text-xs font-['JetBrains_Mono'] text-[#C9A84C]/70 uppercase tracking-widest shrink-0">{number}</span>
        <h2 className="font-bold text-sm tracking-tight text-[#FAF8F5]/90">{title}</h2>
    </div>
);

const FieldInput = ({ label, value, onChange, type = 'text' }) => (
    <div className="field-row">
        <label className="block text-xs text-[#FAF8F5]/40 font-['JetBrains_Mono'] mb-1.5">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-[#0D0D12] border border-[#2A2A35] rounded-lg px-3 py-2 text-sm text-[#FAF8F5] focus:outline-none focus:border-[#C9A84C]/70"
        />
    </div>
);

export default function Scorecard() {
    const { user } = useAuth();
    const [form, setForm] = useState(null);
    const [syncReady, setSyncReady] = useState(false);
    const [contextRecent, setContextRecent] = useState(() => getConsideringModelStrings());

    const handlePrint = () => window.print(); // eslint-disable-line no-undef

    // Load local vs cloud (logged-in users): newer wins by updated_at vs savedAt
    useEffect(() => {
        let cancelled = false;
        async function load() {
            if (!user?.id) {
                if (!cancelled) {
                    setForm(initialFormState());
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
                setForm(initialFormState());
                setSyncReady(true);
                return;
            }
            const local = loadScorecardSnapshot();
            const remoteTs = data?.updated_at ? new Date(data.updated_at).getTime() : 0;
            const localTs = local?.savedAt ? Number(local.savedAt) : 0;
            const rp = data?.payload;
            const hasRemote =
                rp &&
                typeof rp === 'object' &&
                (Object.keys(rp).length > 0 || rp.scores || rp.vehicleModel);
            if (hasRemote && remoteTs >= localTs) {
                const next = initialFormState(rp);
                setForm(next);
                saveScorecardSnapshot({ ...next, savedAt: remoteTs });
            } else {
                setForm(initialFormState());
            }
            setSyncReady(true);
        }
        load();
        return () => {
            cancelled = true;
        };
    }, [user?.id]);

    useEffect(() => {
        if (!syncReady || !form) return;
        const t = setTimeout(() => {
            const savedAt = Date.now();
            const withMeta = { ...form, savedAt };
            saveScorecardSnapshot(withMeta);
            if (user?.id) {
                const { savedAt: _s, ...payload } = withMeta;
                void supabase.from('client_scorecard_snapshots').upsert(
                    {
                        user_id: user.id,
                        payload,
                        updated_at: new Date().toISOString(),
                    },
                    { onConflict: 'user_id' }
                );
            }
        }, 400);
        return () => clearTimeout(t);
    }, [form, syncReady, user?.id]);

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

    if (!syncReady || !form) {
        return (
            <div className="bg-[#0D0D12] min-h-screen text-[#FAF8F5] font-['Inter'] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#C9A84C] animate-spin" />
            </div>
        );
    }

    return (
        <>
            <style>{`
                @media print {
                    body { background: white !important; color: #111 !important; }
                    .no-print { display: none !important; }
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
                        border-color: #ccc !important;
                        color: #666 !important;
                        background: white !important;
                    }
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
                    .final-section { background: #f9f9f9 !important; border-color: #ddd !important; break-before: page; break-inside: avoid; }
                    .final-section * { color: #111 !important; border-color: #ccc !important; }
                    .comparison-section { background: #f9f9f9 !important; border-color: #ddd !important; break-inside: avoid; }
                }

                @page {
                    margin: 0.6in;
                    size: letter;
                }
            `}</style>

            <div className="bg-[#0D0D12] min-h-screen text-[#FAF8F5] font-['Inter'] selection:bg-[#C9A84C]/20">
                <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.04] mix-blend-overlay no-print">
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                        <filter id="noiseFilterSc">
                            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
                        </filter>
                        <rect width="100%" height="100%" filter="url(#noiseFilterSc)" />
                    </svg>
                </div>

                <MinimalHeader />
                <div className="pt-28">
                    <ResourceNav title="Vehicle Scorecard" />

                    <main className="w-full max-w-3xl mx-auto px-4 pt-6 pb-20">
                        <div className="no-print flex justify-end mb-8">
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 text-sm font-semibold text-[#0D0D12] bg-[#C9A84C] px-5 py-2.5 rounded-full hover:scale-[1.03] transition-transform duration-300"
                                style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
                            >
                                <Printer size={15} />
                                Print / Save PDF
                            </button>
                        </div>

                        <div className="print-page bg-[#0D0D12] rounded-[2rem] border border-[#2A2A35] overflow-hidden shadow-2xl">
                            <div className="scorecard-header px-8 py-8 border-b border-[#2A2A35] bg-[#14141B]">
                                <div className="flex items-start justify-between gap-6">
                                    <div>
                                        <div className="scorecard-badge inline-flex items-center gap-2 text-[10px] font-['JetBrains_Mono'] text-[#C9A84C]/60 uppercase tracking-widest mb-3 border border-[#C9A84C]/20 px-3 py-1 rounded-full">
                                            Autolitics Studio Resource
                                        </div>
                                        <h1 className="scorecard-title text-2xl md:text-3xl font-bold tracking-tight mb-1">
                                            Vehicle Evaluation Scorecard
                                        </h1>
                                        <p className="scorecard-subtitle text-sm text-[#FAF8F5]/40 max-w-sm">
                                            Save your ratings and notes as you test drive vehicles.
                                        </p>
                                    </div>
                                    <div className="scorecard-brand shrink-0 text-right">
                                        <div className="text-xs font-['JetBrains_Mono'] text-[#C9A84C]/50 uppercase tracking-widest">Score Scale</div>
                                        <div className="mt-1 text-xs text-[#FAF8F5]/40 font-['JetBrains_Mono'] space-y-0.5">
                                            <div>1 - Poor</div>
                                            <div>3 - Acceptable</div>
                                            <div>5 - Excellent</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-7 grid grid-cols-2 gap-x-8 gap-y-5">
                                    <div className="field-row col-span-2">
                                        <label className="block text-xs text-[#FAF8F5]/40 font-['JetBrains_Mono'] mb-1.5">Vehicle</label>
                                        <VehicleAutocomplete
                                            value={form.vehicleModel}
                                            onChange={(value) => setField('vehicleModel', value)}
                                            contextRecent={contextRecent}
                                            placeholder="e.g., 2024 Honda CR-V EX-L"
                                            className="w-full bg-[#0D0D12] border border-[#2A2A35] rounded-lg px-3 py-2 text-sm text-[#FAF8F5] focus:outline-none focus:border-[#C9A84C]/70"
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

                            {sections.map((section) => (
                                <div key={section.number} className="score-section border-b border-[#2A2A35]">
                                    <SectionHeader number={section.number} title={section.title} />
                                    <div className="px-6">
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
                                <div className="px-6 py-5 space-y-5">
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs font-['JetBrains_Mono'] text-[#FAF8F5]/50 uppercase tracking-widest shrink-0">Overall Score</span>
                                        <div className="flex items-center gap-1.5">
                                            {[1, 2, 3, 4, 5].map((n) => (
                                                <ScoreBox key={n} n={n} selected={form.overallScore === n} onClick={() => setField('overallScore', n)} />
                                            ))}
                                        </div>
                                        <span className="text-xs text-[#FAF8F5]/45 font-['JetBrains_Mono']">Avg section score: {avgScore ?? '-'}</span>
                                    </div>

                                    <div>
                                        <div className="text-xs font-['JetBrains_Mono'] text-[#FAF8F5]/50 uppercase tracking-widest mb-3">Would you shortlist this vehicle?</div>
                                        <div className="flex gap-6">
                                            {['Yes', 'Maybe', 'No'].map((opt) => (
                                                <button type="button" key={opt} onClick={() => setField('shortlist', opt)} className="flex items-center gap-2">
                                                    <div className={`w-4 h-4 border rounded-sm flex-shrink-0 ${form.shortlist === opt ? 'border-[#C9A84C] bg-[#C9A84C]/25' : 'border-[#2A2A35]'}`}></div>
                                                    <span className={`text-sm ${form.shortlist === opt ? 'text-[#C9A84C]' : 'text-[#FAF8F5]/60'}`}>{opt}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {[
                                        ['Biggest Strengths', 'strengths'],
                                        ['Biggest Weaknesses', 'weaknesses'],
                                        ['Questions to Research', 'questions'],
                                    ].map(([label, key]) => (
                                        <div key={key} className="field-row">
                                            <div className="text-xs font-['JetBrains_Mono'] text-[#FAF8F5]/50 uppercase tracking-widest mb-2">{label}</div>
                                            <textarea
                                                rows={3}
                                                value={form[key]}
                                                onChange={(e) => setField(key, e.target.value)}
                                                className="w-full bg-[#0D0D12] border border-[#2A2A35] rounded-lg px-3 py-2 text-sm text-[#FAF8F5] focus:outline-none focus:border-[#C9A84C]/70 resize-y"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="comparison-section bg-[#14141B]">
                                <SectionHeader number="-" title="Vehicles Compared" />
                                <div className="px-6 py-5">
                                    <p className="text-xs text-[#FAF8F5]/40 font-['JetBrains_Mono'] mb-4">List shortlisted alternatives and circle your top choice.</p>
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
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
                                                    className="w-full bg-[#0D0D12] border border-[#2A2A35] rounded-lg px-3 py-2 text-sm text-[#FAF8F5] focus:outline-none focus:border-[#C9A84C]/70"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t border-[#2A2A35] flex items-center justify-between">
                                <span className="text-[10px] font-['JetBrains_Mono'] text-[#FAF8F5]/20 uppercase tracking-widest">
                                    Autolitics Studio · Vehicle Evaluation Scorecard
                                </span>
                                <span className="text-[10px] font-['JetBrains_Mono'] text-[#FAF8F5]/20">
                                    studio.autolitics.com
                                </span>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
