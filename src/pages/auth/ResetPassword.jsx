import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import MinimalHeader from '../../components/MinimalHeader';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [recoveryReady, setRecoveryReady] = useState(false);

    useEffect(() => {
        // Supabase parses the recovery token from the URL hash and fires
        // a PASSWORD_RECOVERY auth event. We allow the form once we've
        // confirmed a recovery session is in place.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY' && session) {
                setRecoveryReady(true);
            }
        });

        // If the page was opened directly with an existing session
        // (e.g. on refresh after the recovery handshake), allow the form.
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) setRecoveryReady(true);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            setError(error.message || 'Could not update password.');
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
            setTimeout(() => navigate('/dashboard', { replace: true }), 1500);
        }
    };

    return (
        <div className="public-page-shell bg-[#0D0D12] text-[#FAF8F5] font-['Inter'] selection:bg-[#C9A84C]/30 selection:text-[#FAF8F5]">
            <MinimalHeader />

            <div className="public-page-content max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[min(85vh,calc(100dvh-6rem))] pb-16 sm:pb-24">
                <div className="w-full max-w-md">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#FAF8F5] mb-4">
                            New Password
                        </h1>
                        <p className="text-[#2A2A35] text-lg font-['JetBrains_Mono']">
                            Choose a new password for your account.
                        </p>
                    </div>

                    {success ? (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 p-4 rounded-xl text-sm font-['JetBrains_Mono'] text-center">
                            Password updated. Redirecting…
                        </div>
                    ) : !recoveryReady ? (
                        <div className="space-y-6">
                            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 p-4 rounded-xl text-sm font-['JetBrains_Mono']">
                                This page expects a recovery link from your email. If you got here directly, request a new link.
                            </div>
                            <div className="text-center">
                                <Link to="/forgot-password" className="text-[#C9A84C] hover:underline text-sm">
                                    Send recovery email
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
                                <label className="block text-sm text-[#FAF8F5]/60 mb-2 font-['JetBrains_Mono']" htmlFor="password">
                                    New Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="studio-touch-input w-full bg-[#1A1A1A] border border-[#2A2A35] rounded-xl px-4 py-3 text-[#FAF8F5] focus:outline-none focus:border-[#C9A84C] transition-colors"
                                    placeholder="At least 8 characters"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-[#FAF8F5]/60 mb-2 font-['JetBrains_Mono']" htmlFor="confirmPassword">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="studio-touch-input w-full bg-[#1A1A1A] border border-[#2A2A35] rounded-xl px-4 py-3 text-[#FAF8F5] focus:outline-none focus:border-[#C9A84C] transition-colors"
                                    placeholder="Re-enter your password"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="studio-touch-btn w-full group relative overflow-hidden bg-[#C9A84C] text-[#0D0D12] sm:py-4 px-8 rounded-full font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {loading ? 'Updating...' : 'Update Password'}
                                </span>
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
