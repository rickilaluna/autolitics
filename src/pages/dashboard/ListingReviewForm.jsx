import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CarFront, Loader2, CheckCircle2, Calculator, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const ListingReviewForm = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        vehicle_name: '',
        listing_url: '',
        vin: '',
        mileage: '',
        asking_price: '',
        dealership_name: '',
        dealership_location: '',
        client_notes: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const { data: client, error: clientErr } = await supabase
                .from('clients')
                .select('id')
                .ilike('primary_email', user.email)
                .single();

            if (clientErr || !client) throw new Error('Could not locate client record.');

            const { data: engagement } = await supabase
                .from('engagements')
                .select('id')
                .eq('client_id', client.id)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            const mileage = formData.mileage ? parseInt(formData.mileage.replace(/\D/g, ''), 10) || null : null;
            const askingPrice = formData.asking_price ? parseFloat(formData.asking_price.replace(/[^0-9.]/g, '')) || null : null;

            const { error: insertErr } = await supabase
                .from('listing_reviews')
                .insert({
                    client_id: client.id,
                    engagement_id: engagement?.id || null,
                    listing_url: formData.listing_url,
                    vehicle_name: formData.vehicle_name,
                    vin: formData.vin || null,
                    mileage,
                    asking_price: askingPrice,
                    dealership_name: formData.dealership_name || null,
                    dealership_location: formData.dealership_location || null,
                    client_notes: formData.client_notes || null,
                    status: 'pending',
                });

            if (insertErr) throw insertErr;
            setSuccess(true);
        } catch (err) {
            console.error('Error submitting listing:', err);
            setError(err.message || 'An error occurred while submitting your listing.');
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500 pb-12">
                <header className="mb-6">
                    <Link to="/dashboard/my-search" className="inline-flex items-center text-[#0D0D12]/60 hover:text-[#0D0D12] mb-4 text-sm font-medium transition-colors">
                        <ArrowLeft size={16} className="mr-1" /> Back to My Search
                    </Link>
                </header>
                <div className="bg-white border border-[#0D0D12]/10 rounded-[2rem] p-12 shadow-sm text-center max-w-2xl mx-auto">
                    <div className="bg-[#FAF8F5] text-[#C9A84C] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-2xl font-semibold mb-3">Listing Submitted</h2>
                    <p className="text-[#0D0D12]/60 mb-8">
                        Your advisor will review <span className="font-semibold text-[#0D0D12]">"{formData.vehicle_name}"</span> against your strategy constraints and run pricing & history analysis. You'll be notified when the review is complete.
                    </p>
                    <button onClick={() => navigate('/dashboard/my-search')} className="inline-flex bg-[#0D0D12] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#1A1A24] transition-colors items-center justify-center">
                        Return to My Search
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12 max-w-3xl">
            <header className="mb-6">
                <Link to="/dashboard/my-search" className="inline-flex items-center text-[#0D0D12]/60 hover:text-[#0D0D12] mb-4 text-sm font-medium transition-colors">
                    <ArrowLeft size={16} className="mr-1" /> Back to My Search
                </Link>
                <div className="flex items-center gap-3 mb-2">
                    <CarFront className="text-[#C9A84C]" size={28} />
                    <h1 className="text-3xl font-semibold tracking-tight text-[#0D0D12]">
                        Submit Listing for Review
                    </h1>
                </div>
                <p className="text-[#0D0D12]/60">
                    Paste the listing details below. Your advisor will analyze history, pricing, dealer reputation, and flag anything to watch for before you visit.
                </p>
            </header>

            <form onSubmit={handleSubmit} className="bg-white border border-[#0D0D12]/10 rounded-[2rem] p-8 shadow-sm space-y-8">

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>
                )}

                {/* Vehicle Info */}
                <div>
                    <h3 className="text-xs font-['JetBrains_Mono'] text-[#C9A84C] uppercase tracking-widest mb-4">Vehicle Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label htmlFor="vehicle_name" className="block text-sm font-medium text-[#0D0D12] mb-1">
                                Year, Make & Model <span className="text-red-500">*</span>
                            </label>
                            <input type="text" id="vehicle_name" name="vehicle_name" required placeholder="e.g. 2021 Porsche Macan S" value={formData.vehicle_name} onChange={handleChange}
                                className="studio-touch-input w-full px-4 py-3 bg-[#FAF8F5] border border-[#0D0D12]/10 rounded-xl outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all" />
                        </div>
                        <div>
                            <label htmlFor="vin" className="block text-sm font-medium text-[#0D0D12] mb-1">VIN</label>
                            <input type="text" id="vin" name="vin" placeholder="17-character VIN" maxLength={17} value={formData.vin} onChange={handleChange}
                                className="studio-touch-input w-full px-4 py-3 bg-[#FAF8F5] border border-[#0D0D12]/10 rounded-xl outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all font-['JetBrains_Mono'] uppercase" />
                            <p className="text-xs text-[#0D0D12]/40 font-['JetBrains_Mono'] mt-1">Helps pull exact history & spec data</p>
                        </div>
                        <div>
                            <label htmlFor="mileage" className="block text-sm font-medium text-[#0D0D12] mb-1">Mileage</label>
                            <input type="text" id="mileage" name="mileage" placeholder="e.g. 38,500" value={formData.mileage} onChange={handleChange}
                                className="studio-touch-input w-full px-4 py-3 bg-[#FAF8F5] border border-[#0D0D12]/10 rounded-xl outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all" />
                        </div>
                    </div>
                </div>

                {/* Dealer & Pricing */}
                <div>
                    <h3 className="text-xs font-['JetBrains_Mono'] text-[#C9A84C] uppercase tracking-widest mb-4">Dealer & Pricing</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="dealership_name" className="block text-sm font-medium text-[#0D0D12] mb-1">Dealership Name</label>
                            <input type="text" id="dealership_name" name="dealership_name" placeholder="e.g. AutoNation Porsche" value={formData.dealership_name} onChange={handleChange}
                                className="studio-touch-input w-full px-4 py-3 bg-[#FAF8F5] border border-[#0D0D12]/10 rounded-xl outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all" />
                        </div>
                        <div>
                            <label htmlFor="dealership_location" className="block text-sm font-medium text-[#0D0D12] mb-1">Dealer Location</label>
                            <input type="text" id="dealership_location" name="dealership_location" placeholder="City, State" value={formData.dealership_location} onChange={handleChange}
                                className="studio-touch-input w-full px-4 py-3 bg-[#FAF8F5] border border-[#0D0D12]/10 rounded-xl outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all" />
                        </div>
                        <div>
                            <label htmlFor="asking_price" className="block text-sm font-medium text-[#0D0D12] mb-1">Asking Price</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0D0D12]/40 font-medium">$</span>
                                <input type="text" id="asking_price" name="asking_price" placeholder="42,500" value={formData.asking_price} onChange={handleChange}
                                    className="studio-touch-input w-full pl-8 pr-4 py-3 bg-[#FAF8F5] border border-[#0D0D12]/10 rounded-xl outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all" />
                            </div>
                        </div>
                        <div className="sm:col-span-2 sm:col-start-2 flex items-end">
                            <Link
                                to="/resources/out-the-door-calculator"
                                className="inline-flex items-center gap-2 text-sm font-medium text-[#C9A84C] hover:text-[#0D0D12] transition-colors group"
                            >
                                <Calculator size={16} />
                                Run the OTD Price Checker
                                <ArrowRight size={14} className="group-hover:translate-x-1 duration-300" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Listing Link & Notes */}
                <div>
                    <h3 className="text-xs font-['JetBrains_Mono'] text-[#C9A84C] uppercase tracking-widest mb-4">Listing & Context</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="listing_url" className="block text-sm font-medium text-[#0D0D12] mb-1">
                                Listing URL <span className="text-red-500">*</span>
                            </label>
                            <input type="url" id="listing_url" name="listing_url" required placeholder="https://www.cargurus.com/Cars/..." value={formData.listing_url} onChange={handleChange}
                                className="studio-touch-input w-full px-4 py-3 bg-[#FAF8F5] border border-[#0D0D12]/10 rounded-xl outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all" />
                            <p className="text-xs text-[#0D0D12]/40 font-['JetBrains_Mono'] mt-1">Dealer site, Cars.com, Autotrader, CarGurus, etc.</p>
                        </div>
                        <div>
                            <label htmlFor="client_notes" className="block text-sm font-medium text-[#0D0D12] mb-1">Your Notes or Questions</label>
                            <textarea id="client_notes" name="client_notes" rows={4} placeholder="What caught your eye? Any concerns, must-haves, or questions for your advisor?" value={formData.client_notes} onChange={handleChange}
                                className="studio-touch-input w-full px-4 py-3 bg-[#FAF8F5] border border-[#0D0D12]/10 rounded-xl outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all resize-y" />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-[#0D0D12]/10 flex justify-end">
                    <button type="submit" disabled={submitting}
                        className="inline-flex bg-[#0D0D12] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#1A1A24] transition-colors items-center gap-2 disabled:opacity-50">
                        {submitting ? <><Loader2 size={18} className="animate-spin" /> Submitting...</> : 'Submit Listing'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ListingReviewForm;
