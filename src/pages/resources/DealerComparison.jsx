import React from 'react';
import { Link } from 'react-router-dom';
import { Printer, GitCompare, ShieldCheck } from 'lucide-react';
import MinimalHeader from '../../components/MinimalHeader';
import ResourceNav from '../../components/ResourceNav';

/* ─── Print styles ──────────────────────────────────────────────── */
const PRINT_STYLES = `
@media print {
    body { background: white !important; color: #111 !important; }
    .no-print { display: none !important; }
    .print-only { display: block !important; }
    .print-page {
        background: white !important;
        color: #111 !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        max-width: 100% !important;
        padding: 0 !important;
        margin: 0 !important;
        border: none !important;
    }
    .section-card {
        background: white !important;
        border-color: #e0e0e0 !important;
        break-inside: avoid;
    }
    .comparison-table th { background: #f5f5f5 !important; color: #111 !important; border-color: #ddd !important; }
    .comparison-table td { color: #111 !important; border-color: #e0e0e0 !important; }
    .field-line { border-color: #ccc !important; }
    .field-label { color: #555 !important; }
    .doc-header { background: white !important; border-color: #e0e0e0 !important; }
    .chart-bar { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .comparison-grid { break-inside: avoid; }
    .print-table-section { break-before: page; break-inside: avoid; }
}
@page { margin: 0.6in; size: letter landscape; }
`;

/* ─── Helpers ───────────────────────────────────────────────────── */
// Section number sits proud above the heading, outdented on md+ screens
const SectionLabel = ({ n, children }) => (
    <div className="relative mb-7">
        <span className="block text-[10px] font-['JetBrains_Mono'] text-[#C9A84C]/50 uppercase tracking-[0.25em] mb-2">{n}</span>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{children}</h2>
    </div>
);

const Bullet = ({ children }) => (
    <li className="flex items-start gap-3 text-sm text-[#FAF8F5]/60">
        <span className="w-1 h-1 rounded-full bg-[#C9A84C]/70 mt-2 shrink-0" />
        <span>{children}</span>
    </li>
);

// Clean left-border accent card — no icon box, less visual noise
const StepCard = ({ n, title, children }) => (
    <div className="section-card flex gap-6 bg-[#14141B] rounded-2xl border border-[#2A2A35] px-6 py-5 border-l-2 border-l-[#C9A84C]/30">
        <span className="text-[10px] font-['JetBrains_Mono'] text-[#C9A84C]/40 uppercase tracking-widest pt-0.5 shrink-0 w-5">{n}</span>
        <div>
            <h3 className="font-semibold text-base text-[#FAF8F5]/90 mb-1.5">{title}</h3>
            <p className="text-sm text-[#FAF8F5]/55 leading-relaxed">{children}</p>
        </div>
    </div>
);

/* ─── Comparison diagram (Typical vs Strategic) ─────────────────── */
const rows = [
    { typical: 'Negotiates on monthly payment', strategic: 'Negotiates on total vehicle price' },
    { typical: 'Contacts one dealership', strategic: 'Requests quotes from 3–5 dealers' },
    { typical: 'Accepts verbal pricing', strategic: 'Requests written out-the-door quotes' },
    { typical: 'Decides same day under pressure', strategic: 'Takes deliberate time to compare' },
    { typical: 'Focuses on discount amount', strategic: 'Compares total out-the-door cost' },
];

const ComparisonDiagram = () => (
    <div className="comparison-grid section-card bg-[#14141B] rounded-2xl border border-[#2A2A35] overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-2 divide-x divide-[#2A2A35]">
            <div className="px-6 py-4 bg-[#0D0D12]">
                <div className="text-xs font-['JetBrains_Mono'] text-[#FAF8F5]/25 uppercase tracking-widest mb-0.5">Typical Buyer</div>
                <div className="text-sm font-semibold text-[#FAF8F5]/40">Reactive</div>
            </div>
            <div className="px-6 py-4 bg-[#C9A84C]/5 border-l border-[#C9A84C]/20">
                <div className="text-xs font-['JetBrains_Mono'] text-[#C9A84C]/60 uppercase tracking-widest mb-0.5">Strategic Buyer</div>
                <div className="text-sm font-semibold text-[#C9A84C]">Prepared</div>
            </div>
        </div>
        {/* Rows */}
        {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-2 divide-x divide-[#2A2A35] border-t border-[#2A2A35]">
                <div className="px-6 py-4 text-sm text-[#FAF8F5]/35">{r.typical}</div>
                <div className="px-6 py-4 text-sm text-[#FAF8F5]/75 bg-[#C9A84C]/[0.03]">{r.strategic}</div>
            </div>
        ))}
    </div>
);

/* ─── Printable comparison table ────────────────────────────────── */
const DEALERS = ['Dealer A', 'Dealer B', 'Dealer C', 'Dealer D'];

const TABLE_ROWS = [
    { label: 'Vehicle / Trim', mono: false },
    { label: 'Stock / VIN', mono: true },
    { label: 'MSRP', mono: true },
    { label: 'Market Adjustment', mono: true },
    { label: 'Dealer Discount', mono: true },
    { label: 'Adjusted Vehicle Price', mono: true, accent: true },
    { label: 'Dealer Add-Ons', mono: true },
    { label: 'Documentation Fee', mono: true },
    { label: 'Other Fees', mono: true },
    { label: 'Taxes', mono: true },
    { label: 'Registration', mono: true },
    { label: 'OUT-THE-DOOR PRICE', mono: true, bold: true, accent: true },
    { label: 'Financing Rate (APR)', mono: true },
    { label: 'Loan Term', mono: true },
    { label: 'Notes', mono: false, tall: true },
];

const ComparisonTable = () => (
    <div className="print-table-section overflow-x-auto">
        <table className="comparison-table w-full text-sm border-collapse">
            <thead>
                <tr>
                    <th className="text-left px-4 py-3 bg-[#14141B] text-[#FAF8F5]/50 text-xs font-['JetBrains_Mono'] uppercase tracking-widest border border-[#2A2A35] w-40">
                        Line Item
                    </th>
                    {DEALERS.map(d => (
                        <th key={d} className="px-4 py-3 bg-[#14141B] text-[#C9A84C]/70 text-xs font-['JetBrains_Mono'] uppercase tracking-widest border border-[#2A2A35] text-center min-w-[140px]">
                            {d}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {TABLE_ROWS.map((row, i) => (
                    <tr key={i} className={row.bold ? 'bg-[#C9A84C]/5' : i % 2 === 0 ? 'bg-[#0D0D12]' : 'bg-[#14141B]'}>
                        <td className={`px-4 py-${row.tall ? '8' : '3'} border border-[#2A2A35] text-xs ${row.bold ? 'font-bold text-[#C9A84C] font-[\'JetBrains_Mono\'] uppercase tracking-wider' :
                            row.accent ? 'font-semibold text-[#FAF8F5]/80' :
                                'text-[#FAF8F5]/50'
                            } font-['JetBrains_Mono'] whitespace-nowrap`}>
                            {row.label}
                        </td>
                        {DEALERS.map(d => (
                            <td key={d} className={`px-4 py-${row.tall ? '8' : '3'} border border-[#2A2A35] text-center ${row.bold ? 'font-bold text-[#C9A84C]' : 'text-[#FAF8F5]/30'
                                }`}>
                                {/* blank fill-in cell */}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
        <p className="text-xs text-[#FAF8F5]/25 font-['JetBrains_Mono'] mt-3 text-right">
            Autolitics Studio · Dealer Offer Comparison Template · studio.autolitics.com
        </p>
    </div>
);

/* ─── Sample preview table (filled) ────────────────────────────── */
const SAMPLE = [
    { dealer: 'Dealer A', msrp: '$48,000', discount: '-$1,200', fees: '$600', addons: '$0', otd: '$50,100', highlight: false },
    { dealer: 'Dealer B', msrp: '$48,000', discount: '-$900', fees: '$200', addons: '$0', otd: '$49,800', highlight: true },
    { dealer: 'Dealer C', msrp: '$48,000', discount: '-$1,500', fees: '$1,400', addons: '$700', otd: '$50,600', highlight: false },
];

const SampleTable = () => (
    <div className="overflow-x-auto rounded-2xl border border-[#2A2A35]">
        <table className="w-full text-sm">
            <thead>
                <tr className="bg-[#14141B] border-b border-[#2A2A35]">
                    {['Dealer', 'MSRP', 'Discount', 'Fees', 'Add-Ons', 'OTD Price'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-['JetBrains_Mono'] text-[#FAF8F5]/40 uppercase tracking-widest">{h}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {SAMPLE.map((r, i) => (
                    <tr key={i} className={`border-b border-[#2A2A35] last:border-0 ${r.highlight ? 'bg-[#C9A84C]/5' : 'bg-[#0D0D12]'}`}>
                        <td className="px-5 py-3 font-medium text-[#FAF8F5]/80">{r.dealer}</td>
                        <td className="px-5 py-3 text-[#FAF8F5]/50">{r.msrp}</td>
                        <td className="px-5 py-3 text-[#FAF8F5]/50">{r.discount}</td>
                        <td className="px-5 py-3 text-[#FAF8F5]/50">{r.fees}</td>
                        <td className="px-5 py-3 text-[#FAF8F5]/50">{r.addons}</td>
                        <td className={`px-5 py-3 font-bold font-['JetBrains_Mono'] ${r.highlight ? 'text-[#C9A84C]' : 'text-[#FAF8F5]/70'}`}>
                            {r.otd}
                            {r.highlight && <span className="ml-2 text-[10px] bg-[#C9A84C]/15 text-[#C9A84C] px-2 py-0.5 rounded-full uppercase tracking-wide font-normal">Best</span>}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        <p className="px-5 py-3 text-xs text-[#FAF8F5]/25 font-['JetBrains_Mono'] border-t border-[#2A2A35]">
            Dealer B has the lowest OTD price despite the smallest headline discount. Dealer C's large discount is erased by fees and add-ons.
        </p>
    </div>
);

/* ─── Main Component ────────────────────────────────────────────── */
export default function DealerComparison() {

    const handlePrint = () => window.print(); // eslint-disable-line no-undef

    return (
        <>
            <style>{PRINT_STYLES}</style>

            <div className="bg-[#0D0D12] min-h-screen text-[#FAF8F5] font-['Inter'] selection:bg-[#C9A84C]/20">
                {/* Noise overlay */}
                <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.04] mix-blend-overlay no-print">
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                        <filter id="noiseFilterDC">
                            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
                        </filter>
                        <rect width="100%" height="100%" filter="url(#noiseFilterDC)" />
                    </svg>
                </div>

                <MinimalHeader />
                <div className="pt-28">
                    <ResourceNav title="Dealer Offer Comparison" />

                    <main className="w-full max-w-4xl mx-auto px-6 md:px-8 pt-6 pb-24">

                        {/* Print button */}
                        <div className="no-print flex justify-end mb-10">
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 text-sm font-semibold text-[#0D0D12] bg-[#C9A84C] px-5 py-2.5 rounded-full hover:scale-[1.03] transition-transform duration-300"
                                style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
                            >
                                <Printer size={15} />
                                Print / Save PDF
                            </button>
                        </div>

                        {/* ── Hero ── */}
                        <section className="mb-14 print-page">
                            <div className="inline-flex items-center gap-2 text-[10px] font-['JetBrains_Mono'] text-[#C9A84C]/60 uppercase tracking-widest mb-4 border border-[#C9A84C]/20 px-3 py-1 rounded-full">
                                Autolitics Studio Resource
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
                                Dealer Offer<br />
                                <span className="font-['Playfair_Display'] italic text-[#C9A84C]">Comparison Template</span>
                            </h1>
                            <p className="text-lg text-[#FAF8F5]/55 max-w-2xl leading-relaxed mb-8">
                                Compare dealership quotes and uncover the true lowest cost.
                            </p>

                            {/* Callout quote */}
                            <div className="section-card border border-[#C9A84C]/20 bg-[#C9A84C]/5 rounded-2xl px-6 py-5 max-w-xl">
                                <p className="text-sm text-[#FAF8F5]/70 leading-relaxed italic font-['Playfair_Display']">
                                    "Dealership quotes rarely look the same.

                                    One dealer may discount the vehicle but add fees.
                                    Another may hide incentives in the pricing.

                                    A structured comparison reveals the true lowest cost."
                                </p>
                            </div>
                        </section>

                        {/* ── Core Insight ── */}
                        <section className="mb-12">
                            <div className="section-card bg-[#14141B] rounded-2xl border border-[#2A2A35] p-7">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center shrink-0">
                                        <GitCompare size={18} className="text-[#C9A84C]" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-base text-[#FAF8F5]/90 mb-3">The Problem With Comparing Quotes</h2>
                                        <p className="text-sm text-[#FAF8F5]/55 leading-relaxed mb-3">
                                            Two quotes with the same vehicle price can differ by thousands of dollars once fees, add-ons, and incentives are included. Dealership offers are designed for negotiation — not clarity.
                                        </p>
                                        <p className="text-sm text-[#FAF8F5]/55 leading-relaxed">
                                            Autolitics buyers compare offers using the <span className="text-[#C9A84C] font-semibold">out-the-door price</span> — This number represents the <span className="text-[#C9A84C] font-semibold">true cost of the vehicle purchase</span> — the amount that will appear on the final purchase contract.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ── Section 1: Why It's Difficult ── */}
                        <section className="mb-12">
                            <SectionLabel n="01">Why Offer Comparison Is Difficult</SectionLabel>
                            <p className="text-sm text-[#FAF8F5]/50 leading-relaxed mb-5">
                                Dealership quotes vary widely in structure. Without a consistent framework, buyers may choose the wrong offer.
                            </p>
                            <ul className="space-y-3">
                                <Bullet>Different documentation fees — ranging from $0 to $1,200+ depending on dealership</Bullet>
                                <Bullet>Dealer-installed accessories bundled without disclosure</Bullet>
                                <Bullet>Varying incentive application — some dealers apply manufacturer rebates, others do not</Bullet>
                                <Bullet>Financing incentives embedded into vehicle price</Bullet>
                                <Bullet>Tax and registration calculated differently across quotes</Bullet>
                            </ul>
                        </section>

                        {/* ── Section 2: The Method ── */}
                        <section className="mb-12">
                            <SectionLabel n="02">The Autolitics Offer Comparison Method</SectionLabel>
                            <p className="text-sm text-[#FAF8F5]/50 leading-relaxed mb-5">
                                Most dealership negotiations fail because buyers compare offers informally.< br />The Autolitics method applies a consistent structure so every quote can be evaluated objectively.
                            </p>
                            <div className="space-y-3">
                                <StepCard n="01" title="Request Written Out-the-Door Quotes">
                                    Ask each dealership for a full breakdown including vehicle price, dealer discount, dealer add-ons, fees, taxes, and registration. Never accept verbal-only pricing.
                                </StepCard>
                                <StepCard n="02" title="Enter Quotes Into the Comparison Template">
                                    Input each dealer's offer into the template below. Each column represents one dealership. This structure reveals how each dealer constructed their offer — not just the headline number.
                                </StepCard>
                                <StepCard n="03" title="Compare the Final Out-the-Door Price">
                                    The largest discount does not always mean the lowest total cost. Focus solely on the final out-the-door price to identify the best offer.
                                </StepCard>
                            </div>
                        </section>

                        {/* ── Section 3: Visual Sample ── */}
                        <section className="mb-12">
                            <SectionLabel n="03">Why the Biggest Discount Isn’t Always the Best Deal</SectionLabel>
                            <p className="text-sm text-[#FAF8F5]/50 leading-relaxed mb-5">
                                This example shows three dealers quoting the same vehicle at the same MSRP. Dealer C offers the largest discount — but has the highest out-the-door cost.
                            </p>
                            <SampleTable />
                        </section>

                        {/* ── Section 4: Negotiation Advantage diagram ── */}
                        <section className="mb-12">
                            <SectionLabel n="04">The Autolitics Negotiation Advantage</SectionLabel>
                            <p className="text-sm text-[#FAF8F5]/50 leading-relaxed mb-5">
                                Prepared buyers negotiate differently. Understanding how offers are structured changes the entire dynamic of the conversation.
                            </p>
                            <ComparisonDiagram />
                        </section>

                        {/* ── Printable Comparison Template ── */}
                        <section className="mb-12">
                            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                                <SectionLabel n="05">Comparison Template</SectionLabel>
                                <Link
                                    to="/resources/dealer-offer-comparison/template"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="no-print flex items-center gap-2 text-xs font-semibold text-[#C9A84C] border border-[#C9A84C]/30 px-4 py-2 rounded-full hover:bg-[#C9A84C]/10 transition-colors"
                                >
                                    <Printer size={13} />
                                    Print Template (PDF)
                                </Link>
                            </div>
                            <p className="text-sm text-[#FAF8F5]/50 leading-relaxed mb-6">
                                Use this worksheet to capture and compare quotes from up to four dealerships. Print it and bring it to every dealer conversation, or complete it digitally.
                            </p>
                            <ComparisonTable />
                        </section>

                        {/* ── Summary ── */}
                        <section className="mb-8">
                            <div className="section-card bg-[#14141B] rounded-2xl border border-[#2A2A35] p-7">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center shrink-0">
                                        <ShieldCheck size={18} className="text-[#C9A84C]" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-base text-[#FAF8F5]/90 mb-2">Clarity Removes Pressure</h2>
                                        <p className="text-sm text-[#FAF8F5]/55 leading-relaxed">
                                            When you understand pricing structures, request written offers, and compare multiple dealers using a consistent format, the negotiation process becomes straightforward. The goal is not confrontation — it is a confident, informed purchase.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ── Footer note ── */}
                        <p className="text-xs text-[#FAF8F5]/20 font-['JetBrains_Mono'] text-center">
                            Autolitics Studio · Dealer Offer Comparison Template · studio.autolitics.com
                        </p>
                    </main>
                </div>
            </div>
        </>
    );
}
