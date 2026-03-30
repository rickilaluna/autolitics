import React from 'react';
import { Check, ShieldCheck } from 'lucide-react';
import MinimalHeader from '../components/MinimalHeader';

export default function CoreAdvisory() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center py-16 px-6 pt-32 font-sans text-text">

            <MinimalHeader />

            <div className="w-full max-w-2xl mx-auto flex flex-col items-center text-center animate-fade-in-up">

                {/* Header */}
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary mb-4">
                    Start Your Core<br />Advisory
                </h1>

                <p className="text-lg md:text-xl text-text/70 leading-relaxed max-w-lg mb-12">
                    A strategic, structured approach to your next vehicle purchase.
                </p>

                {/* Pricing / Features Card */}
                <div className="w-full max-w-xl bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-text/5 text-left mb-8 flex flex-col items-center">

                    <h2 className="text-5xl font-bold text-primary mb-2">$850</h2>
                    <p className="text-text/60 font-medium mb-8">Flat fee — one-time payment</p>

                    <div className="w-full space-y-4 mb-8">
                        <div className="flex items-start gap-4">
                            <div className="w-7 h-7 rounded-full bg-accent/10 flex shrink-0 items-center justify-center border border-accent/20">
                                <Check className="w-4 h-4 text-accent" strokeWidth={3} />
                            </div>
                            <span className="text-text/80 font-medium pt-0.5">60–75 minute deep-dive discovery session</span>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-7 h-7 rounded-full bg-accent/10 flex shrink-0 items-center justify-center border border-accent/20">
                                <Check className="w-4 h-4 text-accent" strokeWidth={3} />
                            </div>
                            <span className="text-text/80 font-medium pt-0.5">Personalized vehicle shortlist & strategy</span>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-7 h-7 rounded-full bg-accent/10 flex shrink-0 items-center justify-center border border-accent/20">
                                <Check className="w-4 h-4 text-accent" strokeWidth={3} />
                            </div>
                            <span className="text-text/80 font-medium pt-0.5">Test drive planning & offer guidance</span>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-7 h-7 rounded-full bg-accent/10 flex shrink-0 items-center justify-center border border-accent/20">
                                <Check className="w-4 h-4 text-accent" strokeWidth={3} />
                            </div>
                            <span className="text-text/80 font-medium pt-0.5">Decision confidence framework</span>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-7 h-7 rounded-full bg-accent/10 flex shrink-0 items-center justify-center border border-accent/20">
                                <Check className="w-4 h-4 text-accent" strokeWidth={3} />
                            </div>
                            <span className="text-text/80 font-medium pt-0.5">Ongoing support through purchase</span>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-7 h-7 rounded-full bg-accent/10 flex shrink-0 items-center justify-center border border-accent/20">
                                <Check className="w-4 h-4 text-accent" strokeWidth={3} />
                            </div>
                            <span className="text-text/80 font-medium pt-0.5">Independent, brand-neutral advice</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-text/60 text-sm mb-8 w-full font-medium">
                        <ShieldCheck className="w-4 h-4 text-accent" />
                        <span>Flat-fee. No commissions. No dealerships.</span>
                    </div>

                    <a
                        href="https://buy.stripe.com/aFabJ1boS4L1gf65zz8N200"
                        className="w-full block overflow-hidden relative group/btn bg-primary text-white px-8 py-4 rounded-full font-bold text-center text-lg transition-transform duration-300 shadow-[0_4px_14px_rgba(13,13,18,0.3)] hover:scale-[1.03] mb-4"
                        style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
                    >
                        <span className="relative z-10 block transition-transform group-hover/btn:-translate-y-[1px]">
                            Pay $850 & Continue
                        </span>
                        <span className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 rounded-full"></span>
                    </a>

                    <p className="text-text/50 text-sm text-center">
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
