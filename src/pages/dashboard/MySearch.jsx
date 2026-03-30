import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePurchases } from '../../hooks/usePurchases';
import { supabase } from '../../lib/supabase';
import { CarFront, MessageSquareText, FileSignature, ArrowRight, Loader2, Clock, CheckCircle2, XCircle } from 'lucide-react';

const MySearch = () => {
    const { user } = useAuth();
    const { loading: purchaseLoading, hasPurchasedAdvisory } = usePurchases();
    const [loading, setLoading] = useState(true);
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        async function fetchHistory() {
            if (!user?.email || !hasPurchasedAdvisory) {
                setLoading(false);
                return;
            }

            try {
                // Get Client ID
                const { data: clients } = await supabase
                    .from('clients')
                    .select('id')
                    .ilike('primary_email', user.email)
                    .single();

                if (!clients) {
                    setLoading(false);
                    return;
                }

                const clientId = clients.id;

                // Fetch Listings
                const { data: listings } = await supabase
                    .from('listing_reviews')
                    .select('*')
                    .eq('client_id', clientId);

                // Fetch Drives
                const { data: drives } = await supabase
                    .from('test_drive_feedback')
                    .select('*')
                    .eq('client_id', clientId);

                // Fetch Offers
                const { data: offers } = await supabase
                    .from('dealer_offer_reviews')
                    .select('*')
                    .eq('client_id', clientId);

                // Normalize and Combine
                const combined = [
                    ...(listings || []).map(l => ({ ...l, type: 'listing', date: new Date(l.created_at) })),
                    ...(drives || []).map(d => ({ ...d, type: 'drive', date: new Date(d.created_at) })),
                    ...(offers || []).map(o => ({ ...o, type: 'offer', date: new Date(o.created_at) }))
                ];

                // Sort descending
                combined.sort((a, b) => b.date - a.date);
                setActivities(combined);

            } catch (err) {
                console.error("Error fetching advisory history", err);
            } finally {
                setLoading(false);
            }
        }

        if (!purchaseLoading) {
            fetchHistory();
        }
    }, [user, hasPurchasedAdvisory, purchaseLoading]);

    if (purchaseLoading || loading) {
        return (
            <div className="flex flex-col h-[400px] items-center justify-center text-[#0D0D12]/50 font-['JetBrains_Mono'] gap-4 animate-fade-in">
                <Loader2 className="w-8 h-8 text-[#C9A84C] animate-spin" />
                Loading workspace...
            </div>
        );
    }

    if (!hasPurchasedAdvisory) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <header>
                    <h1 className="text-3xl font-semibold tracking-tight text-[#0D0D12] mb-2">My Search</h1>
                    <p className="text-[#0D0D12]/60">Your vehicle context and tracking hub.</p>
                </header>
                <div className="bg-white border border-[#0D0D12]/10 rounded-[2rem] p-12 text-center shadow-sm">
                    <h2 className="text-xl font-semibold mb-3">Advisory Access Required</h2>
                    <p className="text-[#0D0D12]/60 max-w-md mx-auto mb-8">
                        The interactive workspace is exclusively available for active 1:1 advisory clients.
                    </p>
                    <Link to="/start" className="inline-flex bg-[#0D0D12] text-white px-6 py-3 rounded-full font-medium hover:bg-[#1A1A24] transition-colors items-center">
                        Learn About Advisory
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in pb-12">
            <header>
                <h1 className="text-3xl font-semibold tracking-tight text-[#0D0D12] mb-2">My Search</h1>
                <p className="text-[#0D0D12]/60 max-w-2xl">
                    Your interactive advisory hub. Submit listings, share test drive impressions, and review dealer offers below.
                </p>
            </header>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 bg-white border border-[#0D0D12]/10 rounded-[2rem] shadow-sm flex flex-col h-full hover:border-[#C9A84C]/50 transition-colors group">
                    <div className="bg-[#0D0D12]/5 w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-[#0D0D12]">
                        <CarFront size={24} />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Listing Review</h2>
                    <p className="text-[#0D0D12]/60 text-sm mb-8 flex-1">
                        Found a vehicle of interest? Submit the online listing URL for a comprehensive pre-inspection analysis.
                    </p>
                    <Link to="/dashboard/my-search/listing" className="inline-flex font-medium text-[#0D0D12] group-hover:text-[#C9A84C] transition-colors items-center gap-2">
                        Submit Listing <ArrowRight size={16} className="group-hover:translate-x-1 duration-300" />
                    </Link>
                </div>

                <div className="p-8 bg-white border border-[#0D0D12]/10 rounded-[2rem] shadow-sm flex flex-col h-full hover:border-[#C9A84C]/50 transition-colors group">
                    <div className="bg-[#0D0D12]/5 w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-[#0D0D12]">
                        <MessageSquareText size={24} />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Test Drive Feedback</h2>
                    <p className="text-[#0D0D12]/60 text-sm mb-8 flex-1">
                        Log your reactions and ratings immediately after driving a shortlisted vehicle to help refine our strategy.
                    </p>
                    <Link to="/dashboard/my-search/test-drive" className="inline-flex font-medium text-[#0D0D12] group-hover:text-[#C9A84C] transition-colors items-center gap-2">
                        Log Test Drive <ArrowRight size={16} className="group-hover:translate-x-1 duration-300" />
                    </Link>
                </div>

                <div className="p-8 bg-white border border-[#0D0D12]/10 rounded-[2rem] shadow-sm flex flex-col h-full hover:border-[#C9A84C]/50 transition-colors group">
                    <div className="bg-[#0D0D12]/5 w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-[#0D0D12]">
                        <FileSignature size={24} />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Dealer Offer Review</h2>
                    <p className="text-[#0D0D12]/60 text-sm mb-8 flex-1">
                        Upload a dealership quote worksheet to have the numbers, hidden fees, and structure evaluated.
                    </p>
                    <Link to="/dashboard/my-search/offer" className="inline-flex font-medium text-[#0D0D12] group-hover:text-[#C9A84C] transition-colors items-center gap-2">
                        Upload Quote <ArrowRight size={16} className="group-hover:translate-x-1 duration-300" />
                    </Link>
                </div>
            </div>

            {/* Recent Activity Timeline */}
            <div className="mt-12">
                <h3 className="text-xl font-semibold tracking-tight text-[#0D0D12] mb-6">Recent Submissions</h3>
                
                {activities.length === 0 ? (
                    <div className="bg-white border border-[#0D0D12]/10 rounded-2xl p-8 text-center text-[#0D0D12]/50 font-['JetBrains_Mono'] text-sm">
                        No submissions yet. Use the tools above to engage with your advisor.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {activities.map((item) => {
                            let icon, label, StatusIcon, statusColor;

                            if (item.type === 'listing') {
                                icon = <CarFront size={18} />;
                                label = `Listing Submitted: ${item.vehicle_name}`;
                            } else if (item.type === 'drive') {
                                icon = <MessageSquareText size={18} />;
                                label = `Test Drive Logged: ${item.vehicle_driven}`;
                            } else {
                                icon = <FileSignature size={18} />;
                                label = `Offer Uploaded: ${item.vehicle_name} at ${item.dealership_name}`;
                            }

                            if (item.status === 'pending') {
                                StatusIcon = Clock;
                                statusColor = 'text-amber-500';
                            } else if (item.status === 'rejected') {
                                StatusIcon = XCircle;
                                statusColor = 'text-red-500';
                            } else {
                                StatusIcon = CheckCircle2;
                                statusColor = 'text-green-500';
                            }

                            // If no status field (e.g. test drive), implicitly "logged" / reviewed
                            if (!item.status) {
                                StatusIcon = CheckCircle2;
                                statusColor = 'text-green-500';
                            }

                            return (
                                <div key={item.id} className="bg-white border text-left border-[#0D0D12]/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-[#FAF8F5] p-3 rounded-xl text-[#C9A84C] shrink-0 mt-1 md:mt-0">
                                            {icon}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-lg">{label}</h4>
                                            <p className="text-[#0D0D12]/50 text-sm font-['JetBrains_Mono'] mt-1">
                                                {item.date.toLocaleDateString()} at {item.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 self-start md:self-center font-['JetBrains_Mono'] text-sm uppercase tracking-wider">
                                        <StatusIcon size={16} className={statusColor} />
                                        <span className={`font-semibold ${statusColor}`}>
                                            {item.status || 'Received'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MySearch;
