import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileSignature, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const DealerOfferReviewForm = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        dealership_name: '',
        vehicle_name: '',
        document_url: '',
        out_the_door_price: '',
        client_notes: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            // 1. Get Client ID
            const { data: client, error: clientErr } = await supabase
                .from('clients')
                .select('id')
                .ilike('primary_email', user.email)
                .single();

            if (clientErr || !client) throw new Error("Could not locate client record.");

            // 2. Get active engagement
            const { data: engagement } = await supabase
                .from('engagements')
                .select('id')
                .eq('client_id', client.id)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            const engagementId = engagement ? engagement.id : null;

            // Handle price formatting
            const price = parseFloat(formData.out_the_door_price.replace(/[^0-9.]/g, ''));

            // 3. Insert into dealer_offer_reviews
            const { error: insertErr } = await supabase
                .from('dealer_offer_reviews')
                .insert({
                    client_id: client.id,
                    engagement_id: engagementId,
                    dealership_name: formData.dealership_name,
                    vehicle_name: formData.vehicle_name,
                    document_url: formData.document_url,
                    out_the_door_price: isNaN(price) ? null : price,
                    client_notes: formData.client_notes,
                    status: 'pending'
                });

            if (insertErr) throw insertErr;

            setSuccess(true);
            
        } catch (err) {
            console.error("Error submitting offer:", err);
            setError(err.message || "An error occurred while submitting your offer.");
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500 pb-12">
                <header className="mb-6">
                    <Link to="/dashboard/my-search" className="inline-flex items-center text-[#0D0D12]/60 hover:text-[#0D0D12] mb-4 text-sm font-medium transition-colors">
                        <ArrowLeft size={16} className="mr-1" /> Back to Workspace
                    </Link>
                </header>
                <div className="bg-white border border-[#0D0D12]/10 rounded-[2rem] p-12 shadow-sm text-center max-w-2xl mx-auto">
                    <div className="bg-[#FAF8F5] text-[#C9A84C] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-2xl font-semibold mb-3">Offer Submitted</h2>
                    <p className="text-[#0D0D12]/60 mb-8">
                        Thank you. Your dealership quote for the "{formData.vehicle_name}" has been submitted. Your advisor will immediately review the numbers, structure, and hidden fees to strategize our negotiation counter-offer.
                    </p>
                    <button onClick={() => navigate('/dashboard/my-search')} className="inline-flex bg-[#0D0D12] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#1A1A24] transition-colors items-center justify-center">
                        Return to Workspace
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12 max-w-3xl">
            <header className="mb-6">
                <Link to="/dashboard/my-search" className="inline-flex items-center text-[#0D0D12]/60 hover:text-[#0D0D12] mb-4 text-sm font-medium transition-colors">
                    <ArrowLeft size={16} className="mr-1" /> Back to Workspace
                </Link>
                <div className="flex items-center gap-3 mb-2">
                    <FileSignature className="text-[#C9A84C]" size={28} />
                    <h1 className="text-3xl font-semibold tracking-tight text-[#0D0D12]">
                        Dealer Offer Review
                    </h1>
                </div>
                <p className="text-[#0D0D12]/60">
                    Upload a dealership quote or buyer's order to have the numbers, hidden fees, and financial structure evaluated before you sign anything.
                </p>
            </header>

            <form onSubmit={handleSubmit} className="bg-white border text-left border-[#0D0D12]/10 rounded-[2rem] p-8 shadow-sm space-y-6">
                
                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm mb-6">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="dealership_name" className="block text-sm font-medium text-[#0D0D12]">
                            Dealership Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="dealership_name"
                            name="dealership_name"
                            required
                            placeholder="e.g. Porsche Downtown LA"
                            value={formData.dealership_name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#0D0D12]/10 rounded-xl outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label htmlFor="vehicle_name" className="block text-sm font-medium text-[#0D0D12]">
                            Vehicle Year, Make, & Model <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="vehicle_name"
                            name="vehicle_name"
                            required
                            placeholder="e.g. 2021 Porsche Macan S"
                            value={formData.vehicle_name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#0D0D12]/10 rounded-xl outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="document_url" className="block text-sm font-medium text-[#0D0D12]">
                        Quote Document Link (Google Drive, Dropbox, iCloud) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="url"
                        id="document_url"
                        name="document_url"
                        required
                        placeholder="https://..."
                        value={formData.document_url}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#0D0D12]/10 rounded-xl outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all"
                    />
                    <p className="text-xs text-[#0D0D12]/40 font-['JetBrains_Mono'] mt-1">
                        Please upload a clear photo or PDF of the the "Buyer's Order" or quote worksheet from the dealer to a cloud drive and paste the sharing link here. Ensure permissions are set to "Anyone with link can view".
                    </p>
                </div>

                <div className="space-y-2">
                    <label htmlFor="out_the_door_price" className="block text-sm font-medium text-[#0D0D12]">
                        Total "Out The Door" Price Provided
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-3 text-[#0D0D12]/40 font-medium">$</span>
                        <input
                            type="text"
                            id="out_the_door_price"
                            name="out_the_door_price"
                            placeholder="0.00"
                            value={formData.out_the_door_price}
                            onChange={handleChange}
                            className="w-full pl-8 pr-4 py-3 bg-[#FAF8F5] border border-[#0D0D12]/10 rounded-xl outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all"
                        />
                    </div>
                    <p className="text-xs text-[#0D0D12]/40 font-['JetBrains_Mono'] mt-1">
                        Include all taxes, fees, and add-ons if quoted. If leasing, enter total due at signing or leave blank.
                    </p>
                </div>

                <div className="space-y-2">
                    <label htmlFor="client_notes" className="block text-sm font-medium text-[#0D0D12]">
                        Your Notes or Questions
                    </label>
                    <textarea
                        id="client_notes"
                        name="client_notes"
                        rows={3}
                        placeholder="Did the dealer promise anything specifically? Does the rate seem high? Any specific concerns?"
                        value={formData.client_notes}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#0D0D12]/10 rounded-xl outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all resize-y"
                    />
                </div>

                <div className="pt-4 border-t border-[#0D0D12]/10 flex justify-end">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex bg-[#0D0D12] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#1A1A24] transition-colors items-center gap-2 disabled:opacity-50"
                    >
                        {submitting ? (
                            <>
                                <Loader2 size={18} className="animate-spin" /> Submitting...
                            </>
                        ) : (
                            'Submit Offer For Review'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DealerOfferReviewForm;
