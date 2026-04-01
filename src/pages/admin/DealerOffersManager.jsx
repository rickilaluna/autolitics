import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, ExternalLink, MessageSquare, Check, RotateCcw } from 'lucide-react';

const DealerOffersManager = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        const { data, error } = await supabase
            .from('dealer_offer_reviews')
            .select(`
                *,
                clients(primary_contact_name, primary_email)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching dealer offers:', error);
        } else {
            setOffers(data || []);
        }
        setLoading(false);
    };

    const handleUpdateStatus = async (id, newStatus) => {
        setUpdatingId(id);
        const { error } = await supabase
            .from('dealer_offer_reviews')
            .update({ status: newStatus })
            .eq('id', id);

        if (!error) {
            setOffers(offers.map(o => o.id === id ? { ...o, status: newStatus } : o));
        }
        setUpdatingId(null);
    };

    const handleUpdateFeedback = async (id, feedback) => {
        setUpdatingId(id);
        const { error } = await supabase
            .from('dealer_offer_reviews')
            .update({ advisor_feedback: feedback })
            .eq('id', id);

        if (!error) {
            setOffers(offers.map(o => o.id === id ? { ...o, advisor_feedback: feedback } : o));
        }
        setUpdatingId(null);
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-[#FAF8F5]/40" size={32} /></div>;

    return (
        <div className="font-['Space_Grotesk'] max-w-6xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Dealer Offers</h1>
            </div>

            <div className="space-y-6">
                {offers.length === 0 ? (
                    <div className="bg-[#14141B] rounded-[2rem] shadow-sm border border-[#2A2A35] p-12 text-center text-[#FAF8F5]/50 font-sans">
                        No dealer offers submitted yet.
                    </div>
                ) : (
                    offers.map((offer) => (
                        <div key={offer.id} className="bg-[#14141B] rounded-[2rem] shadow-sm border border-[#2A2A35] p-6 md:p-8 flex flex-col md:flex-row gap-8 font-sans">
                            {/* Left Col: Details */}
                            <div className="flex-1 space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h2 className="text-xl font-bold font-['Space_Grotesk'] text-[#FAF8F5]">{offer.vehicle_name}</h2>
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                                            offer.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                            {offer.status}
                                        </span>
                                    </div>
                                    <div className="text-[#C9A84C] font-medium text-sm flex items-center gap-2">
                                        Dealer: <span className="text-[#FAF8F5]">{offer.dealership_name}</span>
                                    </div>
                                    <div className="mt-2 text-[#C9A84C] font-medium text-sm flex items-center gap-2">
                                        Provided OTD: <span className="text-[#FAF8F5]">{offer.out_the_door_price ? `$${offer.out_the_door_price.toLocaleString()}` : "Not stated"}</span>
                                    </div>
                                    <a href={offer.document_url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-[#C9A84C] hover:text-[#D4B86A] font-medium text-sm bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 transition-colors">
                                        View Quote Document <ExternalLink size={14} />
                                    </a>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                                    <div>
                                        <span className="text-[#FAF8F5]/50 block mb-1">Client</span>
                                        <span className="font-medium text-[#FAF8F5]">{offer.clients?.primary_contact_name}</span>
                                    </div>
                                    <div>
                                        <span className="text-[#FAF8F5]/50 block mb-1">Submitted</span>
                                        <span className="font-medium text-[#FAF8F5]">{new Date(offer.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {offer.client_notes && (
                                    <div className="bg-[#1A1A24] rounded-xl p-4 mt-4 border border-[#2A2A35]">
                                        <div className="flex gap-2 items-start text-[#FAF8F5]/80">
                                            <MessageSquare size={16} className="mt-1 flex-shrink-0 text-[#FAF8F5]/40" />
                                            <p className="text-sm italic">"{offer.client_notes}"</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Col: Advisor Actions */}
                            <div className="flex-1 bg-[#1A1A24] rounded-2xl p-6 border border-[#2A2A35] flex flex-col">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-[#FAF8F5]/50 mb-3 font-['Space_Grotesk']">Strategy / Analysis</h3>
                                <textarea
                                    className="studio-touch-input w-full flex-1 min-h-[100px] px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#14141B] text-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 resize-y text-sm mb-4"
                                    placeholder="Enter your fee breakdown, counter-offer strategy, etc..."
                                    defaultValue={offer.advisor_feedback || ''}
                                    onBlur={(e) => {
                                        if (e.target.value !== offer.advisor_feedback) {
                                            handleUpdateFeedback(offer.id, e.target.value);
                                        }
                                    }}
                                />
                                
                                <div className="flex flex-wrap gap-2 mt-auto">
                                    <button 
                                        onClick={() => handleUpdateStatus(offer.id, 'reviewed')}
                                        disabled={updatingId === offer.id || offer.status === 'reviewed'}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                    >
                                        <Check size={16} /> Mark as Reviewed & Strategized
                                    </button>
                                    <button 
                                        onClick={() => handleUpdateStatus(offer.id, 'pending')}
                                        disabled={updatingId === offer.id || offer.status === 'pending'}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-[#2A2A35] text-[#FAF8F5]/80 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ml-auto"
                                    >
                                        <RotateCcw size={16} /> Reset
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DealerOffersManager;
