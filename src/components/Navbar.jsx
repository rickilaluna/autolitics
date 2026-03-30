import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

gsap.registerPlugin(ScrollTrigger);

export default function Navbar() {
    const navRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user } = useAuth();

    // Scroll to hash on page load if coming from another page
    useEffect(() => {
        if (location.hash) {
            const id = location.hash.replace('#', '');
            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) {
                    const offset = 100;
                    const top = element.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            }, 100);
        } else if (location.pathname !== '/') {
            window.scrollTo(0, 0);
        }
    }, [location]);

    const isHome = location.pathname === '/';

    useLayoutEffect(() => {
        if (!isHome) return;

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
    }, [isHome]);

    // Handle smooth scrolling for anchor links to prevent hard jumps
    const handleAnchorClick = (e, targetId) => {
        e.preventDefault();
        setIsMobileMenuOpen(false);

        if (location.pathname !== '/') {
            navigate(`/#${targetId}`);
        } else {
            const element = document.getElementById(targetId);
            if (element) {
                const offset = 100;
                const top = element.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
                // Optionally update URL
                window.history.pushState(null, '', `/#${targetId}`);
            }
        }
    };

    const handleLogoClick = (e) => {
        if (isHome) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            // remove hash from URL if present without reloading
            window.history.pushState(null, '', '/');
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isMobileMenuOpen]);

    const getLinkStyle = (path) => {
        const isActive = location.pathname === path;
        return `relative hover:-translate-y-[1px] transition-transform duration-300 hover:text-white group-[.scrolled]:hover:text-primary ${isActive ? 'text-white group-[.scrolled]:text-primary font-bold' : ''} after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[2px] after:bg-accent after:transition-all after:duration-300 ${isActive ? 'after:scale-x-100 after:opacity-100' : 'after:scale-x-0 after:opacity-0 hover:after:scale-x-100 hover:after:opacity-50'}`;
    };

    return (
        <>
            <div className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
                <nav
                    ref={navRef}
                    className={`group pointer-events-auto flex items-center gap-4 pl-5 pr-3 py-3 rounded-[2rem] transition-all duration-500 w-full max-w-5xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg ring-1 ring-white/10 [&.scrolled]:bg-background/90 [&.scrolled]:backdrop-blur-xl [&.scrolled]:border-text/10 [&.scrolled]:ring-text/5 [&.scrolled]:shadow-sm ${!isHome ? 'scrolled' : ''}`}
                >
                    <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2 shrink-0 transition-opacity duration-500 z-50">
                        <img src="/img/autolitics%203x%20yellow.png" alt="Autolitics Studio logo" className="h-6 w-auto" />
                        <span className="text-base font-bold tracking-tight text-white group-[.scrolled]:text-primary transition-colors duration-500 whitespace-nowrap">
                            Autolitics Studio
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-5 text-sm font-medium text-white/90 group-[.scrolled]:text-text/70 transition-colors duration-500 flex-1 justify-center">
                        <a href="#philosophy" onClick={(e) => handleAnchorClick(e, 'philosophy')} className={getLinkStyle('/#philosophy')}>Method</a>
                        <a href="#protocol" onClick={(e) => handleAnchorClick(e, 'protocol')} className={getLinkStyle('/#protocol')}>Process</a>
                        <a href="#pricing" onClick={(e) => handleAnchorClick(e, 'pricing')} className={getLinkStyle('/#pricing')}>Pricing</a>
                        <Link to="/guide" className={getLinkStyle('/guide')}>Guide</Link>

                        <div className="w-px h-4 bg-white/20 group-[.scrolled]:bg-text/10"></div>

                        <Link to="/about" className={getLinkStyle('/about')}>About</Link>
                        <Link to="/faq" className={getLinkStyle('/faq')}>FAQ</Link>

                        {user ? (
                            <Link to="/dashboard" className={getLinkStyle('/dashboard')}>Dashboard</Link>
                        ) : (
                            <Link to="/login" className={getLinkStyle('/login')}>Login</Link>
                        )}
                    </div>

                    <Link
                        to="/book"
                        className="hidden lg:block shrink-0 relative group/btn overflow-hidden bg-accent text-primary px-5 py-2.5 rounded-full font-bold text-sm transition-transform duration-300 hover:scale-[1.03] whitespace-nowrap"
                        style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
                    >
                        <span className="relative z-10 block transition-transform group-hover/btn:-translate-y-[1px]">
                            Book a Strategy Session
                        </span>
                        <span className="absolute right-0 bottom-0 w-full h-full bg-white/30 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 rounded-full"></span>
                    </Link>

                    {/* Mobile Menu Toggle button */}
                    <button
                        className="lg:hidden text-white group-[.scrolled]:text-primary z-50 p-2 focus:outline-none"
                        onClick={toggleMobileMenu}
                        aria-label="Toggle navigation menu"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                </nav>
            </div>

            {/* Mobile Navigation Drawer */}
            <div
                ref={mobileMenuRef}
                className={`fixed inset-0 z-40 bg-[#0D0D12] text-[#FAF8F5] transition-transform duration-500 ease-in-out lg:hidden flex flex-col pt-32 pb-8 px-8 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Noise overlay for mobile menu */}
                <div className="pointer-events-none fixed inset-0 z-[-1] opacity-5 mix-blend-overlay">
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                        <filter id="noiseFilterMobile">
                            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
                        </filter>
                        <rect width="100%" height="100%" filter="url(#noiseFilterMobile)" />
                    </svg>
                </div>

                <div className="flex flex-col space-y-8 text-2xl font-bold font-sans tracking-tight mb-auto">
                    <a href="#philosophy" onClick={(e) => handleAnchorClick(e, 'philosophy')} className="hover:text-accent transition-colors">Method</a>
                    <a href="#protocol" onClick={(e) => handleAnchorClick(e, 'protocol')} className="hover:text-accent transition-colors">Process</a>
                    <a href="#pricing" onClick={(e) => handleAnchorClick(e, 'pricing')} className="hover:text-accent transition-colors">Pricing</a>
                    <Link to="/guide" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-accent transition-colors">Guide</Link>

                    <div className="w-full h-[1px] bg-white/10"></div>

                    <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-accent transition-colors">About</Link>
                    <Link to="/faq" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-accent transition-colors">FAQ</Link>

                    {user ? (
                        <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-accent transition-colors">Dashboard</Link>
                    ) : (
                        <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-accent transition-colors">Login</Link>
                    )}
                </div>

                <Link
                    to="/book"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full relative overflow-hidden bg-[#C9A84C] text-[#0D0D12] px-6 py-4 rounded-full font-bold text-lg text-center transition-transform duration-300 active:scale-95"
                >
                    <span className="relative z-10 block">
                        Schedule Intro Strategy Session
                    </span>
                </Link>
            </div>
        </>
    );
}
