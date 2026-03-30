import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const Check = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

export default function Pricing() {
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                '.pricing-el',
                { y: 40, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    stagger: 0.15,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: 'top 70%',
                    }
                }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const guideIncludes = [
        'Full digital guide',
        'Vehicle Decision Engine',
        'Test Drive Scorecard',
        'Vehicle Comparison Matrix',
        'Dealer Offer Comparison Template',
        'Negotiation Strategy Guide',
        'Printable worksheets and templates',
    ];

    const advisoryIncludes = [
        '60–75 minute discovery session',
        '3–5 vehicle shortlist with clear rationale',
        'Ownership cost and positioning insights',
        'Test drive evaluation framework',
        'Offer and pricing guidance',
        'Final decision confidence review',
    ];

    const negotiationIncludes = [
        'Offer structure review',
        'Lease vs. finance comparison',
        'Incentive and pricing analysis',
        'Live email or call support during negotiation',
    ];

    return (
        <section id="pricing" ref={containerRef} className="pt-32 pb-48 lg:pb-64 bg-background px-6">
            <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
                <h2 className="pricing-el text-4xl md:text-5xl lg:text-6xl font-sans font-bold text-primary max-w-3xl leading-[1.1] mb-6 tracking-tight">
                    Simple, Transparent Pricing
                </h2>
                <p className="pricing-el text-lg text-text/70 max-w-2xl mb-4">
                    Choose the level of support that fits your car buying journey.
                </p>
                <p className="pricing-el text-base text-text/60 max-w-2xl mb-16">
                    Most buyers start with the Guide. Those who want expert support upgrade to Advisory.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl items-stretch">

                    {/* Card 1 — Strategic Car Buyer Guide */}
                    <div className="pricing-el bg-white rounded-[2rem] p-8 border-2 border-accent/20 shadow-lg hover:shadow-xl hover:border-accent/40 transition-all duration-300 text-left flex flex-col relative">
                        <div className="mb-6">
                            <span className="text-[10px] font-mono text-accent uppercase tracking-[0.2em] font-semibold">Digital Guide</span>
                            <h3 className="text-2xl font-bold font-sans text-primary mt-2 mb-4">The Strategic Car Buyer Guide</h3>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-4xl font-sans font-bold text-primary tracking-tighter">$149</span>
                            </div>
                            <p className="text-text/70 text-sm leading-relaxed mb-6">
                                A complete framework and toolset for confident independent car buying.
                            </p>
                            <ul className="space-y-3 text-sm text-text">
                                {guideIncludes.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <span className="text-accent mt-0.5 shrink-0"><Check /></span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <p className="text-xs text-text/50 mb-2">Instant digital access. Work at your own pace.</p>
                        <p className="text-xs text-accent/90 font-medium mb-6">Guide buyers can upgrade to Advisory later.</p>
                        <div className="mt-auto pt-6 border-t border-text/5">
                            <Link
                                to="/guide"
                                className="block w-full text-center bg-accent text-primary px-6 py-4 rounded-full font-bold text-sm transition-all duration-300 hover:opacity-95 hover:shadow-[0_0_20px_rgba(201,168,76,0.25)]"
                            >
                                Get the Guide
                            </Link>
                        </div>
                    </div>

                    {/* Card 2 — Core Advisory */}
                    <div className="pricing-el bg-primary text-[#FAF8F5] rounded-[2rem] p-8 border border-white/10 shadow-2xl text-left flex flex-col relative md:-translate-y-2">
                        <div className="absolute top-6 right-6 bg-accent/20 text-accent text-[10px] uppercase font-bold tracking-wider py-1.5 px-3 rounded-full">
                            Expert Guidance
                        </div>
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold font-sans mt-2 mb-4">Core Advisory</h3>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-4xl font-sans font-bold tracking-tighter">$850</span>
                                <span className="text-[#FAF8F5]/60 font-medium text-sm">flat fee</span>
                            </div>
                            <p className="text-[#FAF8F5]/70 text-sm leading-relaxed mb-6">
                                Personalized expert guidance from vehicle strategy through final purchase decision.
                            </p>
                            <ul className="space-y-3 text-sm">
                                {advisoryIncludes.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <span className="text-accent mt-0.5 shrink-0"><Check /></span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <p className="text-xs text-[#FAF8F5]/50 mb-6">Limited availability for high-touch client support.</p>
                        <div className="mt-auto pt-6 border-t border-white/10">
                            <Link
                                to="/core-advisory"
                                className="block w-full text-center bg-accent text-primary px-6 py-4 rounded-full font-bold text-sm transition-transform duration-300 hover:scale-[1.02] shadow-[0_0_15px_rgba(201,168,76,0.3)]"
                            >
                                Start Your Advisory
                            </Link>
                        </div>
                    </div>

                    {/* Card 3 — Negotiation Support */}
                    <div className="pricing-el bg-white rounded-[2rem] p-8 border border-text/10 shadow-sm text-left flex flex-col relative">
                        <div className="absolute top-6 right-6 border border-text/20 text-text/50 text-[10px] uppercase font-bold tracking-wider py-1.5 px-3 rounded-full">
                            Optional Add-On
                        </div>
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold font-sans text-primary mt-2 mb-4 pr-24">Negotiation Support</h3>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-3xl font-sans font-bold text-primary tracking-tighter">+$250</span>
                            </div>
                            <p className="text-text/70 text-sm leading-relaxed mb-6">
                                Additional expert support during dealership pricing and offer discussions.
                            </p>
                            <ul className="space-y-3 text-sm text-text">
                                {negotiationIncludes.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <span className="text-primary mt-0.5 shrink-0"><Check /></span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <p className="text-xs text-text/50 mb-6">Available exclusively to Core Advisory clients.</p>
                        <div className="mt-auto pt-6 border-t border-text/5">
                            <Link
                                to="/core-advisory"
                                className="block w-full text-center bg-primary/5 text-primary hover:bg-primary hover:text-white border border-primary/20 px-6 py-3 rounded-full font-bold text-sm transition-colors duration-300"
                            >
                                Available with Advisory
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Which option is right for you? */}
                <div className="pricing-el mt-20 w-full max-w-4xl text-left">
                    <h4 className="text-lg font-bold text-primary mb-6 text-center">Which option is right for you?</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-5 rounded-xl bg-white/60 border border-text/5">
                            <p className="font-semibold text-primary text-sm mb-1">Guide</p>
                            <p className="text-sm text-text/70">Best for independent buyers who want a structured framework and tools.</p>
                        </div>
                        <div className="p-5 rounded-xl bg-primary/5 border border-primary/10">
                            <p className="font-semibold text-primary text-sm mb-1">Advisory</p>
                            <p className="text-sm text-text/70">Best for buyers who want expert guidance throughout the decision process.</p>
                        </div>
                        <div className="p-5 rounded-xl bg-white/60 border border-text/5">
                            <p className="font-semibold text-primary text-sm mb-1">Negotiation Support</p>
                            <p className="text-sm text-text/70">Best for buyers who want help reviewing dealership offers and pricing in real time.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
