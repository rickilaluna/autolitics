import React from 'react';
import { Printer } from 'lucide-react';
import MinimalHeader from '../../components/MinimalHeader';
import ResourceNav from '../../components/ResourceNav';

/* ─── Score Box ─────────────────────────────────────────────────── */
const ScoreBox = ({ n }) => (
    <span className="
        score-box
        inline-flex items-center justify-center
        w-7 h-7 rounded border border-[#2A2A35]
        text-xs font-['JetBrains_Mono'] text-[#FAF8F5]/40
        select-none cursor-default
        hover:border-[#C9A84C]/50 hover:text-[#C9A84C] transition-colors duration-200
    ">
        {n}
    </span>
);

const ScoreRow = ({ label, desc }) => (
    <div className="score-row py-4 border-b border-[#2A2A35] last:border-0">
        <div className="flex items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-[#FAF8F5]/90 mb-0.5">{label}</div>
                {desc && <div className="text-xs text-[#FAF8F5]/40">{desc}</div>}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
                {[1, 2, 3, 4, 5].map(n => <ScoreBox key={n} n={n} />)}
            </div>
        </div>
        <div className="mt-2 notes-line border-b border-dashed border-[#2A2A35] text-xs text-[#FAF8F5]/20 pb-0.5">Notes</div>
    </div>
);

/* ─── Section Header ─────────────────────────────────────────────── */
const SectionHeader = ({ number, title }) => (
    <div className="section-header flex items-center gap-3 mb-0 px-6 py-4 border-b border-[#2A2A35] bg-[#14141B]">
        <span className="text-xs font-['JetBrains_Mono'] text-[#C9A84C]/70 uppercase tracking-widest shrink-0">
            {number}
        </span>
        <h2 className="font-bold text-sm tracking-tight text-[#FAF8F5]/90">{title}</h2>
    </div>
);

/* ─── Field Row ──────────────────────────────────────────────────── */
const Field = ({ label, wide }) => (
    <div className={`field-row flex items-end gap-2 ${wide ? 'col-span-2' : ''}`}>
        <span className="text-xs text-[#FAF8F5]/40 font-['JetBrains_Mono'] shrink-0 whitespace-nowrap">{label}</span>
        <div className="flex-1 border-b border-[#2A2A35]"></div>
    </div>
);

/* ─── Main Component ─────────────────────────────────────────────── */
export default function Scorecard() {

    const handlePrint = () => window.print(); // eslint-disable-line no-undef

    const sections = [
        {
            number: '01',
            title: 'Driving Experience',
            rows: [
                { label: 'Driving Dynamics', desc: 'Acceleration, braking, and steering feel' },
                { label: 'Ride Comfort', desc: 'Suspension comfort and cabin smoothness' },
                { label: 'Noise / NVH', desc: 'Road noise, wind noise, vibration' },
                { label: 'Visibility', desc: 'Driver sightlines and mirror placement' },
            ],
        },
        {
            number: '02',
            title: 'Interior & Ergonomics',
            rows: [
                { label: 'Seat Comfort', desc: 'Support, adjustability, driving position' },
                { label: 'Interior Materials', desc: 'Perceived quality of materials and finishes' },
                { label: 'Cabin Ambience', desc: 'Lighting, design, and overall environment' },
                { label: 'Controls & Layout', desc: 'Ease of reaching and understanding controls' },
                { label: 'Space & Roominess', desc: 'Driver and passenger comfort' },
            ],
        },
        {
            number: '03',
            title: 'Technology & Usability',
            rows: [
                { label: 'Infotainment Usability', desc: 'Menu clarity and responsiveness' },
                { label: 'Software & Interface', desc: 'Navigation, screen layout, and usability' },
                { label: 'Driver Assistance Systems', desc: 'Adaptive cruise, lane assist, etc.' },
                { label: 'Phone Integration', desc: 'CarPlay / Android Auto experience' },
                { label: 'Digital Gauge Cluster', desc: 'Clarity and usefulness of information' },
            ],
        },
        {
            number: '04',
            title: 'Practicality',
            rows: [
                { label: 'Cargo Space', desc: 'Storage and trunk usability' },
                { label: 'Rear Seat Comfort', desc: 'Passenger space and seating' },
                { label: 'Child Seat Compatibility', desc: 'Ease of installing child seats' },
                { label: 'Interior Storage', desc: 'Cupholders, bins, and daily usability' },
                { label: 'Entry / Exit', desc: 'Ease of getting in and out of the vehicle' },
            ],
        },
        {
            number: '05',
            title: 'Efficiency & Ownership',
            rows: [
                { label: 'Fuel Economy / Efficiency', desc: 'Observed efficiency expectations' },
                { label: 'Charging / Refueling', desc: 'EV charging speed or gas efficiency' },
                { label: 'Maintenance Expectations', desc: 'Perceived long-term ownership cost' },
                { label: 'Warranty Coverage', desc: 'Confidence in warranty protection' },
            ],
        },
        {
            number: '06',
            title: 'Intangibles — The "Feel" Score',
            rows: [
                { label: 'Exterior Design', desc: 'Overall aesthetic appeal' },
                { label: 'Interior Design', desc: 'Style and character of the cabin' },
                { label: 'Perceived Quality', desc: 'Does the vehicle feel well built?' },
                { label: 'Cool Factor', desc: 'Emotional appeal of the vehicle' },
                { label: 'Ownership Excitement', desc: 'How excited would you be to own this?' },
            ],
        },
    ];

    return (
        <>
            {/* Print styles */}
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
                        color: #999 !important;
                        background: white !important;
                    }
                    .notes-line { border-color: #ddd !important; color: #bbb !important; }
                    .field-row div { border-color: #ccc !important; }
                    .field-row span { color: #666 !important; }
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
                {/* Noise Overlay */}
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

                    {/* Print button */}
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

                    {/* Scorecard Document */}
                    <div className="print-page bg-[#0D0D12] rounded-[2rem] border border-[#2A2A35] overflow-hidden shadow-2xl">

                        {/* ── Document Header ── */}
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
                                        A practical worksheet for evaluating vehicles during test drives.
                                    </p>
                                </div>
                                <div className="scorecard-brand shrink-0 text-right">
                                    <div className="text-xs font-['JetBrains_Mono'] text-[#C9A84C]/50 uppercase tracking-widest">Score Scale</div>
                                    <div className="mt-1 text-xs text-[#FAF8F5]/40 font-['JetBrains_Mono'] space-y-0.5">
                                        <div>1 — Poor</div>
                                        <div>3 — Acceptable</div>
                                        <div>5 — Excellent</div>
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle Info Fields */}
                            <div className="mt-7 grid grid-cols-2 gap-x-8 gap-y-5">
                                <Field label="Vehicle" />
                                <Field label="Date Tested" />
                                <Field label="Trim / Configuration" />
                                <Field label="Price (MSRP)" />
                                <Field label="Dealership" />
                                <Field label="Quoted Price" />
                                <Field label="Salesperson Name" />
                                <Field label="VIN / Stock #" />
                            </div>
                        </div>

                        {/* ── Scoring Sections ── */}
                        {sections.map((section, si) => (
                            <div key={si} className="score-section border-b border-[#2A2A35]">
                                <SectionHeader number={section.number} title={section.title} />
                                <div className="px-6">
                                    {section.rows.map((row, ri) => (
                                        <ScoreRow key={ri} label={row.label} desc={row.desc} />
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* ── Final Evaluation ── */}
                        <div className="final-section border-b border-[#2A2A35] bg-[#14141B]">
                            <SectionHeader number="—" title="Final Evaluation" />
                            <div className="px-6 py-5 space-y-5">

                                {/* Overall score */}
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-['JetBrains_Mono'] text-[#FAF8F5]/50 uppercase tracking-widest shrink-0">Overall Score</span>
                                    <div className="flex items-center gap-1.5">
                                        {[1, 2, 3, 4, 5].map(n => <ScoreBox key={n} n={n} />)}
                                    </div>
                                </div>

                                {/* Shortlist? */}
                                <div>
                                    <div className="text-xs font-['JetBrains_Mono'] text-[#FAF8F5]/50 uppercase tracking-widest mb-3">Would you shortlist this vehicle?</div>
                                    <div className="flex gap-6">
                                        {['Yes', 'Maybe', 'No'].map(opt => (
                                            <div key={opt} className="flex items-center gap-2">
                                                <div className="w-4 h-4 border border-[#2A2A35] rounded-sm flex-shrink-0"></div>
                                                <span className="text-sm text-[#FAF8F5]/60">{opt}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Text areas */}
                                {['Biggest Strengths', 'Biggest Weaknesses', 'Questions to Research'].map((label, i) => (
                                    <div key={i}>
                                        <div className="text-xs font-['JetBrains_Mono'] text-[#FAF8F5]/50 uppercase tracking-widest mb-2">{label}</div>
                                        <div className="space-y-2">
                                            {[1, 2, 3].map(j => (
                                                <div key={j} className="border-b border-dashed border-[#2A2A35] pb-1 h-5"></div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── Comparison Section ── */}
                        <div className="comparison-section bg-[#14141B]">
                            <SectionHeader number="—" title="Vehicles Compared" />
                            <div className="px-6 py-5">
                                <p className="text-xs text-[#FAF8F5]/40 font-['JetBrains_Mono'] mb-4">List shortlisted alternatives and circle your top choice.</p>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                    {['Vehicle A', 'Vehicle B', 'Vehicle C', 'Vehicle D'].map((v, i) => (
                                        <Field key={i} label={v} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ── Footer ── */}
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
