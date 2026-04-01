import React from 'react';
import { Link } from 'react-router-dom';
import { usePurchases } from '../../hooks/usePurchases';
import {
    Download,
    Loader2,
    ArrowRight,
} from 'lucide-react';
import { PHASE_RESOURCES } from '../../data/dashboardResourceCatalog';

/** Back-compat for imports from `./Resources` (e.g. older dashboard paths). */
export { PHASE_RESOURCES };

const PhaseSection = ({ phase }) => (
    <div>
        <div className="mb-4">
            <h2 className="text-lg font-semibold tracking-tight text-[#0D0D12]">{phase.label}</h2>
            <p className="text-sm text-[#0D0D12]/50">{phase.description}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
            {phase.items.map((resource) => {
                const Icon = resource.icon;
                return (
                    <Link
                        key={resource.id}
                        to={resource.to}
                        className="flex flex-col bg-white border border-[#0D0D12]/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group"
                    >
                        <div className="h-10 w-10 bg-[#0D0D12]/5 rounded-xl flex items-center justify-center mb-4 text-[#0D0D12] group-hover:bg-[#C9A84C]/10 group-hover:text-[#C9A84C] transition-colors">
                            <Icon size={20} />
                        </div>
                        <h3 className="font-semibold mb-1">{resource.title}</h3>
                        <p className="text-[#0D0D12]/60 text-sm mb-4 flex-1">{resource.description}</p>
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-[#C9A84C] mt-auto w-fit group-hover:gap-3 transition-all">
                            Open <ArrowRight size={14} />
                        </span>
                    </Link>
                );
            })}
        </div>
    </div>
);

const Resources = () => {
    const { loading: purchaseLoading, hasPurchasedGuide, hasPurchasedAdvisory } = usePurchases();

    if (purchaseLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 gap-4 text-[#0D0D12]/50 font-['JetBrains_Mono'] animate-fade-in">
                <Loader2 className="animate-spin text-[#C9A84C]" size={32} />
                Loading toolkit...
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in pb-12">
            <header>
                <h1 className="text-3xl font-semibold tracking-tight mb-2">Resources</h1>
                <p className="text-[#0D0D12]/60 max-w-2xl">
                    Tools and frameworks organized by where you are in the buying process.
                </p>
            </header>

            {/* Phase-grouped built-in resources */}
            {Object.values(PHASE_RESOURCES).map((phase) => (
                <PhaseSection key={phase.label} phase={phase} />
            ))}

            {/* Guide Downloads */}
            <div className="pt-8 border-t border-[#0D0D12]/10">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold tracking-tight mb-1">Guide Downloads</h2>
                    <p className="text-sm text-[#0D0D12]/50">Offline templates included with The Strategic Car Buyer guide.</p>
                </div>

                {!(hasPurchasedGuide || hasPurchasedAdvisory) ? (
                    <div className="bg-white border border-[#0D0D12]/10 rounded-[2rem] p-8 sm:p-12 shadow-sm text-center">
                        <div className="bg-[#0D0D12]/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Download size={32} className="text-[#0D0D12]/30" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Downloads Locked</h3>
                        <p className="text-[#0D0D12]/60 max-w-md mx-auto mb-8">
                            These offline materials are exclusively available to purchasers of the digital guide.
                        </p>
                        <Link to="/guide" className="inline-flex bg-[#0D0D12] text-white px-6 py-3 rounded-full font-medium hover:bg-[#1A1A24] transition-colors items-center gap-2">
                            Purchase Guide
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { title: 'Strategic Buyer Master PDF', type: 'PDF Document' },
                            { title: 'Test Drive Defect Scorecard', type: 'Printable PDF' },
                            { title: 'Vehicle Comparison Matrix', type: 'Spreadsheet (.xlsx)' },
                            { title: 'Dealer Offer Evaluation', type: 'Spreadsheet (.xlsx)' },
                        ].map((item, i) => (
                            <div key={i} className="bg-white border border-[#0D0D12]/10 rounded-2xl p-6 shadow-sm flex flex-col items-start hover:-translate-y-1 transition-transform group">
                                <div className="bg-[#C9A84C]/10 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                                    <Download size={20} className="text-[#C9A84C]" />
                                </div>
                                <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                                <p className="text-xs text-[#0D0D12]/50 font-['JetBrains_Mono'] mb-6 flex-1">{item.type}</p>
                                <button className="w-full py-2.5 rounded-xl border border-[#0D0D12]/10 font-medium text-xs flex items-center justify-center gap-2 group-hover:bg-[#0D0D12] group-hover:text-white transition-colors mt-auto">
                                    <Download size={14} /> Download
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {import.meta.env.VITE_COMMIT_SHA ? (
                <p className="text-[10px] font-['JetBrains_Mono'] text-[#0D0D12]/35 text-center pt-6" title="Git commit this build was produced from">
                    Build {import.meta.env.VITE_COMMIT_SHA.slice(0, 7)}
                </p>
            ) : null}
        </div>
    );
};

export default Resources;
