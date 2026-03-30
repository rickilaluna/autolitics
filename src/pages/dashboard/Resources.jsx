import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { usePurchases } from '../../hooks/usePurchases';
import {
    Download,
    Loader2,
    FileText,
    BookOpen,
    FileSpreadsheet,
    ShieldCheck,
    Calculator,
    ExternalLink,
    ArrowRight,
    LayoutGrid
} from 'lucide-react';

const IconComponents = {
    'file-text': FileText,
    'book-open': BookOpen,
    'file-spreadsheet': FileSpreadsheet,
    'shield-check': ShieldCheck,
    'calculator': Calculator,
    'external-link': ExternalLink
};

// Resources organized by journey phase
export const PHASE_RESOURCES = {
    strategy: {
        label: 'Strategy & Research',
        description: 'Build your buying framework before you shop.',
        items: [
            {
                id: 'buying-framework',
                title: 'Car Buying Framework',
                description: 'A four-stage decision model that shifts power from the dealership to the buyer.',
                to: '/resources/buying-framework',
                icon: ShieldCheck,
            },
            {
                id: 'playbook',
                title: 'The Autolitics Playbook',
                description: 'Navigate dealerships, evaluate vehicles, understand pricing, and structure a smart deal.',
                to: '/resources/playbook',
                icon: BookOpen,
            },
        ],
    },
    evaluate: {
        label: 'Evaluate & Test Drive',
        description: 'Score, compare, and narrow your shortlist.',
        items: [
            {
                id: 'scorecard',
                title: 'Vehicle Evaluation Scorecard',
                description: 'A printable worksheet for scoring vehicles during test drives across six categories.',
                to: '/resources/scorecard',
                icon: FileSpreadsheet,
            },
            {
                id: 'vehicle-comparison-matrix',
                title: 'Vehicle Decision Engine',
                description: 'Compare vehicles digitally, score across 8 dimensions, and get a visual recommendation.',
                to: '/resources/vehicle-comparison-matrix',
                icon: LayoutGrid,
            },
        ],
    },
    negotiate: {
        label: 'Negotiate & Close',
        description: 'Verify pricing, compare offers, and close with confidence.',
        items: [
            {
                id: 'out-the-door-calculator',
                title: 'Out-the-Door Price Checker',
                description: 'See what a clean total should look like and spot hidden extras in a dealer quote.',
                to: '/resources/out-the-door-calculator',
                icon: Calculator,
            },
            {
                id: 'dealer-offer-comparison',
                title: 'Dealer Offer Comparison',
                description: 'Compare quotes from up to four dealerships side-by-side to find the true lowest cost.',
                to: '/resources/dealer-offer-comparison',
                icon: FileText,
            },
        ],
    },
};

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
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { loading: purchaseLoading, hasPurchasedGuide } = usePurchases();

    useEffect(() => {
        (async () => {
            try {
                const { data, error: sbError } = await supabase
                    .from('advisory_resources')
                    .select('*')
                    .order('sort_order', { ascending: true })
                    .order('created_at', { ascending: false });
                if (sbError) throw sbError;
                setResources(data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading || purchaseLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 gap-4 text-[#0D0D12]/50 font-['JetBrains_Mono'] animate-fade-in">
                <Loader2 className="animate-spin text-[#C9A84C]" size={32} />
                Loading toolkit...
            </div>
        );
    }

    if (error) {
        return <div className="p-6 bg-red-50 text-red-600 rounded-xl">Error loading resources: {error}</div>;
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

            {/* DB-driven resources */}
            {resources.length > 0 && (
                <div>
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold tracking-tight text-[#0D0D12]">Additional Resources</h2>
                        <p className="text-sm text-[#0D0D12]/50">Advisor-curated materials for your engagement.</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {resources.map((resource) => {
                            const Icon = IconComponents[resource.icon_type] || FileText;
                            const isExternal = resource.document_url?.startsWith('http');
                            return (
                                <div key={resource.id} className="flex flex-col bg-white border border-[#0D0D12]/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="h-10 w-10 bg-[#0D0D12]/5 rounded-xl flex items-center justify-center mb-4 text-[#0D0D12]">
                                        <Icon size={20} />
                                    </div>
                                    <h3 className="font-semibold mb-1 line-clamp-1">{resource.title}</h3>
                                    <p className="text-[#0D0D12]/60 text-sm mb-4 flex-1 line-clamp-3">{resource.description}</p>
                                    <a
                                        href={resource.document_url}
                                        target={isExternal ? '_blank' : '_self'}
                                        rel={isExternal ? 'noopener noreferrer' : ''}
                                        className="inline-flex items-center gap-2 text-sm font-medium text-[#C9A84C] hover:text-[#0D0D12] transition-colors mt-auto w-fit"
                                    >
                                        {isExternal ? <><ExternalLink size={14} /> Open Link</> : <><Download size={14} /> Download</>}
                                    </a>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Guide Downloads */}
            <div className="pt-8 border-t border-[#0D0D12]/10">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold tracking-tight mb-1">Guide Downloads</h2>
                    <p className="text-sm text-[#0D0D12]/50">Offline templates included with The Strategic Car Buyer guide.</p>
                </div>

                {!hasPurchasedGuide ? (
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
        </div>
    );
};

export default Resources;
