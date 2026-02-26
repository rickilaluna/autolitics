import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ShieldCheck } from 'lucide-react';

export default function CoreAdvisory() {
    return (
        <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center py-16 px-6 font-sans text-[#1a1a1a]">

            <div className="w-full max-w-2xl mx-auto flex flex-col items-center text-center animate-fade-in-up">

                {/* Header */}
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
                    Start Your Core<br />Advisory
                </h1>

                <p className="text-lg md:text-xl text-[#6B7280] leading-relaxed max-w-lg mb-12">
                    A strategic, structured approach to your next vehicle purchase.
                </p>

                {/* Pricing / Features Card */}
                <div className="w-full max-w-xl bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-black/5 text-left mb-8 flex flex-col items-center">

                    <h2 className="text-5xl font-bold mb-2">$850</h2>
                    <p className="text-[#6B7280] mb-8">Flat fee — one-time payment</p>

                    <div className="w-full space-y-4 mb-8">
                        <div className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-[#EBF3FF] flex shrink-0 items-center justify-center mt-0.5">
                                <Check className="w-3 h-3 text-[#448CF9]" strokeWidth={3} />
                            </div>
                            <span className="text-[#374151]">60–75 minute deep-dive discovery session</span>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-[#EBF3FF] flex shrink-0 items-center justify-center mt-0.5">
                                <Check className="w-3 h-3 text-[#448CF9]" strokeWidth={3} />
                            </div>
                            <span className="text-[#374151]">Personalized vehicle shortlist & strategy</span>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-[#EBF3FF] flex shrink-0 items-center justify-center mt-0.5">
                                <Check className="w-3 h-3 text-[#448CF9]" strokeWidth={3} />
                            </div>
                            <span className="text-[#374151]">Test drive planning & offer guidance</span>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-[#EBF3FF] flex shrink-0 items-center justify-center mt-0.5">
                                <Check className="w-3 h-3 text-[#448CF9]" strokeWidth={3} />
                            </div>
                            <span className="text-[#374151]">Decision confidence framework</span>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-[#EBF3FF] flex shrink-0 items-center justify-center mt-0.5">
                                <Check className="w-3 h-3 text-[#448CF9]" strokeWidth={3} />
                            </div>
                            <span className="text-[#374151]">Ongoing support through purchase</span>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-[#EBF3FF] flex shrink-0 items-center justify-center mt-0.5">
                                <Check className="w-3 h-3 text-[#448CF9]" strokeWidth={3} />
                            </div>
                            <span className="text-[#374151]">Independent, brand-neutral advice</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-[#6B7280] text-sm mb-8 w-full">
                        <ShieldCheck className="w-4 h-4 text-[#448CF9]" />
                        <span>Flat-fee. No commissions. No dealership relationships.</span>
                    </div>

                    <a
                        href="https://buy.stripe.com/aFabJ1boS4L1gf65zz8N200"
                        className="w-full block text-center bg-[#448CF9] hover:bg-[#347BE8] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-[0_4px_14px_rgba(68,140,249,0.3)] hover:-translate-y-0.5 mb-4"
                    >
                        Pay $850 & Continue
                    </a>

                    <p className="text-[#6B7280] text-sm">
                        After payment, we'll schedule your discovery session.
                    </p>

                </div>
            </div>

            <style>{`
                .animate-fade-in-up {
                    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    opacity: 0;
                    transform: translateY(20px);
                }
                @keyframes fadeInUp {
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}
