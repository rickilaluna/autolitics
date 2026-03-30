import React from 'react';
import {
    SPEC_GROUPS,
    SPEC_FIELDS,
    getSpecDisplayValue,
    compareNumericValues,
} from '../data/modelComparisonSpecs';

const alignmentClass = {
    best: 'text-emerald-400 font-medium',
    mid: 'text-amber-400',
    worst: 'text-amber-600',
    default: 'text-[#FAF8F5]/90',
};

/**
 * Portable table that compares key specs across up to 3 vehicles.
 * vehicles: Array<{ label: string, data: Record<string, unknown> }>
 * Uses green (best) / amber (mid) / orange (worst) for numeric specs where applicable.
 */
export default function SpecComparisonTable({ vehicles = [], className = '' }) {
    if (vehicles.length === 0) {
        return (
            <p className="text-[#FAF8F5]/50 text-sm py-8 text-center">
                Select up to 3 models to compare.
            </p>
        );
    }

    return (
        <div className={className}>
            <h2 className="text-lg font-bold text-[#FAF8F5]/90 mb-4">Key specifications</h2>
            <div className="rounded-xl border border-[#2A2A35] bg-[#14141B] overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 z-10 bg-[#14141B] shadow-[0_2px_0_0_rgba(42,42,53,0.5)]">
                        <tr className="border-b border-[#2A2A35]">
                            <th className="py-3 px-4 font-semibold text-[#FAF8F5]/70 w-48 bg-[#14141B]">Specification</th>
                            {vehicles.map((v, i) => (
                                <th key={i} className="py-3 px-4 font-semibold text-[#FAF8F5]/90 bg-[#14141B]">
                                    {v.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {SPEC_GROUPS.map((group) => {
                            const fields = SPEC_FIELDS.filter((f) => f.group === group.id);
                            if (fields.length === 0) return null;
                            return (
                                <React.Fragment key={group.id}>
                                    <tr className="bg-[#1A1A24]/50">
                                        <td
                                            colSpan={vehicles.length + 1}
                                            className="py-2 px-4 text-xs font-semibold text-[#C9A84C]/80 uppercase tracking-wider"
                                        >
                                            {group.label}
                                        </td>
                                    </tr>
                                    {fields.map((field) => {
                                        const values = vehicles.map((v) => v.data[field.key]);
                                        const hasNumeric = field.higherIsBetter !== undefined;
                                        const alignments = hasNumeric
                                            ? compareNumericValues(values, field.higherIsBetter)
                                            : values.map(() => 'default');
                                        return (
                                            <tr
                                                key={field.key}
                                                className="border-b border-[#2A2A35]/50 last:border-0"
                                            >
                                                <td className="py-2.5 px-4 text-[#FAF8F5]/70">
                                                    {field.label}
                                                </td>
                                                {vehicles.map((v, i) => (
                                                    <td
                                                        key={i}
                                                        className={`py-2.5 px-4 ${alignmentClass[alignments[i]]}`}
                                                    >
                                                        {getSpecDisplayValue(v.data, field)}
                                                    </td>
                                                ))}
                                            </tr>
                                        );
                                    })}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className="flex flex-wrap gap-6 mt-4 text-xs text-[#FAF8F5]/50">
                <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> Strong alignment / best
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" /> Acceptable tradeoff
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-600" /> Moderate risk / worst
                </span>
            </div>
        </div>
    );
}
