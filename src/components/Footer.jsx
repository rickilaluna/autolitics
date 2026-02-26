import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-[#050508] text-ivory pt-24 pb-12 px-6 rounded-t-[4rem] mt-[-4rem] relative z-20 border-t border-white/5">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-24">
                    {/* Brand Col */}
                    <div className="md:col-span-5 lg:col-span-4">
                        <h2 className="text-2xl font-sans font-bold tracking-tight mb-4">Autolitics Studio</h2>
                        <p className="text-ivory/60 font-mono text-sm leading-relaxed max-w-xs mb-8">
                            Independent Car Buying Advisor
                        </p>
                        <a href="https://id-preview--75fe0aff-f41e-4422-bca1-a702a50ab2a4.lovable.app/book" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-accent font-bold hover:text-white transition-colors group">
                            Book a Free Intro Call
                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </a>
                    </div>

                    {/* Nav Cols */}
                    <div className="md:col-span-7 lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
                        <div>
                            <h3 className="font-mono text-xs text-ivory/40 uppercase tracking-widest mb-6">Navigation</h3>
                            <ul className="space-y-4 text-sm text-ivory/70">
                                <li><a href="#features" className="hover:text-accent transition-colors">Methodology</a></li>
                                <li><a href="#philosophy" className="hover:text-accent transition-colors">Philosophy</a></li>
                                <li><a href="#protocol" className="hover:text-accent transition-colors">Process</a></li>
                                <li><a href="#pricing" className="hover:text-accent transition-colors">Pricing</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-mono text-xs text-ivory/40 uppercase tracking-widest mb-6">Legal</h3>
                            <ul className="space-y-4 text-sm text-ivory/70">
                                <li><a href="#" className="hover:text-accent transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-accent transition-colors">Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-6">
                    <p className="font-mono text-xs text-ivory/40">
                        © 2026 Autolitics Studio. All rights reserved.
                    </p>

                    {/* System Status */}
                    <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                        <div className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                        </div>
                        <span className="font-mono text-[10px] text-ivory/60 uppercase tracking-wider">System Operational</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
