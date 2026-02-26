import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, MessageSquare, ArrowRight, DollarSign } from 'lucide-react';

export default function Scheduled() {
    return (
        <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center py-16 px-6 font-sans text-[#1a1a1a]">

            <div className="w-full max-w-2xl mx-auto flex flex-col items-center text-center animate-fade-in-up">

                {/* Icon */}
                <div className="w-16 h-16 bg-[#EBF3FF] rounded-2xl flex items-center justify-center mb-8">
                    <CalendarCheck className="w-8 h-8 text-[#448CF9]" />
                </div>

                {/* Header */}
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                    You're Scheduled.
                </h1>

                <p className="text-lg md:text-xl text-[#6B7280] leading-relaxed max-w-lg mb-6">
                    You'll receive a calendar invite shortly. I'll review your notes and come prepared with focused questions.
                </p>

                <p className="font-semibold mb-10">
                    No preparation needed on your end.
                </p>

                {/* Cards Container */}
                <div className="w-full max-w-xl text-left space-y-6">

                    {/* What to Expect Card */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-black/5">
                        <h2 className="font-bold text-lg mb-6">What to Expect</h2>

                        <div className="space-y-5">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-[#EBF3FF] flex items-center justify-center shrink-0">
                                    <MessageSquare className="w-5 h-5 text-[#448CF9]" />
                                </div>
                                <span className="text-[#4B5563]">A structured conversation</span>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-[#EBF3FF] flex items-center justify-center shrink-0">
                                    <ArrowRight className="w-5 h-5 text-[#448CF9]" />
                                </div>
                                <span className="text-[#4B5563]">Clear next steps</span>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-[#EBF3FF] flex items-center justify-center shrink-0">
                                    <DollarSign className="w-5 h-5 text-[#448CF9]" />
                                </div>
                                <span className="text-[#4B5563]">Transparent pricing discussion if it's a fit</span>
                            </div>
                        </div>
                    </div>

                    {/* Next Steps Card */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-black/5">
                        <h2 className="font-bold text-lg mb-4">Next Steps</h2>
                        <p className="text-[#4B5563] leading-relaxed">
                            After our intro call, if it's a fit, I'll send a simple link to start the Core Advisory ($850 flat fee) and schedule your 60–75 minute discovery session.
                        </p>
                    </div>

                </div>

                {/* Actions */}
                <div className="mt-10 flex flex-col items-center gap-6">
                    <Link
                        to="/"
                        className="bg-[#448CF9] hover:bg-[#347BE8] text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-[0_4px_14px_rgba(68,140,249,0.3)] hover:-translate-y-0.5"
                    >
                        Return to Autolitics Studio Home
                    </Link>

                    <Link
                        to="/core-advisory"
                        className="text-[#448CF9] font-medium hover:text-[#347BE8] transition-colors flex items-center gap-1 group"
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
