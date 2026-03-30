import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, MessageSquare, ArrowRight, DollarSign } from 'lucide-react';
import MinimalHeader from '../components/MinimalHeader';

export default function Scheduled() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center py-16 px-6 pt-32 font-sans text-text">

            <MinimalHeader />

            <div className="w-full max-w-2xl mx-auto flex flex-col items-center text-center animate-fade-in-up">

                {/* Icon */}
                <div className="w-16 h-16 bg-accent/10 rounded-[2rem] flex items-center justify-center mb-8 border border-accent/20">
                    <CalendarCheck className="w-8 h-8 text-accent" />
                </div>

                {/* Header */}
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary mb-6">
                    You're Scheduled.
                </h1>

                <p className="text-lg md:text-xl text-text/70 leading-relaxed max-w-lg mb-6">
                    You'll receive a calendar invite shortly. I'll review your notes and come prepared with focused questions.
                </p>

                <p className="font-bold text-primary mb-10">
                    No preparation needed on your end.
                </p>

                {/* Cards Container */}
                <div className="w-full max-w-xl text-left space-y-6">

                    {/* What to Expect Card */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-text/5">
                        <h2 className="font-bold text-primary text-lg mb-6">What to Expect</h2>

                        <div className="space-y-5">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0 border border-accent/20">
                                    <MessageSquare className="w-4 h-4 text-accent" />
                                </div>
                                <span className="text-text/80 font-medium">A structured conversation</span>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0 border border-accent/20">
                                    <ArrowRight className="w-4 h-4 text-accent" />
                                </div>
                                <span className="text-text/80 font-medium">Clear next steps</span>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0 border border-accent/20">
                                    <DollarSign className="w-4 h-4 text-accent" />
                                </div>
                                <span className="text-text/80 font-medium">Transparent pricing discussion if it's a fit</span>
                            </div>
                        </div>
                    </div>

                    {/* Next Steps Card */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-text/5">
                        <h2 className="font-bold text-primary text-lg mb-4">Next Steps</h2>
                        <p className="text-text/70 leading-relaxed font-medium">
                            After our intro call, if it's a fit, I'll send a simple link to start the Core Advisory ($850 flat fee) and schedule your 60–75 minute discovery session.
                        </p>
                    </div>

                </div>

                {/* Actions */}
                <div className="mt-10 flex flex-col items-center gap-6 w-full max-w-xl text-center">
                    <Link
                        to="/"
                        className="w-full sm:w-auto overflow-hidden relative group/btn bg-primary text-white px-8 py-4 rounded-full font-bold text-sm transition-transform duration-300 hover:scale-[1.03] shadow-[0_4px_14px_rgba(13,13,18,0.3)]"
                        style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
                    >
                        <span className="relative z-10 block transition-transform group-hover/btn:-translate-y-[1px]">
                            Return to Autolitics Studio Home
                        </span>
                        <span className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 rounded-full"></span>
                    </Link>

                    <Link
                        to="/core-advisory"
                        className="text-accent font-bold hover:text-accent/80 transition-colors flex items-center gap-2 group text-sm"
                    >
                        Already ready to proceed? Start Core Advisory
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
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
