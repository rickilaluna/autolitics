import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, ExternalLink, MessageSquare, Check, X } from 'lucide-react';

const ListingReviewsManager = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        const { data, error } = await supabase
            .from('listing_reviews')
            .select(`
                *,
                clients(primary_contact_name, primary_email)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching listing reviews:', error);
        } else {
            setReviews(data || []);
        }
        setLoading(false);
    };

    const handleUpdateStatus = async (id, newStatus) => {
        setUpdatingId(id);
        const { error } = await supabase
            .from('listing_reviews')
            .update({ status: newStatus })
            .eq('id', id);

        if (!error) {
            setReviews(reviews.map(r => r.id === id ? { ...r, status: newStatus } : r));
        }
        setUpdatingId(null);
    };

    const handleUpdateFeedback = async (id, feedback) => {
        setUpdatingId(id);
        const { error } = await supabase
            .from('listing_reviews')
            .update({ advisor_feedback: feedback })
            .eq('id', id);

        if (!error) {
            setReviews(reviews.map(r => r.id === id ? { ...r, advisor_feedback: feedback } : r));
        }
        setUpdatingId(null);
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-[#FAF8F5]/40" size={32} /></div>;

    return (
        <div className="font-['Space_Grotesk'] max-w-6xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Listing Reviews</h1>
            </div>

            <div className="space-y-6">
                {reviews.length === 0 ? (
                    <div className="bg-[#14141B] rounded-[2rem] shadow-sm border border-[#2A2A35] p-12 text-center text-[#FAF8F5]/50 font-sans">
                        No listing reviews submitted yet.
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="bg-[#14141B] rounded-[2rem] shadow-sm border border-[#2A2A35] p-6 md:p-8 flex flex-col md:flex-row gap-8 font-sans">
                            {/* Left Col: Details */}
                            <div className="flex-1 space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h2 className="text-xl font-bold font-['Space_Grotesk'] text-[#FAF8F5]">{review.vehicle_name}</h2>
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                                            review.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                            review.status === 'reviewed' ? 'bg-green-100 text-green-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {review.status}
                                        </span>
                                    </div>
                                    <a href={review.listing_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#C9A84C] hover:text-[#D4B86A] font-medium text-sm">
                                        View Listing <ExternalLink size={14} />
                                    </a>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-[#FAF8F5]/50 block mb-1">Client</span>
                                        <span className="font-medium text-[#FAF8F5]">{review.clients?.primary_contact_name}</span>
                                    </div>
                                    <div>
                                        <span className="text-[#FAF8F5]/50 block mb-1">Submitted</span>
                                        <span className="font-medium text-[#FAF8F5]">{new Date(review.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {review.client_notes && (
                                    <div className="bg-[#1A1A24] rounded-xl p-4 mt-4 border border-[#2A2A35]">
                                        <div className="flex gap-2 items-start text-[#FAF8F5]/80">
                                            <MessageSquare size={16} className="mt-1 flex-shrink-0 text-[#FAF8F5]/40" />
                                            <p className="text-sm italic">"{review.client_notes}"</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Col: Advisor Actions */}
                            <div className="flex-1 bg-[#1A1A24] rounded-2xl p-6 border border-[#2A2A35] flex flex-col">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-[#FAF8F5]/50 mb-3 font-['Space_Grotesk']">Advisor Feedback</h3>
                                <textarea
                                    className="w-full flex-1 min-h-[100px] px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#14141B] text-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 resize-y text-sm mb-4"
                                    placeholder="Enter feedback for the client..."
                                    defaultValue={review.advisor_feedback || ''}
                                    onBlur={(e) => {
                                        if (e.target.value !== review.advisor_feedback) {
                                            handleUpdateFeedback(review.id, e.target.value);
                                        }
                                    }}
                                />
                                
                                <div className="flex flex-wrap gap-2 mt-auto">
                                    <button 
                                        onClick={() => handleUpdateStatus(review.id, 'reviewed')}
                                        disabled={updatingId === review.id || review.status === 'reviewed'}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                    >
                                        <Check size={16} /> Mark as Good fit
                                    </button>
                                    <button 
                                        onClick={() => handleUpdateStatus(review.id, 'rejected')}
                                        disabled={updatingId === review.id || review.status === 'rejected'}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                    >
                                        <X size={16} /> Mark as Skip
                                    </button>
                                    <button 
                                        onClick={() => handleUpdateStatus(review.id, 'pending')}
                                        disabled={updatingId === review.id || review.status === 'pending'}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-[#2A2A35] text-[#FAF8F5]/80 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ml-auto"
                                    >
                                        Reset
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

export default ListingReviewsManager;
