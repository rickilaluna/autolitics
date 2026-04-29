import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import MinimalHeader from '../../components/MinimalHeader';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // If auth state has already resolved to a user, don't keep them on /login.
    useEffect(() => {
        if (!user) return;
        const redirect = searchParams.get('redirect');
        const safe =
            redirect && redirect.startsWith('/') && !redirect.startsWith('//')
                ? redirect
                : '/dashboard';
        navigate(safe, { replace: true });
    }, [user, navigate, searchParams]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            let msg = error.message || 'Sign-in failed';
            if (
                /load failed|failed to fetch|networkerror/i.test(msg) ||
                error.name === 'AuthRetryableFetchError'
            ) {
                msg += ' — Often caused by missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY on Vercel (Production) or blocked requests. Check Vercel env and redeploy.';
            }
            setError(msg);
            setLoading(false);
        } else {
            // In some browsers, onAuthStateChange can lag by a tick.
            // Ensure we have a session before redirecting.
            const session =
                data?.session ??
                (await supabase.auth.getSession()).data.session;
            if (!session) {
                setError('Sign-in succeeded but session is not ready yet. Please try again.');
                setLoading(false);
                return;
            }
            const redirect = searchParams.get('redirect');
            const safe =
                redirect && redirect.startsWith('/') && !redirect.startsWith('//')
                    ? redirect
                    : '/dashboard';
            navigate(safe, { replace: true });
        }
    };

    return (
        <div className="public-page-shell bg-[#0D0D12] text-[#FAF8F5] font-['Inter'] selection:bg-[#C9A84C]/30 selection:text-[#FAF8F5]">
            <MinimalHeader />

            <div className="public-page-content max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[min(85vh,calc(100dvh-6rem))] pb-16 sm:pb-24">
                <div className="w-full max-w-md">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#FAF8F5] mb-4">
                            Welcome Back
                        </h1>
                        <p className="text-[#2A2A35] text-lg font-['JetBrains_Mono']">
                            Access your platform.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {import.meta.env.PROD &&
                            (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) && (
                                <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 p-4 rounded-xl text-sm font-['JetBrains_Mono']">
                                    This build is missing Supabase environment variables. In Vercel, add{' '}
                                    <code className="text-amber-100">VITE_SUPABASE_URL</code> and{' '}
                                    <code className="text-amber-100">VITE_SUPABASE_ANON_KEY</code> for{' '}
                                    <strong>Production</strong>, then trigger a new deployment.
                                </div>
                            )}
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

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm text-[#FAF8F5]/60 font-['JetBrains_Mono']" htmlFor="password">
                                    Password
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-xs text-[#C9A84C] hover:underline font-['JetBrains_Mono']"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="studio-touch-input w-full bg-[#1A1A1A] border border-[#2A2A35] rounded-xl px-4 py-3 text-[#FAF8F5] focus:outline-none focus:border-[#C9A84C] transition-colors"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="studio-touch-btn w-full group relative overflow-hidden bg-[#C9A84C] text-[#0D0D12] sm:py-4 px-8 rounded-full font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {loading ? 'Authenticating...' : 'Sign In'}
                            </span>
                        </button>

                        <div className="text-center mt-6">
                            <p className="text-sm text-[#FAF8F5]/60">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-[#C9A84C] hover:underline">
                                    Create one
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
