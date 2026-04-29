import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import MinimalHeader from '../../components/MinimalHeader';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const redirectTo = `${window.location.origin}/reset-password`;
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo,
        });

        if (error) {
            setError(error.message || 'Could not send reset email.');
            setLoading(false);
        } else {
            setSent(true);
            setLoading(false);
        }
    };

    return (
        <div className="public-page-shell bg-[#0D0D12] text-[#FAF8F5] font-['Inter'] selection:bg-[#C9A84C]/30 selection:text-[#FAF8F5]">
            <MinimalHeader />

            <div className="public-page-content max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[min(85vh,calc(100dvh-6rem))] pb-16 sm:pb-24">
                <div className="w-full max-w-md">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#FAF8F5] mb-4">
                            Reset Password
                        </h1>
                        <p className="text-[#2A2A35] text-lg font-['JetBrains_Mono']">
                            We'll email you a recovery link.
                        </p>
                    </div>

                    {sent ? (
                        <div className="space-y-6">
                            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 p-4 rounded-xl text-sm font-['JetBrains_Mono']">
                                Check <strong>{email}</strong> for a recovery link. It may take a minute to arrive.
                            </div>
                            <div className="text-center">
                                <Link to="/login" className="text-[#C9A84C] hover:underline text-sm">
                                    Back to sign in
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-['JetBrains_Mono']">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm text-[#FAF8F5]/60 mb-2 font-['JetBrains_Mono']" htmlFor="email">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="studio-touch-input w-full bg-[#1A1A1A] border border-[#2A2A35] rounded-xl px-4 py-3 text-[#FAF8F5] focus:outline-none focus:border-[#C9A84C] transition-colors"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="studio-touch-btn w-full group relative overflow-hidden bg-[#C9A84C] text-[#0D0D12] sm:py-4 px-8 rounded-full font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {loading ? 'Sending...' : 'Send Recovery Email'}
                                </span>
                            </button>

                            <div className="text-center mt-6">
                                <p className="text-sm text-[#FAF8F5]/60">
                                    Remembered it?{' '}
                                    <Link to="/login" className="text-[#C9A84C] hover:underline">
                                        Back to sign in
                                    </Link>
                                </p>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
