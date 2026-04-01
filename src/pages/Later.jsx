import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import MinimalHeader from '../components/MinimalHeader';

export default function Later() {
    return (
        <div className="public-page-shell bg-background flex flex-col items-center justify-center text-center font-sans tracking-tight">
            <MinimalHeader />

            <div className="public-page-content w-full max-w-2xl mx-auto space-y-8 animate-fade-in-up pb-16 flex flex-col justify-center min-h-[min(80vh,calc(100dvh-8rem))]">

                <h1 className="text-5xl md:text-7xl font-bold text-primary leading-[1.1] tracking-tighter">
                    No worries — ready
                    <br />
                    when you are.
                </h1>

                <p className="text-xl md:text-2xl text-text/70 leading-relaxed max-w-xl mx-auto px-4">
                    If you have questions before booking, feel free to reach out directly.
                </p>

                <div className="pt-8 flex flex-col items-center justify-center gap-6">
                    <Link
                        to="/book"
                        className="studio-touch-btn group relative inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 sm:py-4 rounded-2xl font-bold text-lg transition-transform duration-300 hover:-translate-y-1 shadow-[0_10px_40px_-10px_rgba(13,13,18,0.5)] w-full max-w-xs"
                    >
                        <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                        Return to Booking
                    </Link>

                    <a
                        href="mailto:ricki@autolitics.com"
                        className="inline-flex items-center gap-2 text-accent font-bold text-lg hover:text-accent/80 transition-colors duration-300"
                    >
                        <Mail className="w-5 h-5" />
                        Email Ricki
                    </a>
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
