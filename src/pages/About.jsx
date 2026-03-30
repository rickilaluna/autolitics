import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

gsap.registerPlugin(ScrollTrigger);

export default function About() {
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                '.fade-up',
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: 'power3.out' }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="bg-background min-h-screen text-text font-sans relative flex flex-col pt-32 selection:bg-accent/20 selection:text-text">
            {/* Global Noise Overlay */}
            <div className="pointer-events-none fixed inset-0 z-50 opacity-5 mix-blend-overlay">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                    <filter id="noiseFilterAbout">
                        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#noiseFilterAbout)" />
                </svg>
            </div>

            <Navbar />

            <main className="flex-1 w-full max-w-4xl mx-auto px-6 md:px-12 lg:px-20 mb-32 space-y-32">

                {/* Hero Section */}
                <section className="pt-16 md:pt-24 fade-up text-center">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary mb-6">
                        About Autolitics Studio
                    </h1>
                    <p className="text-xl md:text-2xl text-text/70 leading-relaxed max-w-2xl mx-auto">
                        Independent, structured advisory for one of the most significant financial decisions most families make.
                    </p>
                </section>

                {/* Section 1 - Why This Exists */}
                <section className="fade-up scroll-mt-32">
                    <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 tracking-tight">
                        Why Autolitics Studio Exists
                    </h2>
                    <div className="space-y-6 text-lg text-text/80 leading-relaxed font-medium">
                        <p>
                            Buying a car should feel exciting. Instead, for many people, it feels stressful, opaque, and intimidating.
                        </p>
                        <p>
                            Dealerships operate from a well-known playbook. Pricing isn’t always transparent. Add-ons quietly inflate totals. Negotiations stretch into performative back-and-forth. Market adjustments and incentive structures are rarely explained clearly. Even knowing what constitutes a “fair” offer can feel unclear.
                        </p>
                        <p>
                            At the same time, the market itself is overwhelming. Hundreds of models. Rapid EV evolution. Shifting incentives. Platform refresh cycles. Most families only navigate this process every five to ten years — yet the financial impact can be significant.
                        </p>
                        <p>
                            Autolitics Studio exists to bring structure, clarity, and independence to that experience.
                        </p>
                        <p className="text-xl text-primary font-bold italic font-drama pt-4">
                            This isn’t about selling a vehicle.<br />
                            It’s about removing stress, cutting through noise, and making the right decision with confidence.
                        </p>
                    </div>
                </section>

                {/* Section 2 - About Ricki Munoz */}
                <section className="fade-up scroll-mt-32">
                    <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 tracking-tight">
                        About Ricki Muñoz
                    </h2>
                    <div className="space-y-6 text-lg text-text/80 leading-relaxed font-medium">
                        <p>
                            I’ve spent decades studying the automotive industry — from product strategy and model cycles to depreciation patterns, EV transition dynamics, and manufacturer positioning.
                        </p>
                        <p>
                            My background combines deep automotive knowledge with structured, analytical decision-making. I approach vehicle purchases the way strategic advisors approach high-stakes decisions: with clarity, tradeoff awareness, and long-term thinking.
                        </p>
                        <p>
                            Autolitics Studio is fully independent. I receive no commissions, referral fees, or incentives from manufacturers or dealerships.
                        </p>
                        <div className="mt-8 p-8 md:p-10 bg-white rounded-[2rem] border border-text/5 shadow-sm text-center">
                            <p className="text-text/70">Not a salesperson.</p>
                            <p className="text-text/70">Not a broker.</p>
                            <p className="text-xl text-primary font-bold mt-2">A strategic advisor in your corner.</p>
                        </div>
                    </div>
                </section>

                {/* Section 3 - Philosophy */}
                <section className="fade-up scroll-mt-32">
                    <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 tracking-tight">
                        The Advisory Philosophy
                    </h2>
                    <ul className="space-y-4 text-lg text-text/80 leading-relaxed font-medium list-none pl-0">
                        <li className="flex items-start gap-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2.5 shrink-0"></span>
                            <span>Clarity before recommendation</span>
                        </li>
                        <li className="flex items-start gap-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2.5 shrink-0"></span>
                            <span>Strategy before emotion</span>
                        </li>
                        <li className="flex items-start gap-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2.5 shrink-0"></span>
                            <span>Tradeoffs acknowledged, not hidden</span>
                        </li>
                        <li className="flex items-start gap-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2.5 shrink-0"></span>
                            <span>Long-term ownership positioning considered</span>
                        </li>
                        <li className="flex items-start gap-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2.5 shrink-0"></span>
                            <span>Independent, transparent guidance</span>
                        </li>
                    </ul>
                </section>

                {/* Section 4 - CTA */}
                <section className="fade-up text-center bg-primary rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
                    {/* Noise over dark bg for texture */}
                    <div className="pointer-events-none absolute inset-0 z-0 opacity-10 mix-blend-overlay">
                        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                            <filter id="noiseFilterctaAbout">
                                <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
                            </filter>
                            <rect width="100%" height="100%" filter="url(#noiseFilterctaAbout)" />
                        </svg>
                    </div>

                    <div className="relative z-10 max-w-xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-10 tracking-tight leading-tight">
                            Ready for a more thoughtful car-buying experience?
                        </h2>

                        <Link
                            to="/book"
                            className="inline-block relative overflow-hidden group/btn bg-accent text-primary px-8 py-4 rounded-full font-bold text-lg transition-transform duration-300 hover:scale-[1.03] shadow-[0_4px_20px_rgba(201,168,76,0.2)]"
                            style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
                        >
                            <span className="relative z-10 block transition-transform group-hover/btn:-translate-y-[1px]">
                                Schedule Intro Strategy Session
                            </span>
                            <span className="absolute inset-0 bg-white/30 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 rounded-full"></span>
                        </Link>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}
