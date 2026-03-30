import React, { useState, useEffect } from 'react';
import { Printer } from 'lucide-react';
import {
    CATEGORIES,
    CATEGORY_KEYS,
    WEIGHT_MULTIPLIERS,
    MAX_WEIGHT,
    averageScore,
    weightedScore,
    isComplete,
    getWinnerIndex,
    getCategoryLeaders,
    hasQualifiedWinner,
} from './vehicleDecisionEngineModel';

const STORAGE_KEY = 'vehicleDecisionEnginePrint';

const PRINT_STYLES = `
@media print {
    body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .screen-only { display: none !important; }
    .print-radar-page * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .print-radar-page { padding: 0 !important; max-height: none !important; }
    .print-single-page { display: flex !important; flex-wrap: wrap !important; gap: 0.35rem !important; }
    .print-single-page .print-radar-col { width: 48% !important; min-width: 48% !important; }
    .print-single-page .print-details-col { width: 50% !important; min-width: 50% !important; }
    .print-single-page .print-header { width: 100% !important; margin-bottom: 0.25rem !important; padding-bottom: 0.25rem !important; }
    .print-single-page .print-radar-wrap { max-height: 4.2in !important; }
    .print-single-page .print-radar-wrap svg { max-width: 100% !important; max-height: 4in !important; width: auto !important; height: auto !important; }
    .print-single-page section { margin-bottom: 0.35rem !important; }
    .print-single-page h1 { font-size: 14px !important; line-height: 1.2 !important; margin-bottom: 0.15rem !important; }
    .print-single-page h2 { font-size: 11px !important; margin-bottom: 0.2rem !important; }
    .print-single-page .print-text-xs { font-size: 10px !important; }
    .print-single-page .print-reco-box { padding: 0.25rem 0.35rem !important; }
    .print-single-page .print-reco-box p { margin: 0 !important; font-size: 10px !important; line-height: 1.3 !important; }
    .print-single-page .print-footer { margin-top: 0.2rem !important; font-size: 9px !important; }
    .print-single-page { page-break-inside: avoid; }
}
@page { margin: 0.35in; size: letter; }
`;

function RadarSVG({ vehicles, winnerIndex, useWeighted, weights }) {
    const completed = vehicles.filter(isComplete);
    const n = CATEGORIES.length;
    const cx = 200;
    const cy = 200;
    const r = 130;

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

    return (
        <svg viewBox="0 0 400 400" className="w-full max-w-[340px] mx-auto block print:max-w-full" aria-hidden>
            {/* Grid - print-friendly dark on white */}
            {[1, 2, 3, 4, 5].map(level => (
                <polygon
                    key={level}
                    points={gridPoints.map(p => {
                        const scale = (level / 5);
                        return `${cx + (p.x - cx) * scale},${cy + (p.y - cy) * scale}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#333"
                    strokeWidth="0.5"
                    className="print:stroke-gray-400"
                />
            ))}
            {gridPoints.map((p, i) => (
                <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#333" strokeWidth="0.5" className="print:stroke-gray-400" />
            ))}
            {completed.map((vehicle) => {
                const isWinner = vehicle.id === winnerVehicleId;
                const pointsKey = CATEGORY_KEYS.map(k => vehicle.scores[k]).join(',');
                return (
                    <polygon
                        key={`${vehicle.id}-${pointsKey}`}
                        points={polygonPoints(vehicle)}
                        fill={isWinner ? 'rgba(201,168,76,0.35)' : 'rgba(0,0,0,0.08)'}
                        stroke={isWinner ? '#B8860B' : '#666'}
                        strokeWidth={isWinner ? 2.5 : 1.2}
                        className="print:stroke-[#333]"
                    />
                );
            })}
        </svg>
    );
}

export default function VehicleDecisionEnginePrint() {
    const [data, setData] = useState(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed?.vehicles?.length) setData(parsed);
            }
        } finally {
            setLoaded(true);
        }
    }, []);

    const handlePrint = () => window.print(); // eslint-disable-line no-undef

    useEffect(() => {
        document.title = 'Decision Radar & Recommendation — Autolitics Studio';
    }, []);

    if (!loaded) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p className="text-gray-500">Loading…</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
                <p className="text-gray-600 mb-4">No comparison data to print.</p>
                <a href="/resources/vehicle-comparison-matrix" className="text-[#C9A84C] font-semibold hover:underline">
                    Open Vehicle Decision Engine →
                </a>
            </div>
        );
    }

    const { vehicles, weights, useWeighted } = data;
    const winnerIndex = getWinnerIndex(vehicles, useWeighted, weights);
    const categoryLeaders = getCategoryLeaders(vehicles);
    const completedCount = vehicles.filter(isComplete).length;
    const showQualifiedWinner = hasQualifiedWinner(vehicles, useWeighted, weights);
    const winner = showQualifiedWinner && winnerIndex >= 0 ? vehicles[winnerIndex] : null;
    const showNoRecommendation = completedCount >= 2 && !showQualifiedWinner;

    return (
        <>
            <style>{PRINT_STYLES}</style>
            <div className="min-h-screen bg-white text-gray-900 print-radar-page">
                <div className="screen-only fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
                    <span className="text-sm font-medium text-gray-600">Decision Radar & Recommendation</span>
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="flex items-center gap-2 text-sm font-semibold text-white bg-[#C9A84C] hover:bg-[#b8963f] text-gray-900 px-5 py-2.5 rounded-full transition-colors"
                    >
                        <Printer size={16} />
                        Print / Save PDF
                    </button>
                </div>

                <div className="pt-16 print:pt-0 max-w-2xl mx-auto px-6 py-8 print:py-0 print:max-w-none print:px-0 print-single-page">
                    <div className="print-header border-b border-gray-200 pb-4 mb-6 print:border-gray-300">
                        <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1 print:text-gray-600">
                            Autolitics Studio Resource
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">
                            Vehicle Decision Engine — Radar & Recommendation
                        </h1>
                        <p className="text-sm text-gray-500 mt-1 print:text-gray-600">
                            {useWeighted ? 'Priority weighted view' : 'Simple average'}
                        </p>
                    </div>

                    <div className="print-radar-col">
                        <section className="mb-8 print:mb-2">
                            <h2 className="text-sm font-bold text-gray-800 mb-4 print:mb-1">Decision Radar</h2>
                            <div className="print-radar-wrap">
                                <RadarSVG vehicles={vehicles} winnerIndex={winnerIndex} useWeighted={useWeighted} weights={weights} />
                            </div>
                            <div className="mt-4 print:mt-1 flex flex-wrap gap-x-6 gap-y-1 text-sm print:text-xs">
                                {vehicles.filter(isComplete).map((v, i) => {
                                    const isWinner = v.id === (winner?.id);
                                    const avg = useWeighted ? weightedScore(v.scores, weights).toFixed(1) : averageScore(v.scores).toFixed(1);
                                    return (
                                        <span key={v.id} className={`${isWinner ? 'font-semibold text-gray-900' : 'text-gray-600'} print-text-xs`}>
                                            {v.name || `Vehicle ${i + 1}`}: {useWeighted ? 'weighted ' : ''}avg {avg}
                                            {isWinner && ' (Recommended)'}
                                        </span>
                                    );
                                })}
                            </div>
                        </section>
                    </div>

                    <div className="print-details-col">
                        {Object.keys(categoryLeaders).length > 0 && (
                            <section className="mb-8 print:mb-2">
                                <h2 className="text-sm font-bold text-gray-800 mb-3 print:mb-1">Category Leaders</h2>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-sm text-gray-700 print:text-xs">
                                    {CATEGORIES.map(cat => (
                                        <div key={cat.id} className="print-text-xs">
                                            <span className="text-gray-500">{cat.label}:</span>{' '}
                                            <span className="font-medium">{categoryLeaders[cat.id] ?? '—'}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {winner && (
                            <section className="mb-8 print:mb-2 p-4 print:p-2 border-2 border-[#C9A84C] bg-amber-50/50 rounded-lg print-reco-box">
                                <p className="text-[10px] font-mono text-amber-800 uppercase tracking-widest mb-1 print:mb-0">Recommended Vehicle</p>
                                <p className="text-xl font-bold text-gray-900 print:text-sm">{winner.name.trim() || 'Your top choice'}</p>
                                <p className="text-sm text-gray-600 mt-1 print:text-xs">
                                    Strongest overall balance across the eight ownership dimensions in this comparison.
                                </p>
                            </section>
                        )}
                        {showNoRecommendation && (
                            <section className="mb-8 print:mb-2 p-4 print:p-2 border border-gray-300 bg-gray-50 rounded-lg">
                                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1 print:mb-0">No Recommendation</p>
                                <p className="text-sm text-gray-700 print:text-xs">
                                    Currently none of the rated vehicles meet the minimum required score threshold.
                                </p>
                            </section>
                        )}
                    </div>

                    <p className="print-footer w-full text-[10px] font-mono text-gray-400 text-right print:mt-1">
                        Autolitics Studio · Vehicle Decision Engine · studio.autolitics.com
                    </p>
                </div>
            </div>
        </>
    );
}
