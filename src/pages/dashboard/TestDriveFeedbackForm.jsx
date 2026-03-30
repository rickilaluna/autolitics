import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquareText, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const TestDriveFeedbackForm = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        vehicle_driven: '',
        drive_date: new Date().toISOString().split('T')[0],
        rating_comfort: 3,
        rating_performance: 3,
        rating_tech: 3,
        overall_impression: '',
        likes: '',
        dislikes: '',
        verdict: 'maybe'
    });

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData({ 
            ...formData, 
            [name]: type === 'range' ? parseInt(value) : value 
        });
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

            // 3. Insert into test_drive_feedback
            const { error: insertErr } = await supabase
                .from('test_drive_feedback')
                .insert({
                    client_id: client.id,
                    engagement_id: engagementId,
                    vehicle_driven: formData.vehicle_driven,
                    drive_date: formData.drive_date,
                    rating_comfort: formData.rating_comfort,
                    rating_performance: formData.rating_performance,
                    rating_tech: formData.rating_tech,
                    overall_impression: formData.overall_impression,
                    likes: formData.likes,
                    dislikes: formData.dislikes,
                    verdict: formData.verdict
                });

            if (insertErr) throw insertErr;

            setSuccess(true);
            
        } catch (err) {
            console.error("Error submitting feedback:", err);
            setError(err.message || "An error occurred while submitting your test drive.");
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
                    <h2 className="text-2xl font-semibold mb-3">Feedback Logged</h2>
                    <p className="text-[#0D0D12]/60 mb-8">
                        Thank you. Your impressions for the "{formData.vehicle_driven}" have been securely recorded. This structured feedback directly informs our short-list and negotiation strategy.
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
                    <MessageSquareText className="text-[#C9A84C]" size={28} />
                    <h1 className="text-3xl font-semibold tracking-tight text-[#0D0D12]">
                        Test Drive Feedback
                    </h1>
                </div>
                <p className="text-[#0D0D12]/60">
                    Log your reactions immediately after driving a shortlisted vehicle so we can refine your strategy.
                </p>
            </header>

            <form onSubmit={handleSubmit} className="bg-white border text-left border-[#0D0D12]/10 rounded-[2rem] p-8 shadow-sm space-y-8">
                
                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm mb-6">
                        {error}
                    </div>
                )}

                {/* Section 1: The Drive */}
                <div>
                    <h3 className="text-lg font-semibold border-b border-[#0D0D12]/10 pb-2 mb-4">The Drive</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="vehicle_driven" className="block text-sm font-medium text-[#0D0D12]">
                                Vehicle Driven <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="vehicle_driven"
                                name="vehicle_driven"
                                required
                                placeholder="Year, Make, Model, Trim"
                                value={formData.vehicle_driven}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#0D0D12]/10 rounded-xl outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="drive_date" className="block text-sm font-medium text-[#0D0D12]">
                                Date of Test Drive <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                id="drive_date"
                                name="drive_date"
                                required
                                value={formData.drive_date}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#0D0D12]/10 rounded-xl outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Ratings */}
                <div>
                    <h3 className="text-lg font-semibold border-b border-[#0D0D12]/10 pb-2 mb-4">Objective Ratings (1-5)</h3>
                    <div className="space-y-6">
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center text-sm font-medium">
                                <span>Comfort & Ergonomics</span>
                                <span className="text-[#C9A84C] font-mono">{formData.rating_comfort} / 5</span>
                            </div>
                            <input
                                type="range"
                                name="rating_comfort"
                                min="1" max="5" step="1"
                                value={formData.rating_comfort}
                                onChange={handleChange}
                                className="w-full accent-[#C9A84C]"
                            />
                            <div className="flex justify-between text-xs text-[#0D0D12]/40">
                                <span>Poor</span><span>Excellent</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center text-sm font-medium">
                                <span>Driving Dynamics & Performance</span>
                                <span className="text-[#C9A84C] font-mono">{formData.rating_performance} / 5</span>
                            </div>
                            <input
                                type="range"
                                name="rating_performance"
                                min="1" max="5" step="1"
                                value={formData.rating_performance}
                                onChange={handleChange}
                                className="w-full accent-[#C9A84C]"
                            />
                            <div className="flex justify-between text-xs text-[#0D0D12]/40">
                                <span>Sluggish/Numb</span><span>Engaging/Powerful</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center text-sm font-medium">
                                <span>Technology & UI</span>
                                <span className="text-[#C9A84C] font-mono">{formData.rating_tech} / 5</span>
                            </div>
                            <input
                                type="range"
                                name="rating_tech"
                                min="1" max="5" step="1"
                                value={formData.rating_tech}
                                onChange={handleChange}
                                className="w-full accent-[#C9A84C]"
                            />
                            <div className="flex justify-between text-xs text-[#0D0D12]/40">
                                <span>Frustrating</span><span>Intuitive</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3: Subjective Impressions */}
                <div>
                    <h3 className="text-lg font-semibold border-b border-[#0D0D12]/10 pb-2 mb-4">Subjective Impressions</h3>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="overall_impression" className="block text-sm font-medium text-[#0D0D12]">
                                Overall Impression
                            </label>
                            <textarea
                                id="overall_impression"
                                name="overall_impression"
                                rows={3}
                                placeholder="How did the car make you feel? Did it meet your expectations from the Strategy Brief?"
                                value={formData.overall_impression}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#0D0D12]/10 rounded-xl outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all resize-y"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="likes" className="block text-sm font-medium text-[#0D0D12]">
                                    Standout Pros
                                </label>
                                <textarea
                                    id="likes"
                                    name="likes"
                                    rows={3}
                                    placeholder="What did you love?"
                                    value={formData.likes}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#0D0D12]/10 rounded-xl outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all resize-y"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="dislikes" className="block text-sm font-medium text-[#0D0D12]">
                                    Noted Cons
                                </label>
                                <textarea
                                    id="dislikes"
                                    name="dislikes"
                                    rows={3}
                                    placeholder="What annoyed you?"
                                    value={formData.dislikes}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#0D0D12]/10 rounded-xl outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all resize-y"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 4: Verdict */}
                <div>
                    <h3 className="text-lg font-semibold border-b border-[#0D0D12]/10 pb-2 mb-4">The Verdict</h3>
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-[#0D0D12]">
                            Where does this vehicle stand now? <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <label className={`border rounded-xl p-4 cursor-pointer transition-all ${formData.verdict === 'top_contender' ? 'border-[#C9A84C] bg-[#FAF8F5] ring-1 ring-[#C9A84C]' : 'border-[#0D0D12]/10 bg-white hover:border-[#0D0D12]/30'}`}>
                                <input type="radio" name="verdict" value="top_contender" checked={formData.verdict === 'top_contender'} onChange={handleChange} className="sr-only" />
                                <div className="font-semibold text-center text-[#0D0D12]">Top Contender</div>
                                <div className="text-xs text-center mt-1 text-[#0D0D12]/60">I want to buy this.</div>
                            </label>
                            
                            <label className={`border rounded-xl p-4 cursor-pointer transition-all ${formData.verdict === 'maybe' ? 'border-[#C9A84C] bg-[#FAF8F5] ring-1 ring-[#C9A84C]' : 'border-[#0D0D12]/10 bg-white hover:border-[#0D0D12]/30'}`}>
                                <input type="radio" name="verdict" value="maybe" checked={formData.verdict === 'maybe'} onChange={handleChange} className="sr-only" />
                                <div className="font-semibold text-center text-[#0D0D12]">Keep Searching</div>
                                <div className="text-xs text-center mt-1 text-[#0D0D12]/60">It's okay, but let's see others.</div>
                            </label>

                            <label className={`border rounded-xl p-4 cursor-pointer transition-all ${formData.verdict === 'eliminate' ? 'border-red-500 bg-red-50 ring-1 ring-red-500' : 'border-[#0D0D12]/10 bg-white hover:border-[#0D0D12]/30'}`}>
                                <input type="radio" name="verdict" value="eliminate" checked={formData.verdict === 'eliminate'} onChange={handleChange} className="sr-only" />
                                <div className="font-semibold text-center text-[#0D0D12]">Eliminate</div>
                                <div className="text-xs text-center mt-1 text-[#0D0D12]/60">Cross this model off the list.</div>
                            </label>
                        </div>
                    </div>
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
                            'Log Test Drive'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TestDriveFeedbackForm;
