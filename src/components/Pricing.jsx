import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';

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

    return (
        <section id="pricing" ref={containerRef} className="pt-32 pb-48 lg:pb-64 bg-background px-6">
            <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
                <h2 className="pricing-el text-sm font-mono text-accent uppercase tracking-[0.2em] mb-6">Partnership</h2>
                <h3 className="pricing-el text-4xl md:text-5xl lg:text-6xl font-sans font-bold text-primary max-w-3xl leading-[1.1] mb-6 tracking-tight">
                    Simple, Transparent Pricing.
                </h3>
                <p className="pricing-el text-lg text-text/70 max-w-2xl mb-16">
                    A car purchase is often a $40,000–$80,000 decision. A few hours of expert guidance can make a meaningful difference.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl items-start">

                    {/* Free Intro Call */}
                    <div className="pricing-el bg-white rounded-[2rem] p-8 border border-text/5 shadow-sm hover:shadow-xl transition-shadow duration-500 text-left h-full flex flex-col relative mt-0 md:mt-8">
                        <div className="mb-8">
                            <h4 className="text-2xl font-bold font-sans text-primary mb-2">Free Intro Call</h4>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-4xl font-sans font-bold text-primary tracking-tighter">$0</span>
                                <span className="text-text/50 font-medium">| 20 minutes</span>
                            </div>
                            <p className="text-text/70 text-sm leading-relaxed mb-6">
                                A focused conversation to understand your needs, timeline, and goals — and to determine whether the advisory is the right fit.
                            </p>
                            <ul className="space-y-4 text-sm text-text">
                                {['Discuss your vehicle search and priorities', 'Learn how the advisory process works', 'Ask questions, no pressure'].map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <span className="text-accent mt-0.5">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        </span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="mt-auto pt-8 border-t border-text/5">
                            <p className="text-xs text-text/50 mb-4 uppercase tracking-wider font-semibold">No obligation. No commitment.</p>
                            <Link to="/book" className="block w-full text-center bg-primary/5 text-primary hover:bg-primary hover:text-white px-6 py-3 rounded-full font-bold text-sm transition-colors duration-300">
                                Book a Free Intro Call
                            </Link>
                        </div>
                    </div>

                    {/* Core Advisory */}
                    <div className="pricing-el bg-primary text-ivory rounded-[2rem] p-8 border border-white/5 shadow-2xl text-left h-full flex flex-col relative transform md:-translate-y-4">
                        <div className="absolute top-6 right-6 bg-accent text-primary text-[10px] uppercase font-bold tracking-wider py-1 px-3 rounded-full">
                            Most Popular
                        </div>
                        <div className="mb-8">
                            <h4 className="text-2xl font-bold font-sans mb-2">Core Advisory</h4>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-5xl font-sans font-bold tracking-tighter">$850</span>
                                <span className="text-ivory/50 font-medium tracking-wide text-sm">FLAT FEE</span>
                            </div>
                            <p className="text-ivory/70 text-sm leading-relaxed mb-6">
                                Comprehensive, structured support from strategy through decision. Flat-fee. No commissions.
                            </p>
                            <ul className="space-y-4 text-sm">
                                {[
                                    '60–75 minute discovery session',
                                    '3–5 vehicle shortlist with clear rationale',
                                    'Ownership cost and positioning insights',
                                    'Test drive evaluation framework',
                                    'Offer and pricing guidance',
                                    'Final decision confidence review'
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <span className="text-accent mt-0.5">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        </span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="mt-auto pt-8 border-t border-white/10">
                            <Link to="/core-advisory" className="block w-full text-center bg-accent text-primary px-6 py-4 rounded-full font-bold transition-transform duration-300 hover:scale-[1.02] shadow-[0_0_15px_rgba(201,168,76,0.3)]">
                                Start Your Advisory
                            </Link>
                        </div>
                    </div>

                    {/* Negotiation Support Add-on */}
                    <div className="pricing-el bg-white rounded-[2rem] p-8 border border-text/5 shadow-sm hover:shadow-xl transition-shadow duration-500 text-left h-full flex flex-col relative mt-0 md:mt-8">
                        <div className="absolute top-6 right-6 border border-text/10 text-text/50 text-[10px] uppercase font-bold tracking-wider py-1 px-3 rounded-full">
                            Optional Add-On
                        </div>
                        <div className="mb-8">
                            <h4 className="text-2xl font-bold font-sans text-primary mb-2 pr-20">Negotiation Support</h4>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-4xl font-sans font-bold text-primary tracking-tighter">+$250</span>
                            </div>
                            <p className="text-text/70 text-sm leading-relaxed mb-6">
                                Additional real-time guidance during offer and pricing discussions.
                            </p>
                            <ul className="space-y-4 text-sm text-text">
                                {['Offer structure review', 'Lease vs. finance comparison', 'Incentive and pricing analysis', 'Live email or call support during negotiation'].map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <span className="text-primary mt-0.5">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        </span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="mt-auto pt-8 border-t border-text/5">
                            <p className="text-xs text-text/50 italic">Available exclusively to Core Advisory clients.</p>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
