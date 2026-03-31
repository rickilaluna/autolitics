import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { PHASE_RESOURCES, RESOURCE_HUB_PATH, getAllCatalogItems } from '../../data/dashboardResourceCatalog';

/**
 * Surfaces Resources IP across dashboard tabs.
 *
 * @param {'compact' | 'grouped' | 'workspace'} variant
 * @param {'strategy' | 'evaluate' | 'negotiate' | null} emphasizePhase — subtle ring on matching items (compact/grouped)
 */
export default function ResourceHubCrosslinks({ variant = 'compact', emphasizePhase = null, className = '' }) {
    const all = getAllCatalogItems();

    if (variant === 'compact') {
        return (
            <div className={`bg-white border border-[#0D0D12]/10 rounded-[2rem] p-6 md:p-8 shadow-sm ${className}`}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
                    <div>
                        <h3 className="text-sm font-['JetBrains_Mono'] text-[#0D0D12]/40 uppercase tracking-widest mb-1">
                            Toolkit & frameworks
                        </h3>
                        <p className="text-sm text-[#0D0D12]/55 max-w-xl">
                            Same library as{' '}
                            <Link to={RESOURCE_HUB_PATH} className="text-[#C9A84C] font-medium hover:underline">
                                Resources
                            </Link>
                            — use these anytime alongside your advisory workflow.
                        </p>
                    </div>
                    <Link
                        to={RESOURCE_HUB_PATH}
                        className="inline-flex items-center gap-2 shrink-0 text-sm font-semibold text-[#0D0D12] bg-[#FAF8F5] border border-[#0D0D12]/15 px-4 py-2.5 rounded-xl hover:border-[#C9A84C]/50 transition-colors"
                    >
                        <BookOpen size={16} className="text-[#C9A84C]" />
                        Full library
                        <ArrowRight size={14} />
                    </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    {all.map((item) => {
                        const Icon = item.icon;
                        const em = emphasizePhase && item.phaseKey === emphasizePhase;
                        return (
                            <Link
                                key={item.id}
                                to={item.to}
                                className={`flex flex-col gap-2 p-3 rounded-xl border transition-colors text-left ${
                                    em
                                        ? 'border-[#C9A84C]/50 bg-[#C9A84C]/5'
                                        : 'border-[#0D0D12]/10 bg-[#FAF8F5]/50 hover:border-[#C9A84C]/40'
                                }`}
                            >
                                <Icon size={18} className="text-[#C9A84C] shrink-0" />
                                <span className="text-xs font-semibold text-[#0D0D12] leading-snug line-clamp-3">{item.title}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (variant === 'grouped') {
        return (
            <div className={`space-y-8 ${className}`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h3 className="text-lg font-semibold text-[#0D0D12]">Frameworks & calculators</h3>
                        <p className="text-sm text-[#0D0D12]/50">From your Resources library — organized by buying phase.</p>
                    </div>
                    <Link
                        to={RESOURCE_HUB_PATH}
                        className="inline-flex items-center gap-2 text-sm font-medium text-[#C9A84C] hover:text-[#0D0D12]"
                    >
                        Open full Resources <ArrowRight size={14} />
                    </Link>
                </div>
                {Object.entries(PHASE_RESOURCES).map(([key, phase]) => (
                    <div key={key}>
                        <h4 className="text-xs font-['JetBrains_Mono'] text-[#0D0D12]/45 uppercase tracking-widest mb-2">{phase.label}</h4>
                        <p className="text-xs text-[#0D0D12]/45 mb-3">{phase.description}</p>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {phase.items.map((resource) => {
                                const Icon = resource.icon;
                                const em = emphasizePhase === key;
                                return (
                                    <Link
                                        key={resource.id}
                                        to={resource.to}
                                        className={`flex gap-4 p-4 rounded-2xl border transition-colors ${
                                            em
                                                ? 'border-[#C9A84C]/40 bg-[#C9A84C]/5'
                                                : 'border-[#0D0D12]/10 bg-white hover:border-[#C9A84C]/40'
                                        }`}
                                    >
                                        <div className="h-10 w-10 rounded-xl bg-[#0D0D12]/5 flex items-center justify-center shrink-0 text-[#0D0D12]">
                                            <Icon size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-sm text-[#0D0D12] mb-0.5">{resource.title}</p>
                                            <p className="text-xs text-[#0D0D12]/50 line-clamp-2">{resource.description}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // workspace — tuned copy for My Search
    if (variant === 'workspace') {
        return (
            <div className={`bg-[#0D0D12] text-[#FAF8F5] rounded-[2rem] p-6 md:p-8 border border-[#2A2A35] ${className}`}>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-sm font-['JetBrains_Mono'] text-[#C9A84C]/80 uppercase tracking-widest mb-2">
                            Resources to use with this workspace
                        </h3>
                        <p className="text-sm text-[#FAF8F5]/55 max-w-2xl">
                            Pair submissions below with the public tools and frameworks in Resources — same IP your advisor references.
                        </p>
                    </div>
                    <Link
                        to={RESOURCE_HUB_PATH}
                        className="inline-flex items-center gap-2 shrink-0 text-sm font-semibold text-[#0D0D12] bg-[#C9A84C] px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
                    >
                        <BookOpen size={16} />
                        Browse Resources
                    </Link>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-[#2A2A35] bg-[#14141B] p-4">
                        <p className="text-[10px] font-['JetBrains_Mono'] text-[#C9A84C]/60 uppercase tracking-widest mb-2">Before / during search</p>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link className="text-[#FAF8F5]/85 hover:text-[#C9A84C]" to="/resources/playbook">
                                    Autolitics Playbook →
                                </Link>
                            </li>
                            <li>
                                <Link className="text-[#FAF8F5]/85 hover:text-[#C9A84C]" to="/resources/buying-framework">
                                    Buying framework →
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="rounded-2xl border border-[#2A2A35] bg-[#14141B] p-4">
                        <p className="text-[10px] font-['JetBrains_Mono'] text-[#C9A84C]/60 uppercase tracking-widest mb-2">Listings & test drives</p>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link className="text-[#FAF8F5]/85 hover:text-[#C9A84C]" to="/resources/scorecard">
                                    Evaluation scorecard →
                                </Link>
                            </li>
                            <li>
                                <Link className="text-[#FAF8F5]/85 hover:text-[#C9A84C]" to="/resources/vehicle-comparison-matrix">
                                    Vehicle Decision Engine →
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="rounded-2xl border border-[#2A2A35] bg-[#14141B] p-4">
                        <p className="text-[10px] font-['JetBrains_Mono'] text-[#C9A84C]/60 uppercase tracking-widest mb-2">Quotes & closing</p>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link className="text-[#FAF8F5]/85 hover:text-[#C9A84C]" to="/resources/out-the-door-calculator">
                                    OTD Price Checker →
                                </Link>
                            </li>
                            <li>
                                <Link className="text-[#FAF8F5]/85 hover:text-[#C9A84C]" to="/resources/dealer-offer-comparison">
                                    Dealer offer comparison →
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
