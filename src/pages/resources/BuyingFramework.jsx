import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Search, Gauge, FileText, Handshake, ArrowRight } from 'lucide-react';
import MinimalHeader from '../../components/MinimalHeader';
import ResourceNav from '../../components/ResourceNav';

gsap.registerPlugin(ScrollTrigger);

const stages = [
    {
        number: '01',
        title: 'Discover',
        subtitle: 'Define needs and narrow the market.',
        icon: Search,
        color: '#C9A84C',
        activities: [
            { label: 'Lifestyle Needs', desc: 'Identify priorities and daily use cases' },
            { label: 'Segment Exploration', desc: 'Compare vehicle categories and formats' },
            { label: 'Ownership Research', desc: 'Study reliability and operating costs' },
            { label: 'Shortlist Creation', desc: 'Narrow to a focused set of candidate vehicles' },
        ],
        transition: 'Confusion',
        result: 'Informed Exploration'
    },
    {
        number: '02',
        title: 'Evaluate',
        subtitle: 'Experience vehicles in the real world.',
        icon: Gauge,
        color: '#C9A84C',
        activities: [
            { label: 'Driving Dynamics', desc: 'Test drive shortlisted vehicles' },
            { label: 'Seating & Ergonomics', desc: 'Assess comfort and driving position' },
            { label: 'Interior Environment', desc: 'Evaluate materials, visibility, and ambiance' },
            { label: 'Practical Usability', desc: 'Test technology interfaces and cargo functionality' },
        ],
        transition: 'Abstract Research',
        result: 'Real Experience'
    },
    {
        number: '03',
        title: 'Structure the Deal',
        subtitle: 'Prepare financially and strategically.',
        icon: FileText,
        color: '#C9A84C',
        activities: [
            { label: 'Financing Preparation', desc: 'Secure credit union pre-approval' },
            { label: 'Market Intelligence', desc: 'Research incentives and manufacturer promotions' },
            { label: 'Target Pricing', desc: 'Define a negotiation starting point' },
            { label: 'Dealer Selection', desc: 'Identify multiple dealership options' },
        ],
        transition: 'Dealership Dependence',
        result: 'Buyer Leverage'
    },
    {
        number: '04',
        title: 'Execute with Control',
        subtitle: 'Negotiate and complete the purchase on your terms.',
        icon: Handshake,
        color: '#C9A84C',
        activities: [
            { label: 'Price Negotiation', desc: 'Agree on vehicle price before discussing financing' },
            { label: 'Contract Review', desc: 'Verify the full out-the-door price' },
            { label: 'Add-On Rejection', desc: 'Decline unnecessary protection packages and extras' },
            { label: 'Purchase Completion', desc: 'Finalize the transaction on your timeline' },
        ],
        transition: 'Pressure',
        result: 'Confident Purchase'
    }
];

export default function BuyingFramework() {
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                '.fw-fade-up',
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out' }
            );
            gsap.fromTo(
                '.stage-card',
                { opacity: 0, y: 60 },
                {
                    opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out',
                    scrollTrigger: { trigger: '.stages-grid', start: 'top 80%' }
                }
            );
            gsap.fromTo(
                '.power-bar',
                { scaleX: 0 },
                {
                    scaleX: 1, duration: 1.5, ease: 'power2.out',
                    scrollTrigger: { trigger: '.power-section', start: 'top 75%' }
                }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="bg-[#0D0D12] min-h-screen text-[#FAF8F5] font-['Inter'] relative flex flex-col selection:bg-[#C9A84C]/20 selection:text-[#FAF8F5]">
            {/* Noise Overlay */}
            <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.04] mix-blend-overlay">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                    <filter id="noiseFilterFw">
                        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#noiseFilterFw)" />
                </svg>
            </div>

            <MinimalHeader />
            <div className="pt-28">
                <ResourceNav title="Car Buying Framework" />

            <main className="flex-1 w-full max-w-5xl mx-auto px-6 md:px-12 lg:px-20 pt-6 pb-32">

                {/* Hero */}
                <section className="text-center mb-24 fw-fade-up">
                    <div className="inline-block px-4 py-1.5 rounded-full border border-[#C9A84C]/30 text-[#C9A84C] text-xs font-semibold tracking-widest uppercase mb-6">
                        Autolitics Studio Framework
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.05]">
                        The Autolitics<br />
                        <span className="font-['Playfair_Display'] italic text-[#C9A84C]">Car Buying Framework</span>
                    </h1>
                    <p className="text-lg md:text-xl text-[#FAF8F5]/60 max-w-2xl mx-auto leading-relaxed">
                        A four-stage decision model that shifts power from the dealership to the buyer. Each stage reduces uncertainty and increases your leverage.
                    </p>
                </section>

                {/* Key Insight Banner */}
                <section className="fw-fade-up mb-24">
                    <div className="relative bg-[#14141B] rounded-[2rem] border border-[#2A2A35] p-8 md:p-12 overflow-hidden">
                        <div className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay">
                            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                                <filter id="noiseFilterBanner">
                                    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
                                </filter>
                                <rect width="100%" height="100%" filter="url(#noiseFilterBanner)" />
                            </svg>
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                            <div className="flex-1">
                                <p className="text-[#FAF8F5]/50 text-sm font-medium uppercase tracking-widest mb-3 font-['JetBrains_Mono']">The Core Insight</p>
                                <p className="text-xl md:text-2xl font-medium text-[#FAF8F5]/90 leading-relaxed">
                                    Dealerships want to compress the entire process into <span className="text-[#C9A84C] font-bold">one emotional visit</span>. The Autolitics method separates it into <span className="text-[#C9A84C] font-bold">four deliberate stages</span>.
                                </p>
                            </div>
                            <div className="shrink-0 text-center bg-[#0D0D12] rounded-2xl border border-[#2A2A35] p-6 min-w-[140px]">
                                <div className="text-3xl font-bold text-[#C9A84C] mb-1">4</div>
                                <div className="text-xs text-[#FAF8F5]/40 font-['JetBrains_Mono'] uppercase tracking-wider">Stages</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stage Cards */}
                <section className="stages-grid mb-24">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {stages.map((stage) => {
                            const Icon = stage.icon;
                            return (
                                <div key={stage.number} className="stage-card group bg-[#14141B] rounded-[2rem] border border-[#2A2A35] p-8 hover:border-[#C9A84C]/30 transition-all duration-500">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center group-hover:bg-[#C9A84C]/20 transition-colors duration-300">
                                                <Icon size={22} className="text-[#C9A84C]" />
                                            </div>
                                            <div>
                                                <div className="text-xs text-[#FAF8F5]/30 font-['JetBrains_Mono'] tracking-wider uppercase">Stage {stage.number}</div>
                                                <h3 className="text-xl font-bold tracking-tight">{stage.title}</h3>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-[#FAF8F5]/60 mb-6 font-medium">{stage.subtitle}</p>

                                    <ul className="space-y-3 mb-8">
                                        {stage.activities.map((act, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] mt-1.5 shrink-0"></span>
                                                <span>
                                                    <span className="font-semibold text-[#C9A84C]">{act.label}</span>
                                                    <span className="text-[#FAF8F5]/40"> — </span>
                                                    <span className="text-[#FAF8F5]/65">{act.desc}</span>
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="bg-[#0D0D12] rounded-xl border border-[#2A2A35] p-4 flex items-center gap-3">
                                        <span className="text-xs text-[#FAF8F5]/30 font-['JetBrains_Mono'] uppercase tracking-wider">Goal</span>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-[#FAF8F5]/40 line-through">{stage.transition}</span>
                                            <ArrowRight size={14} className="text-[#C9A84C]" />
                                            <span className="text-[#C9A84C] font-semibold">{stage.result}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Buyer Power Rising */}
                <section className="power-section mb-24">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
                            Progressive <span className="font-['Playfair_Display'] italic text-[#C9A84C]">Empowerment</span>
                        </h2>
                        <p className="text-[#FAF8F5]/50 max-w-lg mx-auto">As you move through each stage, buyer leverage increases and dealership pressure decreases.</p>
                    </div>

                    <div className="bg-[#14141B] rounded-[2rem] border border-[#2A2A35] p-8 md:p-12">
                        <div className="flex items-end gap-4 h-48 mb-6">
                            {stages.map((stage, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-3">
                                    <div
                                        className="power-bar w-full rounded-t-lg bg-gradient-to-t from-[#C9A84C]/30 to-[#C9A84C] origin-bottom"
                                        style={{ height: `${25 + i * 25}%`, transformOrigin: 'bottom' }}
                                    ></div>
                                    <div className="text-center">
                                        <div className="text-xs font-semibold text-[#C9A84C] tracking-wide">{stage.number}</div>
                                        <div className="text-xs text-[#FAF8F5]/50 hidden md:block">{stage.title}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between text-xs text-[#FAF8F5]/30 font-['JetBrains_Mono'] uppercase tracking-widest border-t border-[#2A2A35] pt-4 mt-4">
                            <span>Low Leverage</span>
                            <span>↑ Buyer Power</span>
                            <span>Full Control</span>
                        </div>
                    </div>
                </section>

                {/* The Autolitics Method */}
                <section className="mb-24">
                    <div className="bg-[#14141B] rounded-[2rem] border border-[#2A2A35] p-8 md:p-12">
                        <div className="mb-8">
                            <div className="inline-flex items-center gap-2 text-xs font-['JetBrains_Mono'] text-[#C9A84C]/60 uppercase tracking-widest mb-5">
                                <span className="w-6 h-px bg-[#C9A84C]/40"></span>
                                The Autolitics Method
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-5">
                                The framework <span className="font-['Playfair_Display'] italic text-[#C9A84C]">powers the system.</span>
                            </h2>
                            <p className="text-[#FAF8F5]/60 leading-relaxed mb-5 max-w-2xl">
                                The Autolitics Framework is the foundation of a structured advisory system designed to help buyers navigate complex vehicle decisions with clarity and confidence.
                            </p>
                            <p className="text-[#FAF8F5]/60 leading-relaxed mb-6 max-w-2xl">
                                It works in combination with three supporting tools:
                            </p>
                            <ul className="space-y-3 mb-8 max-w-2xl">
                                {[
                                    { label: 'The Autolitics Playbook', desc: 'A practical guide to navigating dealerships and structuring a smart purchase', link: '/resources/playbook' },
                                    { label: 'Advisory Intelligence Tools', desc: 'Vehicle evaluations, market insights, and deal analysis' },
                                    { label: 'The Autolitics Strategy Brief', desc: 'A personalized recommendation and purchase strategy' },
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] mt-1.5 shrink-0"></span>
                                        <span>
                                            {item.link ? (
                                                <Link to={item.link} className="font-semibold text-[#C9A84C] hover:text-[#D4B86A] underline underline-offset-2 decoration-[#C9A84C]/30 hover:decoration-[#C9A84C]/70 transition-colors">{item.label}</Link>
                                            ) : (
                                                <span className="font-semibold text-[#C9A84C]">{item.label}</span>
                                            )}
                                            <span className="text-[#FAF8F5]/40"> — </span>
                                            <span className="text-[#FAF8F5]/60">{item.desc}</span>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <p className="text-[#FAF8F5]/60 leading-relaxed max-w-2xl">
                                Together, these elements create a methodical process that shifts power from the dealership to the buyer.
                            </p>
                        </div>

                        {/* Horizontal method stack */}
                        <div className="border-t border-[#2A2A35] pt-8">
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                {[
                                    { layer: '01', label: 'Framework', sublabel: 'Decision Model', active: true, link: null },
                                    { layer: '02', label: 'Playbook', sublabel: 'Strategy Guide', active: false, link: '/resources/playbook' },
                                    { layer: '03', label: 'Intelligence Tools', sublabel: 'Analysis Layer', active: false, link: null },
                                    { layer: '04', label: 'Strategy Brief', sublabel: 'Client Deliverable', active: false, link: null },
                                ].map((item, i, arr) => {
                                    const CardEl = item.link ? Link : 'div';
                                    const cardProps = item.link ? { to: item.link } : {};
                                    return (
                                    <React.Fragment key={i}>
                                        <CardEl {...cardProps} className={`block flex-1 rounded-xl border px-4 py-4 transition-all duration-300 group ${item.link ? 'cursor-pointer' : 'cursor-default'} ${
                                            item.active
                                                ? 'bg-[#0D0D12] border-[#C9A84C]/40 shadow-[0_0_20px_rgba(201,168,76,0.07)]'
                                                : 'bg-[#0D0D12] border-[#2A2A35] hover:border-[#FAF8F5]/15 hover:bg-[#181820]'
                                        }`}>
                                            <div className={`text-xs font-['JetBrains_Mono'] mb-1.5 ${item.active ? 'text-[#C9A84C]' : 'text-[#FAF8F5]/20 group-hover:text-[#FAF8F5]/35 transition-colors'}`}>
                                                {item.layer}
                                            </div>
                                            <div className={`font-semibold text-sm mb-0.5 ${item.active ? 'text-[#FAF8F5]' : 'text-[#FAF8F5]/50 group-hover:text-[#FAF8F5]/70 transition-colors'}`}>
                                                {item.label}
                                            </div>
                                            <div className={`text-xs font-['JetBrains_Mono'] uppercase tracking-wider ${item.active ? 'text-[#C9A84C]/60' : 'text-[#FAF8F5]/18 group-hover:text-[#FAF8F5]/30 transition-colors'}`}>
                                                {item.sublabel}
                                            </div>
                                        </CardEl>
                                        {i < arr.length - 1 && (
                                            <div className="flex items-center justify-center sm:shrink-0">
                                                <span className="text-[#2A2A35] text-lg font-light hidden sm:block">→</span>
                                                <span className="text-[#2A2A35] text-base font-light sm:hidden self-center py-0.5">↓</span>
                                            </div>
                                        )}
                                    </React.Fragment>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="text-center bg-[#14141B] rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
                    <div className="pointer-events-none absolute inset-0 opacity-10 mix-blend-overlay">
                        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                            <filter id="noiseFilterCtaFw">
                                <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
                            </filter>
                            <rect width="100%" height="100%" filter="url(#noiseFilterCtaFw)" />
                        </svg>
                    </div>
                    <div className="relative z-10 max-w-xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-4">
                            Ready to buy with <span className="font-['Playfair_Display'] italic text-[#C9A84C]">confidence?</span>
                        </h2>
                        <p className="text-[#FAF8F5]/50 mb-8 max-w-md mx-auto">
                            Let an independent advisor guide you through every stage — no dealership pressure, no commissions.
                        </p>
                        <Link
                            to="/book"
                            className="inline-block relative overflow-hidden group/btn bg-[#C9A84C] text-[#0D0D12] px-8 py-4 rounded-full font-bold text-lg transition-transform duration-300 hover:scale-[1.03] shadow-[0_4px_20px_rgba(201,168,76,0.2)]"
                            style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
                        >
                            <span className="relative z-10 block transition-transform group-hover/btn:-translate-y-[1px]">
                                Schedule a Strategy Session
                            </span>
                            <span className="absolute inset-0 bg-white/30 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 rounded-full"></span>
                        </Link>
                        <div className="mt-6">
                            <Link to="/resources/playbook" className="inline-flex items-center gap-2 text-sm text-[#FAF8F5]/40 hover:text-[#C9A84C] transition-colors">
                                <span>Read The Autolitics Playbook →</span>
                            </Link>
                        </div>
                    </div>
                </section>

            </main>
            </div>

            {/* Footer */}
            <footer className="border-t border-[#2A2A35] py-8 text-center text-xs text-[#FAF8F5]/30 font-['JetBrains_Mono']">
                © {new Date().getFullYear()} Autolitics Studio. Independent Automotive Advisory.
            </footer>
        </div>
    );
}
