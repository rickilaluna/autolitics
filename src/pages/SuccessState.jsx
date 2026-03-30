import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import MinimalHeader from '../components/MinimalHeader';

const SuccessState = () => {
    const location = useLocation();
    const { user } = useAuth();
    const [productType, setProductType] = useState('advisory'); // default

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const product = params.get('product');
        if (product) {
            setProductType(product);
        }
    }, [location]);

    return (
        <div className="min-h-screen bg-[#0D0D12] text-[#FAF8F5] font-['Inter']">
            <MinimalHeader />

            <div className="pt-32 pb-24 px-6 sm:px-12 max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[80vh] text-center">
                <div className="bg-[#C9A84C]/10 w-24 h-24 rounded-[2rem] flex items-center justify-center mb-10 border border-[#C9A84C]/20 shadow-[0_0_50px_rgba(201,168,76,0.1)]">
                    <CheckCircle2 size={48} className="text-[#C9A84C]" />
                </div>

                {productType === 'guide' ? (
                    <>
                        <h1 className="text-4xl sm:text-5xl font-['Playfair_Display'] italic mb-6">Purchase Complete</h1>
                        <p className="text-lg text-[#FAF8F5]/70 max-w-xl mx-auto mb-12 font-['JetBrains_Mono']">
                            Thank you for purchasing The Strategic Car Buyer guide. Your payment was successful.
                        </p>

                        <div className="p-6 sm:p-8 bg-[#1A1A24] border border-[#2A2A35] rounded-3xl w-full max-w-md">
                            <h2 className="font-semibold text-lg mb-4">Next Steps:</h2>
                            <ul className="text-left text-[#FAF8F5]/80 space-y-4 mb-8">
                                <li className="flex gap-3">
                                    <span className="text-[#C9A84C] font-['JetBrains_Mono'] mt-0.5">01</span>
                                    <span>Create your platform account (or log in) to securely access the digital guide and unlock download templates.</span>
                                </li>
                            </ul>

                            {user ? (
                                <Link to="/dashboard" className="w-full relative overflow-hidden bg-[#C9A84C] text-[#0D0D12] py-4 px-8 rounded-full font-semibold transition-transform duration-300 hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-2">
                                    <span className="relative z-10 block">Enter Dashboard</span>
                                </Link>
                            ) : (
                                <Link to="/register" className="w-full relative overflow-hidden bg-[#C9A84C] text-[#0D0D12] py-4 px-8 rounded-full font-semibold transition-transform duration-300 hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-2">
                                    <span className="relative z-10 block">Create Account</span>
                                </Link>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <h1 className="text-4xl sm:text-5xl font-['Playfair_Display'] italic mb-6">Payment Secured</h1>
                        <p className="text-lg text-[#FAF8F5]/70 max-w-xl mx-auto mb-12 font-['JetBrains_Mono']">
                            Your Core Advisory engagement is confirmed. The team will be in touch shortly to align on next steps.
                        </p>

                        <div className="p-6 sm:p-8 bg-[#1A1A24] border border-[#2A2A35] rounded-3xl w-full max-w-md">
                            <h2 className="font-semibold text-lg mb-4">Next Steps:</h2>
                            <ul className="text-left text-[#FAF8F5]/80 space-y-4 mb-8">
                                <li className="flex gap-3">
                                    <span className="text-[#C9A84C] font-['JetBrains_Mono'] mt-0.5">01</span>
                                    <span>Schedule your discovery session.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-[#C9A84C] font-['JetBrains_Mono'] mt-0.5">02</span>
                                    <span>Register for your client dashboard port to view deliverables.</span>
                                </li>
                            </ul>

                            <div className="flex flex-col gap-3">
                                <Link to="/book" className="w-full relative overflow-hidden bg-[#C9A84C] text-[#0D0D12] py-4 px-8 rounded-full font-semibold transition-transform duration-300 hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-2">
                                    <span className="relative z-10 block">Schedule Session</span>
                                </Link>
                                {!user && (
                                    <Link to="/register" className="w-full py-4 px-8 rounded-full font-semibold text-[#FAF8F5]/80 hover:text-[#FAF8F5] transition-colors flex items-center justify-center">
                                        Create Client Account
                                    </Link>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SuccessState;
