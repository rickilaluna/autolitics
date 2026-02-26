import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';

export default function Later() {
    return (
        <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center p-6 text-center font-sans tracking-tight">
            <div className="w-full max-w-2xl mx-auto space-y-8 animate-fade-in-up">

                <h1 className="text-5xl md:text-7xl font-bold text-[#1a1a1a] leading-[1.1] tracking-tighter">
                    No worries — ready
                    <br />
                    when you are.
                </h1>

                <p className="text-xl md:text-2xl text-[#6B7280] leading-relaxed max-w-xl mx-auto px-4">
                    If you have questions before booking, feel free to reach out directly.
                </p>

                <div className="pt-8 flex flex-col items-center justify-center gap-6">
                    <Link
                        to="/book"
                        className="group relative inline-flex items-center justify-center gap-2 bg-[#448CF9] hover:bg-[#347BE8] text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:-translate-y-1 shadow-[0_10px_40px_-10px_rgba(68,140,249,0.5)] w-full max-w-xs"
                    >
                        <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                        Return to Booking
                    </Link>

                    <a
                        href="mailto:ricki@autolitics.com"
                        className="inline-flex items-center gap-2 text-[#448CF9] font-medium text-lg hover:text-[#347BE8] transition-colors duration-300"
                    >
                        <Mail className="w-5 h-5" />
                        Email Ricki
                    </a>
                </div>

            </div>

            {/* Micro-Animation Styles for the simple entrance */}
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
