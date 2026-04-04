import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, ArrowRight, GaugeCircle, BarChart2, Library } from 'lucide-react';
import VehiclePreviewModal from './VehiclePreviewModal';

export default function WorkspaceActivityModule({ workspace }) {
    const [previewVehicle, setPreviewVehicle] = useState(null);

    if (!workspace) return null;

    const hasAny =
        workspace.decisionEngineCount > 0 ||
        workspace.hasScorecard ||
        workspace.hasOfferComparison ||
        workspace.otdQuotes.length > 0;

    if (!hasAny) return null;

    return (
        <div className="mb-8">
            <h3 className="text-xl font-semibold tracking-tight text-[#0D0D12] mb-4">My Research Data</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {workspace.decisionEngineCount > 0 && (
                    <Link
                        to="/resources/vehicle-comparison-matrix"
                        className="bg-white border border-[#0D0D12]/10 rounded-2xl p-5 hover:border-[#C9A84C]/50 transition-colors group flex flex-col justify-between"
                    >
                        <div>
                            <div className="h-10 w-10 bg-[#0D0D12]/5 rounded-xl flex items-center justify-center text-[#0D0D12] group-hover:bg-[#C9A84C]/10 group-hover:text-[#C9A84C] transition-colors mb-3">
                                <Library size={18} />
                            </div>
                            <h4 className="font-semibold text-sm mb-1">Decision Engine</h4>
                            <p className="text-xs text-[#0D0D12]/50 mb-3">
                                {workspace.decisionEngineCount} vehicles compared.
                            </p>
                            {workspace.decisionEngineWinner && (
                                <span
                                    role="button"
                                    tabIndex={0}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setPreviewVehicle(workspace.decisionEngineWinner);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setPreviewVehicle(workspace.decisionEngineWinner);
                                        }
                                    }}
                                    className="bg-[#FAF8F5] px-3 py-2 rounded-lg text-xs font-medium border border-[#0D0D12]/5 truncate text-left w-full hover:border-[#C9A84C]/40 transition-colors cursor-pointer"
                                >
                                    Top score: {workspace.decisionEngineWinner}
                                </span>
                            )}
                        </div>
                        <div className="text-xs font-['JetBrains_Mono'] uppercase tracking-widest text-[#C9A84C] mt-4 flex items-center gap-1">
                            Resume <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                )}

                {workspace.otdQuotes.length > 0 && (
                    <Link
                        to="/resources/out-the-door-calculator"
                        className="bg-white border border-[#0D0D12]/10 rounded-2xl p-5 hover:border-[#C9A84C]/50 transition-colors group flex flex-col justify-between"
                    >
                        <div>
                            <div className="h-10 w-10 bg-[#0D0D12]/5 rounded-xl flex items-center justify-center text-[#0D0D12] group-hover:bg-[#C9A84C]/10 group-hover:text-[#C9A84C] transition-colors mb-3">
                                <Calculator size={18} />
                            </div>
                            <h4 className="font-semibold text-sm mb-1">Saved Quotes</h4>
                            <p className="text-xs text-[#0D0D12]/50 mb-3">
                                {workspace.otdQuotes.length} active quote{workspace.otdQuotes.length > 1 ? 's' : ''} saved.
                            </p>
                            <div className="space-y-1">
                                {workspace.otdQuotes.map((q, idx) => {
                                    const label = q.vehicleLabel || q.formData?.vehicleLabel || 'Custom Quote';
                                    const price = q.quotedOtd ? `$${q.quotedOtd.toLocaleString()}` : '';
                                    return (
                                        <div key={idx} className="bg-[#FAF8F5] px-3 py-2 rounded-lg text-xs font-medium border border-[#0D0D12]/5 truncate flex justify-between gap-2">
                                            <span className="truncate">{label}</span>
                                            {price && <span className="shrink-0">{price}</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="text-xs font-['JetBrains_Mono'] uppercase tracking-widest text-[#C9A84C] mt-4 flex items-center gap-1">
                            Resume <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                )}

                {workspace.hasScorecard && (
                    <Link
                        to="/resources/scorecard"
                        className="bg-white border border-[#0D0D12]/10 rounded-2xl p-5 hover:border-[#C9A84C]/50 transition-colors group flex flex-col justify-between"
                    >
                        <div>
                            <div className="h-10 w-10 bg-[#0D0D12]/5 rounded-xl flex items-center justify-center text-[#0D0D12] group-hover:bg-[#C9A84C]/10 group-hover:text-[#C9A84C] transition-colors mb-3">
                                <GaugeCircle size={18} />
                            </div>
                            <h4 className="font-semibold text-sm mb-1">Test Drive Scorecard</h4>
                            <p className="text-xs text-[#0D0D12]/50 mb-3">
                                {workspace.scorecardCount} entrie{workspace.scorecardCount === 1 ? 's' : 's'} logged.
                            </p>
                            {workspace.recentScorecardTitle && (
                                <span
                                    role="button"
                                    tabIndex={0}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setPreviewVehicle(workspace.recentScorecardTitle);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setPreviewVehicle(workspace.recentScorecardTitle);
                                        }
                                    }}
                                    className="bg-[#FAF8F5] px-3 py-2 rounded-lg text-xs font-medium border border-[#0D0D12]/5 truncate text-left w-full hover:border-[#C9A84C]/40 transition-colors cursor-pointer"
                                >
                                    Latest: {workspace.recentScorecardTitle}
                                </span>
                            )}
                        </div>
                        <div className="text-xs font-['JetBrains_Mono'] uppercase tracking-widest text-[#C9A84C] mt-4 flex items-center gap-1">
                            Resume <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                )}

                {workspace.hasOfferComparison && (
                    <Link
                        to="/resources/dealer-offer-comparison"
                        className="bg-white border border-[#0D0D12]/10 rounded-2xl p-5 hover:border-[#C9A84C]/50 transition-colors group flex flex-col justify-between"
                    >
                        <div>
                            <div className="h-10 w-10 bg-[#0D0D12]/5 rounded-xl flex items-center justify-center text-[#0D0D12] group-hover:bg-[#C9A84C]/10 group-hover:text-[#C9A84C] transition-colors mb-3">
                                <BarChart2 size={18} />
                            </div>
                            <h4 className="font-semibold text-sm mb-1">Offer Comparison</h4>
                            <p className="text-xs text-[#0D0D12]/50 mb-3">
                                {workspace.offerComparisonCount} offer{workspace.offerComparisonCount > 1 ? 's' : ''} drafted.
                            </p>
                            {workspace.recentOfferDealer && (
                                <div className="bg-[#FAF8F5] px-3 py-2 rounded-lg text-xs font-medium border border-[#0D0D12]/5 truncate">
                                    Latest: {workspace.recentOfferDealer}
                                </div>
                            )}
                        </div>
                        <div className="text-xs font-['JetBrains_Mono'] uppercase tracking-widest text-[#C9A84C] mt-4 flex items-center gap-1">
                            Resume <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                )}
            </div>

            {previewVehicle && (
                <VehiclePreviewModal vehicleName={previewVehicle} onClose={() => setPreviewVehicle(null)} />
            )}
        </div>
    );
}
