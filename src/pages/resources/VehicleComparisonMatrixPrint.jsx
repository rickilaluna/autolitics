import React, { useEffect } from 'react';
import { Printer } from 'lucide-react';

const VEHICLES = ['Vehicle A', 'Vehicle B', 'Vehicle C', 'Vehicle D'];

const MATRIX_ROWS = [
    'Driving Experience',
    'Interior Quality',
    'Technology',
    'Practicality',
    'Efficiency',
    'Reliability',
    'Design',
    'Ownership Cost',
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

export default function VehicleComparisonMatrixPrint() {
    const handlePrint = () => window.print(); // eslint-disable-line no-undef

    useEffect(() => {
        document.title = 'Vehicle Comparison Matrix — Autolitics Studio';
    }, []);

    return (
        <>
            <style>{PRINT_STYLES}</style>
            <div className="min-h-screen bg-white text-[#1a1a1a] font-sans antialiased">
                <div className="screen-only fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
                    <div className="text-sm font-medium text-gray-600">
                        Vehicle Comparison Matrix
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

                <div className="print-template-page pt-20 print:pt-0 max-w-[11in] mx-auto px-6 py-8 print:py-0 print:px-0">
                    <div className="mb-6 print:mb-4 border-b border-gray-200 print:border-gray-300 pb-4 print:pb-3">
                        <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1 print:text-gray-500">
                            Autolitics Studio Resource
                        </div>
                        <h1 className="text-xl print:text-lg font-bold text-[#1a1a1a] tracking-tight">
                            Vehicle Comparison Matrix
                        </h1>
                        <p className="text-xs text-gray-500 mt-1">
                            Rate each vehicle 1–5 or add notes. Compare across dimensions to identify the strongest overall choice.
                        </p>
                    </div>

                    <div className="overflow-x-auto print:overflow-visible">
                        <table className="w-full text-sm print:text-xs border-collapse">
                            <thead>
                                <tr>
                                    <th className="text-left px-3 py-2 bg-gray-100 text-gray-600 font-mono text-[10px] uppercase tracking-wider border border-gray-300 w-36 print:py-1.5 print:px-2">
                                        Category
                                    </th>
                                    {VEHICLES.map(v => (
                                        <th key={v} className="px-3 py-2 bg-gray-100 text-[#1a1a1a] font-mono text-[10px] uppercase tracking-wider border border-gray-300 text-center min-w-[6rem] print:py-1.5 print:px-2">
                                            {v}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {MATRIX_ROWS.map((row, i) => (
                                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                        <td className="border border-gray-300 px-3 py-2 print:py-1.5 font-mono text-[10px] text-gray-700 whitespace-nowrap">
                                            {row}
                                        </td>
                                        {VEHICLES.map(v => (
                                            <td key={v} className="border border-gray-300 text-center text-gray-400 py-2 print:py-1.5 px-2 min-h-[2rem]">
                                                {' '}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 print:mt-4 pt-4 border-t border-gray-200 space-y-3">
                        <div className="grid grid-cols-1 gap-2">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider w-28 shrink-0">Overall Winner</span>
                                <div className="flex-1 border-b border-gray-300 h-5 print:h-4" />
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider w-28 shrink-0 pt-1">Overall Impression</span>
                                <div className="flex-1 border-b border-gray-300 min-h-[2.5rem] print:min-h-[2rem]" />
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider w-28 shrink-0 pt-1">Decision Notes</span>
                                <div className="flex-1 border-b border-gray-300 min-h-[2.5rem] print:min-h-[2rem]" />
                            </div>
                        </div>
                    </div>

                    <p className="text-[10px] font-mono text-gray-400 mt-6 print:mt-4 text-right print:text-gray-500">
                        Autolitics Studio · Vehicle Comparison Matrix · studio.autolitics.com
                    </p>
                </div>
            </div>
        </>
    );
}
