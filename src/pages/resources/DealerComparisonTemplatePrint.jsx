import React, { useEffect } from 'react';
import { Printer } from 'lucide-react';

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

const PRINT_STYLES = `
@media print {
    body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .screen-only { display: none !important; }
    .print-template-page { box-shadow: none !important; padding: 0 !important; }
}
@page {
    margin: 0.5in;
    size: letter landscape;
}
`;

export default function DealerComparisonTemplatePrint() {
    const handlePrint = () => window.print(); // eslint-disable-line no-undef

    useEffect(() => {
        document.title = 'Dealer Offer Comparison Template — Autolitics Studio';
    }, []);

    return (
        <>
            <style>{PRINT_STYLES}</style>
            <div className="min-h-screen bg-white text-[#1a1a1a] font-sans antialiased">
                {/* Screen-only: toolbar */}
                <div className="screen-only fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
                    <div className="text-sm font-medium text-gray-600">
                        Dealer Offer Comparison Template
                    </div>
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="flex items-center gap-2 text-sm font-semibold text-white bg-[#C9A84C] hover:bg-[#b8963f] text-[#1a1a1a] px-5 py-2.5 rounded-full transition-colors"
                    >
                        <Printer size={16} />
                        Print / Save PDF
                    </button>
                </div>

                {/* Content: same layout on screen and in print */}
                <div className="print-template-page pt-20 print:pt-0 max-w-[11in] mx-auto px-6 py-8 print:py-0 print:px-0">
                    {/* Title block — prints at top */}
                    <div className="mb-8 print:mb-6 border-b border-gray-200 print:border-gray-300 pb-6 print:pb-4">
                        <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1 print:text-gray-500">
                            Autolitics Studio Resource
                        </div>
                        <h1 className="text-2xl print:text-xl font-bold text-[#1a1a1a] tracking-tight">
                            Dealer Offer Comparison Template
                        </h1>
                        <p className="text-sm text-gray-500 mt-1 print:text-xs">
                            Compare quotes from up to four dealerships. Fill in each column and compare the out-the-door price.
                        </p>
                    </div>

                    {/* Table — landscape-optimized, same columns/rows */}
                    <div className="overflow-x-auto print:overflow-visible">
                        <table className="w-full text-sm print:text-xs border-collapse">
                            <thead>
                                <tr>
                                    <th className="text-left px-3 py-2.5 bg-gray-100 text-gray-600 font-mono text-[10px] uppercase tracking-wider border border-gray-300 w-36 print:py-2 print:px-2">
                                        Line Item
                                    </th>
                                    {DEALERS.map(d => (
                                        <th key={d} className="px-3 py-2.5 bg-gray-100 text-[#1a1a1a] font-mono text-[10px] uppercase tracking-wider border border-gray-300 text-center min-w-[7rem] print:py-2 print:px-2">
                                            {d}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {TABLE_ROWS.map((row, i) => (
                                    <tr key={i} className={row.bold ? 'bg-amber-50/80 print:bg-gray-50' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                        <td
                                            className={`border border-gray-300 px-3 print:px-2 whitespace-nowrap ${
                                                row.tall ? 'py-6 print:py-4' : 'py-2.5 print:py-2'
                                            } ${
                                                row.bold
                                                    ? 'font-bold text-[#1a1a1a] font-mono uppercase tracking-wide text-[10px]'
                                                    : row.accent
                                                        ? 'font-semibold text-gray-800 font-mono'
                                                        : 'text-gray-600 font-mono text-[10px]'
                                            }`}
                                        >
                                            {row.label}
                                        </td>
                                        {DEALERS.map(d => (
                                            <td
                                                key={d}
                                                className={`border border-gray-300 text-center ${row.bold ? 'font-bold text-[#1a1a1a]' : 'text-gray-400'} ${
                                                    row.tall ? 'py-6 print:py-4' : 'py-2.5 print:py-2'
                                                } px-2 print:px-1`}
                                            >
                                                {' '}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <p className="text-[10px] font-mono text-gray-400 mt-6 print:mt-4 text-right print:text-gray-500">
                        Autolitics Studio · Dealer Offer Comparison Template · studio.autolitics.com
                    </p>
                </div>
            </div>
        </>
    );
}
