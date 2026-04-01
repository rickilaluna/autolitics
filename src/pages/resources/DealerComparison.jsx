import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Printer, ShieldCheck, Copy, Check } from 'lucide-react';
import ResourcePageShell from '../../components/ResourcePageShell';
import DealerComparisonInteractive from '../../components/resources/DealerComparisonInteractive';

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
    .comparison-interactive-root .no-print { display: none !important; }
}
@page { margin: 0.6in; size: letter landscape; }
`;

const SECTION_SCROLL = 'scroll-mt-28';

/* ─── Helpers ───────────────────────────────────────────────────── */
const SectionLabel = ({ n, id, children }) => (
    <div id={id} className={`relative mb-6 ${SECTION_SCROLL}`}>
        {n && (
            <span className="block text-[10px] font-['JetBrains_Mono'] text-[#C9A84C]/50 uppercase tracking-[0.25em] mb-2">{n}</span>
        )}
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{children}</h2>
    </div>
);

const Bullet = ({ children }) => (
    <li className="flex items-start gap-3 text-sm text-[#FAF8F5]/60">
        <span className="w-1 h-1 rounded-full bg-[#C9A84C]/70 mt-2 shrink-0" />
        <span>{children}</span>
    </li>
);

const StepCard = ({ n, title, children }) => (
    <div className="section-card flex gap-6 bg-[#14141B] rounded-2xl border border-[#2A2A35] px-6 py-5 border-l-2 border-l-[#C9A84C]/30">
        <span className="text-[10px] font-['JetBrains_Mono'] text-[#C9A84C]/40 uppercase tracking-widest pt-0.5 shrink-0 w-5">{n}</span>
        <div>
            <h3 className="font-semibold text-base text-[#FAF8F5]/90 mb-1.5">{title}</h3>
            <p className="text-sm text-[#FAF8F5]/55 leading-relaxed">{children}</p>
        </div>
    </div>
);

const ON_PAGE_LINKS = [
    { href: '#what-otd-means', label: 'What OTD Means' },
    { href: '#why-comparison-is-difficult', label: 'Why Comparison Is Difficult' },
    { href: '#the-autolitics-method', label: 'The Autolitics Method' },
    { href: '#compare-real-dealer-quotes', label: 'Compare Real Dealer Quotes' },
    { href: '#financing-apr-evaluation', label: 'Financing & APR Evaluation' },
    { href: '#worksheet', label: 'Worksheet' },
    { href: '#key-takeaway', label: 'Key Takeaway' },
];

const ON_PAGE_BULLETS = [
    'Understand what an out-the-door price includes',
    'Learn why discounts can mislead',
    'Evaluate financing and promotional APR offers',
    'Compare dealer quotes with the interactive tool',
    'Download a worksheet to standardize offers',
];

/* ─── Comparison diagram ───────────────────────────────────────── */
const rows = [
    { typical: 'Negotiates on monthly payment', strategic: 'Negotiates on total vehicle price' },
    { typical: 'Contacts one dealership', strategic: 'Requests quotes from 3–5 dealers' },
    { typical: 'Accepts verbal pricing', strategic: 'Requests written out-the-door quotes' },
    { typical: 'Decides same day under pressure', strategic: 'Takes deliberate time to compare' },
    { typical: 'Focuses on discount amount', strategic: 'Compares total out-the-door cost' },
];

const ComparisonDiagram = () => (
    <div className="comparison-grid section-card bg-[#14141B] rounded-2xl border border-[#2A2A35] overflow-hidden">
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

/* ─── Sample preview table ─────────────────────────────────────── */
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
            Dealer B has the lowest OTD price despite the smallest headline discount. Dealer C&apos;s large discount is erased by fees and add-ons.
        </p>
    </div>
);

const DEALER_SCRIPT = 'Can you send me the full itemized out-the-door price, including all fees and add-ons?';

export default function DealerComparison() {
    const [copied, setCopied] = useState(false);

    const handlePrint = () => window.print();

    const copyScript = async () => {
        try {
            await navigator.clipboard.writeText(DEALER_SCRIPT);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            /* ignore */
        }
    };

    return (
        <>
            <style>{PRINT_STYLES}</style>

            <ResourcePageShell navTitle="Dealer Offer Comparison" maxWidth="7xl" mainClassName="md:px-6 !pb-24">
                        <div className="no-print flex justify-end mb-10">
                            <button
                                type="button"
                                onClick={handlePrint}
                                className="studio-touch-btn flex items-center justify-center gap-2 text-sm font-semibold text-[#0D0D12] bg-[#C9A84C] px-5 rounded-full hover:scale-[1.03] transition-transform duration-300 sm:py-2.5"
                                style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
                            >
                                <Printer size={15} />
                                Print / Save PDF
                            </button>
                        </div>

                        {/* Hero */}
                        <section className="mb-10 print-page">
                            <div className="inline-flex items-center gap-2 text-[10px] font-['JetBrains_Mono'] text-[#C9A84C]/60 uppercase tracking-widest mb-4 border border-[#C9A84C]/20 px-3 py-1 rounded-full">
                                Autolitics Studio Resource
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
                                Dealer Offer<br />
                                <span className="font-['Playfair_Display'] italic text-[#C9A84C]">Comparison Template</span>
                            </h1>
                            <p className="text-lg text-[#FAF8F5]/55 max-w-3xl leading-relaxed">
                                Compare dealer quotes with confidence. Understand out-the-door pricing, identify hidden extras, evaluate financing offers, use the comparison tool, and download a clean worksheet.
                            </p>
                        </section>

                        {/* On This Page */}
                        <section className={`mb-12 ${SECTION_SCROLL}`} aria-labelledby="on-this-page-heading">
                            <div className="section-card bg-[#14141B] rounded-2xl border border-[#2A2A35] p-6 md:p-8">
                                <h2 id="on-this-page-heading" className="text-lg font-semibold text-[#FAF8F5]/90 mb-4">
                                    On This Page
                                </h2>
                                <ul className="space-y-2 mb-8 text-sm text-[#FAF8F5]/60">
                                    {ON_PAGE_BULLETS.map((line) => (
                                        <li key={line} className="flex items-start gap-2">
                                            <span className="text-[#C9A84C]/80 mt-0.5">·</span>
                                            <span>{line}</span>
                                        </li>
                                    ))}
                                </ul>
                                <nav aria-label="In-page navigation">
                                    <p className="text-[10px] font-['JetBrains_Mono'] text-[#C9A84C]/50 uppercase tracking-widest mb-3">Jump to section</p>
                                    <ul className="flex flex-wrap gap-2">
                                        {ON_PAGE_LINKS.map(({ href, label }) => (
                                            <li key={href}>
                                                <a
                                                    href={href}
                                                    className="inline-block text-xs font-medium text-[#C9A84C] border border-[#C9A84C]/25 rounded-full px-3 py-1.5 hover:bg-[#C9A84C]/10 transition-colors"
                                                >
                                                    {label}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </nav>
                            </div>
                        </section>

                        {/* What OTD Means */}
                        <section className="mb-12">
                            <SectionLabel id="what-otd-means">What &ldquo;Out-the-Door&rdquo; Actually Means</SectionLabel>
                            <div className="section-card bg-[#14141B] rounded-2xl border border-[#2A2A35] p-6 md:p-8 space-y-6">
                                <p className="text-sm text-[#FAF8F5]/70 leading-relaxed">
                                    The only number that matters when comparing dealer offers is the full out-the-door price.
                                </p>
                                <div>
                                    <h3 className="text-xs font-['JetBrains_Mono'] text-[#C9A84C]/70 uppercase tracking-widest mb-3">A clean total includes</h3>
                                    <ul className="space-y-2">
                                        <Bullet>Vehicle price (MSRP or negotiated price, incl. destination)</Bullet>
                                        <Bullet>Sales tax</Bullet>
                                        <Bullet>DMV / registration</Bullet>
                                        <Bullet>Documentation fee</Bullet>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-xs font-['JetBrains_Mono'] text-[#FAF8F5]/40 uppercase tracking-widest mb-3">It should not include</h3>
                                    <ul className="space-y-2">
                                        <Bullet>Market adjustments</Bullet>
                                        <Bullet>Add-ons or protection packages</Bullet>
                                        <Bullet>VIN etching, nitrogen, tint</Bullet>
                                        <Bullet>Vague dealer fees</Bullet>
                                    </ul>
                                </div>
                                <p className="text-sm text-[#FAF8F5]/55 border-t border-[#2A2A35] pt-6">
                                    If it is not the vehicle or a required government fee, it should be questioned.
                                </p>
                            </div>
                        </section>

                        {/* Why comparison is difficult */}
                        <section className="mb-12">
                            <SectionLabel n="01" id="why-comparison-is-difficult">Why Offer Comparison Is Difficult</SectionLabel>
                            <p className="text-sm text-[#FAF8F5]/50 leading-relaxed mb-2 max-w-3xl">
                                Two quotes with the same vehicle price can differ by thousands once fees, add-ons, and incentives are included. Dealership offers are built for negotiation — not side-by-side clarity.
                            </p>
                            <p className="text-sm text-[#FAF8F5]/50 leading-relaxed mb-5 max-w-3xl">
                                Autolitics buyers line everything up using the <span className="text-[#C9A84C] font-semibold">out-the-door price</span> — the amount that should match your purchase contract.
                            </p>
                            <ul className="space-y-3">
                                <Bullet>Different documentation fees — often $0 to $1,200+ depending on dealership</Bullet>
                                <Bullet>Dealer-installed accessories bundled without clear disclosure</Bullet>
                                <Bullet>Incentives applied differently — or not shown the same way</Bullet>
                                <Bullet>Financing incentives folded into vehicle price</Bullet>
                                <Bullet>Tax and registration estimated or calculated differently across quotes</Bullet>
                            </ul>
                        </section>

                        {/* Autolitics method */}
                        <section className="mb-12">
                            <SectionLabel n="02" id="the-autolitics-method">The Autolitics Offer Comparison Method</SectionLabel>
                            <p className="text-sm text-[#FAF8F5]/50 leading-relaxed mb-5 max-w-3xl">
                                Informal comparisons fail because line items don&apos;t match. Use one structure for every quote so you can judge offers objectively.
                            </p>
                            <div className="space-y-3">
                                <StepCard n="01" title="Request Written Out-the-Door Quotes">
                                    Ask each dealership for a full breakdown: vehicle price, discount, add-ons, fees, taxes, and registration. Avoid verbal-only pricing.
                                </StepCard>
                                <StepCard n="02" title="Enter Quotes Into the Comparison Tool or Worksheet">
                                    Use the interactive tool below or the printable worksheet. Each column is one dealer — you&apos;ll see how each offer was built, not just the headline.
                                </StepCard>
                                <StepCard n="03" title="Compare the Final Out-the-Door Price">
                                    The largest discount is not always the lowest total. Decide on the clean out-the-door total, then validate financing separately.
                                </StepCard>
                            </div>
                        </section>

                        {/* Example + sample table */}
                        <section className="mb-12">
                            <SectionLabel n="03">Why the Biggest Discount Isn&apos;t Always the Best Deal</SectionLabel>
                            <p className="text-sm text-[#FAF8F5]/50 leading-relaxed mb-5 max-w-3xl">
                                Same MSRP, three dealers — Dealer C shows the largest discount but the highest out-the-door cost.
                            </p>
                            <div className="section-card border border-[#C9A84C]/25 bg-[#C9A84C]/[0.06] rounded-2xl px-5 py-4 mb-5">
                                <h3 className="text-sm font-semibold text-[#C9A84C] mb-2">Example Insight</h3>
                                <p className="text-sm text-[#FAF8F5]/70 leading-relaxed">
                                    The largest discount does not guarantee the best deal. Fees, add-ons, and financing can change the final cost significantly.
                                </p>
                            </div>
                            <SampleTable />
                        </section>

                        {/* Negotiation diagram */}
                        <section className="mb-12">
                            <SectionLabel n="04">The Autolitics Negotiation Advantage</SectionLabel>
                            <p className="text-sm text-[#FAF8F5]/50 leading-relaxed mb-5 max-w-3xl">
                                When you know how offers are structured, the conversation changes — you&apos;re comparing totals, not slogans.
                            </p>
                            <ComparisonDiagram />
                        </section>

                        {/* Interactive comparison */}
                        <section className="mb-12">
                            <SectionLabel n="05" id="compare-real-dealer-quotes">Compare Real Dealer Quotes</SectionLabel>
                            <p className="text-sm text-[#FAF8F5]/50 leading-relaxed mb-6 max-w-3xl">
                                Enter dealer quotes to see which offer is truly lowest once tax, fees, and extras are accounted for.
                            </p>
                            <div className="section-card bg-[#14141B] rounded-2xl border border-[#2A2A35] p-6 mb-6">
                                <h3 className="text-sm font-semibold text-[#FAF8F5]/90 mb-3">How to Read the Difference</h3>
                                <p className="text-xs text-[#FAF8F5]/45 font-['JetBrains_Mono'] uppercase tracking-wider mb-3">Variance (quoted OTD vs. clean estimate)</p>
                                <ul className="space-y-2 mb-4">
                                    <Bullet><span className="text-[#FAF8F5]/80">$0–$500</span> — normal variation</Bullet>
                                    <Bullet><span className="text-[#FAF8F5]/80">$500–$1,500</span> — review closely</Bullet>
                                    <Bullet><span className="text-[#FAF8F5]/80">$1,500+</span> — likely markup or add-ons</Bullet>
                                </ul>
                                <p className="text-sm text-[#FAF8F5]/55 border-t border-[#2A2A35] pt-4">
                                    Focus on the clean total, not the advertised price.
                                </p>
                            </div>
                            <DealerComparisonInteractive embedInPage />
                        </section>

                        {/* Financing */}
                        <section className="mb-12">
                            <SectionLabel n="06" id="financing-apr-evaluation">Financing &amp; APR: When the Math Changes</SectionLabel>
                            <div className="section-card bg-[#14141B] rounded-2xl border border-[#2A2A35] p-6 md:p-8 space-y-6">
                                <p className="text-sm text-[#FAF8F5]/60 leading-relaxed">
                                    Some offers include manufacturer-supported promotional interest rates that are lower than market rates. These can materially change the true cost of the vehicle.
                                </p>
                                <div>
                                    <h3 className="text-xs font-['JetBrains_Mono'] text-[#C9A84C]/70 uppercase tracking-widest mb-3">To evaluate financing properly</h3>
                                    <ul className="space-y-2">
                                        <Bullet>Compare total cost of ownership, not just monthly payment</Bullet>
                                        <Bullet>A higher vehicle price with a low APR may cost less overall</Bullet>
                                        <Bullet>A lower price with a high APR can erase upfront savings</Bullet>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-xs font-['JetBrains_Mono'] text-[#FAF8F5]/40 uppercase tracking-widest mb-3">Rule of thumb — always evaluate</h3>
                                    <ul className="space-y-2">
                                        <Bullet>Out-the-door price</Bullet>
                                        <Bullet>Interest rate (APR)</Bullet>
                                        <Bullet>Loan term</Bullet>
                                        <Bullet>Total paid over the life of the loan</Bullet>
                                    </ul>
                                </div>
                                <p className="text-sm text-[#FAF8F5]/55 border-t border-[#2A2A35] pt-6">
                                    The best deal is the lowest total cost—not the lowest price or the lowest payment alone.
                                </p>
                            </div>
                        </section>

                        {/* What to do next */}
                        <section id="what-to-do-next" className={`mb-12 ${SECTION_SCROLL}`}>
                            <SectionLabel>What to Do Next</SectionLabel>
                            <div className="section-card bg-[#14141B] rounded-2xl border border-[#2A2A35] p-6 md:p-8 space-y-6">
                                <ul className="space-y-2">
                                    <Bullet>Request a fully itemized out-the-door quote</Bullet>
                                    <Bullet>Remove all add-ons and dealer extras</Bullet>
                                    <Bullet>Compare at least 3 written offers</Bullet>
                                </ul>
                                <div>
                                    <p className="text-xs font-['JetBrains_Mono'] text-[#FAF8F5]/40 uppercase tracking-widest mb-2">Dealer script (copyable)</p>
                                    <div className="flex flex-col sm:flex-row sm:items-stretch gap-2">
                                        <p className="flex-1 text-sm text-[#FAF8F5]/75 bg-[#0D0D12] border border-[#2A2A35] rounded-xl px-4 py-3 font-['JetBrains_Mono'] leading-relaxed">
                                            {DEALER_SCRIPT}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={copyScript}
                                            className="no-print inline-flex items-center justify-center gap-2 shrink-0 text-xs font-semibold text-[#0D0D12] bg-[#C9A84C] px-4 py-3 rounded-xl hover:opacity-90 transition-opacity"
                                        >
                                            {copied ? <Check size={16} /> : <Copy size={16} />}
                                            {copied ? 'Copied' : 'Copy'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Worksheet */}
                        <section className="mb-12">
                            <div id="worksheet" className={`flex items-center justify-between mb-5 flex-wrap gap-3 ${SECTION_SCROLL}`}>
                                <SectionLabel n="07">Download the Comparison Worksheet</SectionLabel>
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
                            <p className="text-sm text-[#FAF8F5]/50 leading-relaxed mb-6 max-w-3xl">
                                Use this worksheet to standardize every quote and compare dealers on equal terms. Bring it into dealer conversations or complete it after collecting written offers.
                            </p>
                            <ComparisonTable />
                        </section>

                        {/* Key takeaway */}
                        <section id="key-takeaway" className={`mb-8 ${SECTION_SCROLL}`}>
                            <div className="section-card bg-[#14141B] rounded-2xl border border-[#2A2A35] p-7">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center shrink-0">
                                        <ShieldCheck size={18} className="text-[#C9A84C]" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-lg text-[#FAF8F5]/90 mb-2">Clarity Removes Pressure</h2>
                                        <p className="text-sm text-[#FAF8F5]/55 leading-relaxed">
                                            When quotes are standardized and itemized, the dealership process becomes easier to navigate. The buyer with the clearest numbers makes the strongest decision.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <p className="text-xs text-[#FAF8F5]/20 font-['JetBrains_Mono'] text-center">
                            Autolitics Studio · Dealer Offer Comparison Template · studio.autolitics.com
                        </p>
            </ResourcePageShell>
        </>
    );
}
