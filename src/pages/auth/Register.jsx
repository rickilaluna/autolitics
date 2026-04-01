import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import MinimalHeader from '../../components/MinimalHeader';

const Register = () => {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error, data } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                }
            }
        });

        if (error) {
            setError(error.message);
        } else {
            // Supabase normally requires email verification by default
            if (data?.user?.identities?.length === 0) {
                setError('User already exists');
            } else {
                setSuccessMsg('Registration successful. Please check your email to verify your account or proceed to login if auto-login is enabled on your mock setup.');
                // Auto redirecting to dashboard for demo if email confirmation is off
                if (data?.session) {
                    navigate('/dashboard');
                }
            }
        }
        setLoading(false);
    };

    return (
        <div className="public-page-shell bg-[#0D0D12] text-[#FAF8F5] font-['Inter'] selection:bg-[#C9A84C]/30 selection:text-[#FAF8F5]">
            <MinimalHeader />

            <div className="public-page-content max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[min(85vh,calc(100dvh-6rem))] pb-16 sm:pb-24">
                <div className="w-full max-w-md">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#FAF8F5] mb-4">
                            Create Account
                        </h1>
                        <p className="text-[#2A2A35] text-lg font-['JetBrains_Mono']">
                            Join the platform.
                        </p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-['JetBrains_Mono']">
                                {error}
                            </div>
                        )}
                        {successMsg && (
                            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl text-sm font-['JetBrains_Mono']">
                                {successMsg}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-[#FAF8F5]/60 mb-2 font-['JetBrains_Mono']" htmlFor="firstName">
                                    First Name
                                </label>
                                <input
                                    id="firstName"
                                    type="text"
                                    required
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="studio-touch-input w-full bg-[#1A1A1A] border border-[#2A2A35] rounded-xl px-4 py-3 text-[#FAF8F5] focus:outline-none focus:border-[#C9A84C] transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-[#FAF8F5]/60 mb-2 font-['JetBrains_Mono']" htmlFor="lastName">
                                    Last Name
                                </label>
                                <input
                                    id="lastName"
                                    type="text"
                                    required
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="studio-touch-input w-full bg-[#1A1A1A] border border-[#2A2A35] rounded-xl px-4 py-3 text-[#FAF8F5] focus:outline-none focus:border-[#C9A84C] transition-colors"
                                />
                            </div>
                        </div>

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
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-[#FAF8F5]/60 mb-2 font-['JetBrains_Mono']" htmlFor="password">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="studio-touch-input w-full bg-[#1A1A1A] border border-[#2A2A35] rounded-xl px-4 py-3 text-[#FAF8F5] focus:outline-none focus:border-[#C9A84C] transition-colors"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="studio-touch-btn w-full group relative overflow-hidden bg-[#C9A84C] text-[#0D0D12] sm:py-4 px-8 rounded-full font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {loading ? 'Creating...' : 'Create Account'}
                            </span>
                        </button>

                        <div className="text-center mt-6">
                            <p className="text-sm text-[#FAF8F5]/60">
                                Already have an account?{' '}
                                <Link to="/login" className="text-[#C9A84C] hover:underline">
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
