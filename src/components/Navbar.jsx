import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

export default function Navbar() {
    const navRef = useRef(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Morphing Logic: Transparent at top -> solid background on scroll
            ScrollTrigger.create({
                start: 'top -50',
                end: 99999,
                toggleClass: {
                    className: 'scrolled',
                    targets: navRef.current,
                },
            });
        });
        return () => ctx.revert();
    }, []);

    return (
        <div className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
            <nav
                ref={navRef}
                className="group pointer-events-auto flex items-center justify-between px-6 py-3 rounded-[2rem] transition-all duration-500 w-full max-w-4xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg ring-1 ring-white/10 [&.scrolled]:bg-background/80 [&.scrolled]:backdrop-blur-xl [&.scrolled]:border-text/10 [&.scrolled]:ring-text/5 [&.scrolled]:shadow-sm"
            >
                <div className="flex items-center gap-3 transition-opacity duration-500">
                    <img src="/img/autolitics 3x yellow.png" alt="Autolitics Studio logo" className="h-6 w-auto" onError={(e) => { e.target.onerror = null; e.target.src = '../img/autolitics 3x yellow.png' }} />
                    <span className="text-xl font-bold tracking-tight text-white group-[.scrolled]:text-primary transition-colors duration-500">
                        Autolitics Studio
                    </span>
                </div>
                <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-white/90 group-[.scrolled]:text-text/70 transition-colors duration-500">
                    <a href="#features" className="hover:-translate-y-[1px] transition-transform duration-300 hover:text-white group-[.scrolled]:hover:text-primary">Methodology</a>
                    <a href="#philosophy" className="hover:-translate-y-[1px] transition-transform duration-300 hover:text-white group-[.scrolled]:hover:text-primary">Philosophy</a>
                    <a href="#protocol" className="hover:-translate-y-[1px] transition-transform duration-300 hover:text-white group-[.scrolled]:hover:text-primary">Protocol</a>
                </div>
                <Link
                    to="/book"
                    className="hidden md:block relative group overflow-hidden bg-accent text-primary px-6 py-2.5 rounded-full font-bold text-sm transition-transform duration-300 hover:scale-[1.03]"
                    style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
                >
                    <span className="relative z-10 block transition-transform group-hover:-translate-y-[1px]">
                        Book Intro Call
                    </span>
                    <span className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-full"></span>
                </Link>
            </nav>
        </div>
    );
}
