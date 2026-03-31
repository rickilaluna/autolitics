import React, { useState, useEffect } from 'react';
import { FolderKanban, Loader2, PlayCircle, Download, CarFront, MessageSquareText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePurchases } from '../../hooks/usePurchases';
import { useClientProfile } from '../../hooks/useClientProfile';
import { useJourneyStatus } from '../../hooks/useJourneyStatus';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import ResourceHubCrosslinks from '../../components/dashboard/ResourceHubCrosslinks';

const StrategyBrief = () => {
    const { loading: purchaseLoading, hasPurchasedAdvisory } = usePurchases();
    const { profile } = useClientProfile();
    const { nextStep } = useJourneyStatus({ profile, hasPurchasedAdvisory });
    const { user } = useAuth();
    const [deliverables, setDeliverables] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchClientDeliverables() {
            if (!user?.email) {
                setLoading(false);
                return;
            }

            try {
                // 1. Find if this user's email matches a client record
                const { data: clients } = await supabase
                    .from('clients')
                    .select('id')
                    .ilike('primary_email', user.email);

                if (!clients || clients.length === 0) {
                    setLoading(false);
                    return;
                }

                // Get all client IDs matching this email
                const clientIds = clients.map(c => c.id);

                // 2. Find any engagements for these clients
                const { data: engagements } = await supabase
                    .from('engagements')
                    .select('id')
                    .in('client_id', clientIds);

                if (!engagements || engagements.length === 0) {
                    setLoading(false);
                    return;
                }

                const engagementIds = engagements.map(e => e.id);

                // 3. Fetch latest deliverable versions for these engagements
                const { data: versions } = await supabase
                    .from('deliverable_versions')
                    .select('id, engagement_id, created_at, snapshot')
                    .in('engagement_id', engagementIds)
                    .order('created_at', { ascending: false });

                // Deduplicate by engagement_id (only show the most recent published version per engagement)
                const latestVersions = [];
                const seenEngagements = new Set();

                if (versions) {
                    for (const v of versions) {
                        if (!seenEngagements.has(v.engagement_id)) {
                            seenEngagements.add(v.engagement_id);
                            latestVersions.push(v);
                        }
                    }
                }

                setDeliverables(latestVersions);
            } catch (err) {
                console.error("Error fetching deliverables:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchClientDeliverables();
    }, [user]);

    if (purchaseLoading || loading) {
        return (
            <div className="flex flex-col h-[400px] items-center justify-center text-[#0D0D12]/50 font-['JetBrains_Mono'] gap-4 animate-fade-in">
                <Loader2 className="w-8 h-8 text-[#C9A84C] animate-spin" />
                Checking access...
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <header className="mb-10">
                <h1 className="text-3xl font-semibold tracking-tight text-[#0D0D12] mb-2">
                    My Strategy
                </h1>
                <p className="text-[#0D0D12]/60 font-['JetBrains_Mono']">
                    Your strategy briefs, recommendations, and advisory actions.
                </p>
            </header>

            {hasPurchasedAdvisory && (
                <ResourceHubCrosslinks
                    variant="grouped"
                    emphasizePhase={nextStep?.resourcePhase || null}
                    className="max-w-4xl"
                />
            )}

            {!hasPurchasedAdvisory && deliverables.length === 0 ? (
                <div className="bg-white border border-[#0D0D12]/10 rounded-[2rem] p-8 sm:p-12 shadow-sm text-center">
                    <div className="bg-[#0D0D12]/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FolderKanban size={32} className="text-[#0D0D12]/30" />
                    </div>
                    <h2 className="text-xl font-semibold mb-3">No Active Projects</h2>
                    <p className="text-[#0D0D12]/60 max-w-md mx-auto mb-8">
                        You do not have any active advisory projects. Schedule an intro call to begin an engagement.
                    </p>
                    <Link to="/start" className="inline-flex bg-[#0D0D12] text-white px-6 py-3 rounded-full font-medium hover:bg-[#1A1A24] transition-colors items-center gap-2">
                        Learn About Advisory
                    </Link>
                </div>
            ) : deliverables.length > 0 ? (
                <div className="flex flex-col gap-6">
                    {deliverables.map((del) => (
                        <div key={del.id} className="bg-white border text-left border-[#0D0D12]/10 rounded-[2rem] shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-[#0D0D12]/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <FolderKanban className="text-[#C9A84C]" size={24} />
                                        <h3 className="text-2xl font-semibold text-[#0D0D12]">
                                            Strategy Recommendation: {del.snapshot?.client?.names || 'Client'}
                                        </h3>
                                    </div>
                                    <p className="text-sm text-[#0D0D12]/60 font-mono mb-4">
                                        Generated: {new Date(del.created_at).toLocaleDateString()}
                                    </p>
                                    <div className="flex gap-3">
                                        <Link to={`/deliverable/${del.id}`} className="inline-flex justify-center bg-[#0D0D12] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#1A1A24] transition-colors items-center gap-2">
                                            <PlayCircle size={16} /> Open Interactive Brief
                                        </Link>
                                        <Link to={`/deliverable/${del.id}`} target="_blank" className="inline-flex justify-center bg-[#0D0D12]/5 text-[#0D0D12] border border-[#0D0D12]/10 px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#0D0D12]/10 transition-colors items-center gap-2">
                                            <Download size={16} /> PDF View
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-[#FAF8F5]">
                                <h4 className="text-xs font-['JetBrains_Mono'] text-[#C9A84C] uppercase tracking-widest mb-4">Advisory Actions</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Link to="/dashboard/my-search/test-drive" className="flex items-center gap-3 p-4 bg-white border border-[#0D0D12]/10 rounded-xl hover:border-[#C9A84C]/50 transition-colors group">
                                        <MessageSquareText className="text-[#0D0D12]/40 group-hover:text-[#C9A84C] transition-colors" size={20} />
                                        <span className="font-medium text-sm">Share Test Drive Feedback</span>
                                    </Link>
                                    <Link to="/dashboard/my-search/listing" className="flex items-center gap-3 p-4 bg-white border border-[#0D0D12]/10 rounded-xl hover:border-[#C9A84C]/50 transition-colors group">
                                        <CarFront className="text-[#0D0D12]/40 group-hover:text-[#C9A84C] transition-colors" size={20} />
                                        <span className="font-medium text-sm">Submit Listing for Review</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white border border-[#0D0D12]/10 rounded-[2rem] p-8 shadow-sm text-center">
                    <p className="text-[#0D0D12]/60 font-['JetBrains_Mono']">
                        Your advisory project portal has been provisioned. A strategist will upload your analysis presentation here shortly.
                    </p>
                </div>
            )}
        </div>
    );
};

export default StrategyBrief;
