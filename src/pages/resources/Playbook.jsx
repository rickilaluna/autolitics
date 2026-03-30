import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Shield, Search, Gauge, FileText, Handshake, DollarSign, Banknote, Clock, ArrowRight } from 'lucide-react';
import MinimalHeader from '../../components/MinimalHeader';
import ResourceNav from '../../components/ResourceNav';

gsap.registerPlugin(ScrollTrigger);

const SectionDivider = () => (
    <div className="flex items-center gap-4 my-16 md:my-24">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#2A2A35] to-transparent"></div>
        <div className="w-2 h-2 rounded-full bg-[#C9A84C]/40"></div>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#2A2A35] to-transparent"></div>
    </div>
);

const SectionNumber = ({ number }) => (
    <div className="inline-flex items-center gap-2 text-xs font-['JetBrains_Mono'] text-[#C9A84C]/60 uppercase tracking-widest mb-4">
        <span className="w-6 h-px bg-[#C9A84C]/40"></span>
        Section {number}
    </div>
);

export default function Playbook() {
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                '.pb-fade-up',
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out' }
            );

            gsap.utils.toArray('.pb-section').forEach(section => {
                gsap.fromTo(section,
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
                        scrollTrigger: { trigger: section, start: 'top 80%' }
                    }
                );
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="bg-[#0D0D12] min-h-screen text-[#FAF8F5] font-['Inter'] relative flex flex-col selection:bg-[#C9A84C]/20 selection:text-[#FAF8F5]">
            {/* Noise Overlay */}
            <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.04] mix-blend-overlay">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                    <filter id="noiseFilterPb">
                        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#noiseFilterPb)" />
                </svg>
            </div>

            <MinimalHeader />
            <div className="pt-28">
            <ResourceNav title="Autolitics Playbook" />

            <main className="flex-1 w-full max-w-3xl mx-auto px-6 md:px-12 lg:px-16 pt-6 pb-32">

                {/* Hero */}
                <section className="text-center mb-20 pb-fade-up">
                    <div className="inline-block px-4 py-1.5 rounded-full border border-[#C9A84C]/30 text-[#C9A84C] text-xs font-semibold tracking-widest uppercase mb-6">
                        Autolitics Studio Resource
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 leading-[1.05]">
                        The Autolitics<br />
                        <span className="font-['Playfair_Display'] italic text-[#C9A84C]">Playbook</span>
                    </h1>
                    <p className="text-lg md:text-xl text-[#FAF8F5]/60 max-w-xl mx-auto leading-relaxed">
                        A practical guide to navigating dealerships, evaluating vehicles, and structuring a smart car purchase.
                    </p>
                </section>

                {/* Introduction */}
                <section className="pb-section">
                    <div className="bg-[#14141B] rounded-[2rem] border border-[#2A2A35] p-8 md:p-12">
                        <div className="flex items-center gap-3 mb-6">
                            <Shield size={22} className="text-[#C9A84C]" />
                            <h2 className="text-2xl font-bold tracking-tight">Introduction</h2>
                        </div>
                        <div className="space-y-5 text-[#FAF8F5]/70 leading-relaxed">
                            <p>
                                Buying a car is one of the largest financial decisions most families make — yet the process often feels overwhelming, confusing, and emotionally charged. Pricing structures are opaque, product options are dizzying, and the dealership environment is specifically designed to move buyers toward decisions quickly.
                            </p>
                            <p>
                                This doesn't make dealerships adversaries. But it does mean the buyer needs to understand the dynamics of the environment they're stepping into.
                            </p>
                            <p className="text-[#FAF8F5]/90 font-medium">
                                This playbook is designed to help you feel informed and confident at every stage of the process. It is written from the perspective of an experienced automotive advisor — with clarity, not cynicism.
                            </p>
                        </div>
                    </div>
                </section>

                <SectionDivider />

                {/* Autolitics Method Diagram */}
                <section className="pb-section">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 text-xs font-['JetBrains_Mono'] text-[#C9A84C]/60 uppercase tracking-widest mb-5">
                            <span className="w-6 h-px bg-[#C9A84C]/40"></span>
                            The Autolitics Method
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                            A <span className="font-['Playfair_Display'] italic text-[#C9A84C]">structured system</span>, not a list of tips.
                        </h2>
                        <p className="text-[#FAF8F5]/40 text-sm max-w-md mx-auto leading-relaxed">
                            This playbook sits within a broader methodology — four interconnected layers that move from conceptual model to personalized recommendation.
                        </p>
                    </div>

                    <div className="max-w-lg mx-auto">
                        {[
                            {
                                layer: '01',
                                name: 'Autolitics Framework',
                                role: 'Conceptual Model',
                                desc: 'Four-stage decision model defining buyer strategy',
                                active: false,
                                link: '/resources/buying-framework',
                            },
                            {
                                layer: '02',
                                name: 'Autolitics Playbook',
                                role: 'Educational Guide',
                                desc: 'Step-by-step strategy for navigating dealerships and deals',
                                active: true,
                                link: null,
                            },
                            {
                                layer: '03',
                                name: 'Advisory Intelligence Tools',
                                role: 'Analysis Layer',
                                desc: 'Vehicle evaluation, scoring, and deal structure analysis',
                                active: false,
                                link: null,
                            },
                            {
                                layer: '04',
                                name: 'Autolitics Strategy Brief',
                                role: 'Client Deliverable',
                                desc: 'Personalized vehicle recommendation and buying plan',
                                active: false,
                                link: null,
                            },
                        ].map((item, i, arr) => {
                            const CardEl = item.link ? Link : 'div';
                            const cardProps = item.link ? { to: item.link } : {};
                            return (
                                <div key={i}>
                                    <CardEl {...cardProps}
                                        className={`block group relative rounded-2xl border p-6 transition-all duration-300 overflow-hidden ${item.link ? 'cursor-pointer' : 'cursor-default'} ${item.active
                                                ? 'bg-[#14141B] border-[#C9A84C]/50 shadow-[0_0_30px_rgba(201,168,76,0.08)] hover:shadow-[0_0_40px_rgba(201,168,76,0.15)] hover:-translate-y-0.5 hover:border-[#C9A84C]/70'
                                                : 'bg-[#0D0D12] border-[#2A2A35] hover:bg-[#14141B] hover:border-[#FAF8F5]/15 hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:-translate-y-0.5'
                                            }`}
                                        style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
                                    >
                                        {/* Active: gradient top border glow */}
                                        {item.active && (
                                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/60 to-transparent"></div>
                                        )}
                                        {/* Hover shimmer on all cards */}
                                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FAF8F5]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                        <div className="flex items-center gap-5">
                                            {/* Layer number */}
                                            <div className={`text-sm font-['JetBrains_Mono'] shrink-0 tabular-nums ${item.active ? 'text-[#C9A84C]' : 'text-[#FAF8F5]/20 group-hover:text-[#FAF8F5]/35 transition-colors duration-300'
                                                }`}>
                                                {item.layer}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-baseline gap-3 mb-1.5 flex-wrap">
                                                    <span className={`font-semibold tracking-tight transition-colors duration-300 ${item.active
                                                            ? 'text-base text-[#FAF8F5]'
                                                            : 'text-sm text-[#FAF8F5]/50 group-hover:text-[#FAF8F5]/70'
                                                        }`}>
                                                        {item.name}
                                                    </span>
                                                    <span className={`text-xs font-['JetBrains_Mono'] uppercase tracking-widest transition-colors duration-300 ${item.active
                                                            ? 'text-[#C9A84C]/70'
                                                            : 'text-[#FAF8F5]/18 group-hover:text-[#FAF8F5]/30'
                                                        }`}>
                                                        {item.role}
                                                    </span>
                                                </div>
                                                <p className={`text-sm leading-relaxed transition-colors duration-300 ${item.active ? 'text-[#FAF8F5]/50' : 'text-[#FAF8F5]/22 group-hover:text-[#FAF8F5]/40'
                                                    }`}>
                                                    {item.desc}
                                                </p>
                                            </div>

                                            {/* Active dot */}
                                            {item.active && (
                                                <div className="shrink-0 w-2 h-2 rounded-full bg-[#C9A84C] shadow-[0_0_8px_rgba(201,168,76,0.6)]"></div>
                                            )}
                                        </div>
                                    </CardEl>

                                    {/* Connector */}
                                    {i < arr.length - 1 && (
                                        <div className="flex flex-col items-center py-1.5">
                                            <div className="w-px h-4 bg-gradient-to-b from-[#2A2A35] to-[#2A2A35]/40"></div>
                                            <svg width="8" height="5" viewBox="0 0 8 5" fill="none">
                                                <path d="M4 5L0 0h8L4 5z" fill="#2A2A35" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                <SectionDivider />


                <section className="pb-section">
                    <SectionNumber number="01" />
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">
                        Understanding the Dealership <span className="font-['Playfair_Display'] italic text-[#C9A84C]">Environment</span>
                    </h2>
                    <div className="space-y-5 text-[#FAF8F5]/70 leading-relaxed">
                        <p>
                            Dealerships are professional sales organizations. The people you interact with are typically trained salespeople — not vehicle experts. Their compensation is structured around closing deals efficiently, often with monthly and quarterly quotas that create internal urgency.
                        </p>
                        <p>
                            This doesn't mean salespeople are dishonest. But their incentive structure is fundamentally different from yours. You want the best vehicle at the best price. They want to close a deal as quickly as possible with maximum margin.
                        </p>
                        <p>
                            Understanding this dynamic is the first step toward maintaining control. When you recognize that the process is designed to compress your decision-making timeline, you can consciously choose to slow down.
                        </p>
                    </div>

                    <div className="mt-8 bg-[#14141B] rounded-2xl border border-[#2A2A35] p-6">
                        <div className="text-xs font-['JetBrains_Mono'] text-[#C9A84C]/60 uppercase tracking-widest mb-3">Key Takeaway</div>
                        <p className="text-[#FAF8F5]/80 font-medium">
                            Salespeople are sales professionals, not product experts. Your preparation is what closes the knowledge gap.
                        </p>
                    </div>
                </section>

                <SectionDivider />

                {/* Section 2 — The Framework */}
                <section className="pb-section">
                    <SectionNumber number="02" />
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">
                        The Autolitics Car Buying <span className="font-['Playfair_Display'] italic text-[#C9A84C]">Framework</span>
                    </h2>
                    <p className="text-[#FAF8F5]/70 leading-relaxed mb-8">
                        The Autolitics method separates the car-buying journey into four deliberate stages. Each stage builds your knowledge, reduces uncertainty, and increases your negotiating leverage. By intentionally separating these phases, you prevent the dealership from compressing the entire process into a single emotional visit.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { icon: Search, title: 'Discover', desc: 'Define needs and narrow the market.' },
                            { icon: Gauge, title: 'Evaluate', desc: 'Experience vehicles in the real world.' },
                            { icon: FileText, title: 'Structure the Deal', desc: 'Prepare financially before negotiating.' },
                            { icon: Handshake, title: 'Execute with Control', desc: 'Negotiate and complete on your terms.' }
                        ].map((stage, i) => {
                            const Icon = stage.icon;
                            return (
                                <div key={i} className="bg-[#14141B] rounded-2xl border border-[#2A2A35] p-6 hover:border-[#C9A84C]/20 transition-colors">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Icon size={18} className="text-[#C9A84C]" />
                                        <h3 className="font-bold text-sm">{stage.title}</h3>
                                    </div>
                                    <p className="text-sm text-[#FAF8F5]/50">{stage.desc}</p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-6 text-center">
                        <Link to="/resources/buying-framework" className="inline-flex items-center gap-2 text-sm text-[#C9A84C] font-medium hover:text-[#D4B86A] transition-colors">
                            <span>View the full framework visualization</span>
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </section>

                <SectionDivider />

                {/* Section 3 — Evaluating Vehicles */}
                <section className="pb-section">
                    <SectionNumber number="03" />
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">
                        Evaluating Vehicles <span className="font-['Playfair_Display'] italic text-[#C9A84C]">Effectively</span>
                    </h2>
                    <div className="space-y-5 text-[#FAF8F5]/70 leading-relaxed">
                        <p>
                            Online research is essential, but it cannot replace real-world experience. Reviews and specifications can tell you a lot, but they cannot replicate the feeling of sitting in a vehicle, adjusting mirrors, reaching for controls, or loading a stroller into the cargo area.
                        </p>
                        <p>
                            When you test drive, pay attention to more than just how the vehicle accelerates. Focus on:
                        </p>
                    </div>

                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {['Seating comfort and support on longer drives', 'Visibility from every angle', 'Ergonomics — can you reach everything intuitively?', 'Interior ambiance and material quality', 'Cargo usability for your real life', 'Technology — is the infotainment actually usable?'].map((item, i) => (
                            <div key={i} className="flex items-start gap-3 bg-[#14141B] rounded-xl border border-[#2A2A35] p-4">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] mt-1.5 shrink-0"></span>
                                <span className="text-sm text-[#FAF8F5]/70">{item}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 bg-[#14141B] rounded-2xl border border-[#2A2A35] p-6">
                        <div className="text-xs font-['JetBrains_Mono'] text-[#C9A84C]/60 uppercase tracking-widest mb-3">Pro Tip</div>
                        <p className="text-[#FAF8F5]/80 font-medium">
                            Drive the vehicle on your actual commute route or daily errands. Dealership test drives on quiet side streets don't reveal how a vehicle will actually feel in your life.
                        </p>
                    </div>
                </section>

                <SectionDivider />

                {/* Section 4 — Understanding Pricing */}
                <section className="pb-section">
                    <SectionNumber number="04" />
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">
                        Understanding Vehicle <span className="font-['Playfair_Display'] italic text-[#C9A84C]">Pricing</span>
                    </h2>
                    <div className="space-y-5 text-[#FAF8F5]/70 leading-relaxed mb-8">
                        <p>
                            Vehicle pricing can feel intentionally confusing — and in many ways, it is. Understanding the key components gives you immediate clarity and leverage.
                        </p>
                    </div>

                    <div className="space-y-4 mb-8">
                        {[
                            { term: 'MSRP', def: 'The manufacturer\'s suggested retail price — a starting point, not a final price.' },
                            { term: 'Dealer Invoice', def: 'What the dealer paid the manufacturer. The real cost basis for negotiation.' },
                            { term: 'Manufacturer Incentives', def: 'Rebates and cash-back offers from the manufacturer — not the dealer.' },
                            { term: 'Dealer Bonuses (Spiffs)', def: 'Hidden bonuses dealers earn for hitting sales targets. They have more room than they show.' },
                            { term: 'Market Adjustments', def: 'Extra markups (or markdowns) based on local supply and demand. Always negotiable.' }
                        ].map((item, i) => (
                            <div key={i} className="bg-[#14141B] rounded-2xl border border-[#2A2A35] p-5 flex flex-col sm:flex-row sm:items-start gap-3">
                                <span className="text-sm font-bold text-[#C9A84C] font-['JetBrains_Mono'] shrink-0 min-w-[160px]">{item.term}</span>
                                <span className="text-sm text-[#FAF8F5]/60">{item.def}</span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-[#14141B] rounded-2xl border border-[#C9A84C]/20 p-6">
                        <div className="flex items-center gap-2 mb-3">
                            <DollarSign size={16} className="text-[#C9A84C]" />
                            <div className="text-xs font-['JetBrains_Mono'] text-[#C9A84C]/60 uppercase tracking-widest">Timing Matters</div>
                        </div>
                        <p className="text-[#FAF8F5]/70 text-sm leading-relaxed">
                            The best deals tend to happen at the <strong className="text-[#FAF8F5]/90">end of the month</strong>, <strong className="text-[#FAF8F5]/90">end of the quarter</strong>, and <strong className="text-[#FAF8F5]/90">end of the model year</strong>. Dealers are more flexible when they're trying to hit sales targets.
                        </p>
                    </div>
                </section>

                <SectionDivider />

                {/* Section 5 — Negotiation Strategy */}
                <section className="pb-section">
                    <SectionNumber number="05" />
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">
                        Negotiation without <span className="font-['Playfair_Display'] italic text-[#C9A84C]">Losing Leverage</span>
                    </h2>
                    <div className="space-y-5 text-[#FAF8F5]/70 leading-relaxed mb-8">
                        <p>
                            The goal of negotiation is not to "win" against the dealership. It's to arrive at a fair price based on market data, while maintaining control of the process. Calm confidence, not aggression, is the most effective negotiation tool.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {[
                            { icon: Search, title: 'Set a target price', desc: 'Before you walk in, know what you\'re willing to pay. Base this on invoice pricing and current market data — not MSRP.' },
                            { icon: FileText, title: 'Request out-the-door pricing', desc: 'Always ask for the complete price including taxes, fees, and documentation charges. This prevents surprises in the finance office.' },
                            { icon: Gauge, title: 'Get multiple offers', desc: 'Contact 3-5 dealerships by email. Request their best price upfront. Use competing offers to create leverage.' },
                            { icon: Handshake, title: 'Stay professional', desc: 'Negotiate calmly and respectfully. The best buyers are firm but polite — this gets better results than hostility.' }
                        ].map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <div key={i} className="bg-[#14141B] rounded-2xl border border-[#2A2A35] p-6 flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center shrink-0">
                                        <Icon size={18} className="text-[#C9A84C]" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm mb-1 text-[#FAF8F5]/90">{item.title}</h3>
                                        <p className="text-sm text-[#FAF8F5]/60">{item.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <SectionDivider />

                {/* Section 6 — Financing */}
                <section className="pb-section">
                    <SectionNumber number="06" />
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">
                        Financing <span className="font-['Playfair_Display'] italic text-[#C9A84C]">Strategy</span>
                    </h2>
                    <div className="space-y-5 text-[#FAF8F5]/70 leading-relaxed">
                        <p>
                            Many buyers fall into the trap of negotiating based on monthly payments rather than total vehicle cost. Dealerships love this — it allows them to obscure the real price behind loan term adjustments.
                        </p>
                        <p>
                            To protect yourself:
                        </p>
                    </div>

                    <div className="mt-6 space-y-3">
                        {[
                            { icon: Banknote, title: 'Get pre-approved', desc: 'Visit your credit union or bank before the dealership. A pre-approval gives you a baseline rate and removes dealer financing leverage.' },
                            { icon: DollarSign, title: 'Compare manufacturer financing', desc: 'Manufacturers sometimes offer promotional rates (0% APR, cash-back). Compare these against your pre-approval to find the best total cost.' },
                            { icon: Shield, title: 'Avoid payment framing', desc: 'When a salesperson asks "What monthly payment are you comfortable with?" — redirect. Always negotiate on the total out-the-door price first.' }
                        ].map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <div key={i} className="bg-[#14141B] rounded-2xl border border-[#2A2A35] p-6 flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center shrink-0">
                                        <Icon size={18} className="text-[#C9A84C]" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm mb-1 text-[#FAF8F5]/90">{item.title}</h3>
                                        <p className="text-sm text-[#FAF8F5]/60">{item.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <SectionDivider />

                {/* Section 7 — Add-Ons */}
                <section className="pb-section">
                    <SectionNumber number="07" />
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">
                        Add-Ons to <span className="font-['Playfair_Display'] italic text-[#C9A84C]">Watch For</span>
                    </h2>
                    <div className="space-y-5 text-[#FAF8F5]/70 leading-relaxed mb-8">
                        <p>
                            After you agree on a vehicle price, you'll typically be guided into the finance office. This is where dealerships make a significant portion of their profit — through add-on products presented as essential.
                        </p>
                        <p>
                            Most are unnecessary. Here's what to know:
                        </p>
                    </div>

                    <div className="bg-[#14141B] rounded-[2rem] border border-[#2A2A35] overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-[#2A2A35]">
                                    <th className="px-6 py-4 text-xs font-['JetBrains_Mono'] text-[#FAF8F5]/40 uppercase tracking-wider">Add-On</th>
                                    <th className="px-6 py-4 text-xs font-['JetBrains_Mono'] text-[#FAF8F5]/40 uppercase tracking-wider">Verdict</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2A2A35]">
                                {[
                                    { name: 'VIN Etching', verdict: 'Rarely worth the cost. Insurance discounts are minimal.' },
                                    { name: 'Paint Protection Film', verdict: 'Can be worthwhile — but negotiate the price down significantly, or source independently.' },
                                    { name: 'Fabric/Leather Protection', verdict: 'A $20 can of Scotchgard does the same job. Skip it.' },
                                    { name: 'Wheel Locks', verdict: 'Costs $5–15 online. Dealers charge $200+.' },
                                    { name: 'Prepaid Maintenance', verdict: 'Rarely a savings unless heavily discounted. Do the math.' },
                                    { name: 'Extended Warranty', verdict: 'Consider only for vehicles with complex technology or known reliability concerns. Always negotiable.' }
                                ].map((item, i) => (
                                    <tr key={i} className="hover:bg-[#1A1A24]/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-[#FAF8F5]/80">{item.name}</td>
                                        <td className="px-6 py-4 text-[#FAF8F5]/50">{item.verdict}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <SectionDivider />

                {/* Section 8 — Walking Away */}
                <section className="pb-section">
                    <SectionNumber number="08" />
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">
                        The Power of <span className="font-['Playfair_Display'] italic text-[#C9A84C]">Walking Away</span>
                    </h2>
                    <div className="space-y-5 text-[#FAF8F5]/70 leading-relaxed">
                        <p>
                            The single most powerful tool in any negotiation is patience. The ability to walk away — and mean it — fundamentally shifts the power dynamic.
                        </p>
                        <p>
                            Dealerships are designed to create urgency. Phrases like "this deal won't last" or "someone else is looking at this car" are standard sales techniques. They rarely reflect reality.
                        </p>
                    </div>

                    <div className="mt-8 space-y-3">
                        {[
                            { icon: Clock, text: 'Take time between the test drive and the purchase decision. Sleep on it.' },
                            { icon: Search, text: 'Always compare multiple dealerships. Loyalty rarely earns discounts — competition does.' },
                            { icon: Shield, text: 'If the deal doesn\'t feel right, leave. The car will still be there tomorrow. And if it isn\'t — another one will.' }
                        ].map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <div key={i} className="flex items-start gap-4 bg-[#14141B] rounded-2xl border border-[#2A2A35] p-5">
                                    <Icon size={18} className="text-[#C9A84C] mt-0.5 shrink-0" />
                                    <p className="text-sm text-[#FAF8F5]/70 font-medium">{item.text}</p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <SectionDivider />

                {/* Conclusion */}
                <section className="pb-section">
                    <div className="bg-[#14141B] rounded-[2rem] border border-[#C9A84C]/20 p-8 md:p-12 text-center">
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
                            The Autolitics <span className="font-['Playfair_Display'] italic text-[#C9A84C]">Buying Mindset</span>
                        </h2>
                        <div className="space-y-5 text-[#FAF8F5]/70 leading-relaxed max-w-lg mx-auto mb-8">
                            <p>
                                Prepared buyers maintain control. They understand the vehicle. They understand the dealership. They understand the deal structure.
                            </p>
                            <p className="text-[#FAF8F5]/90 font-medium text-lg">
                                Clarity. Patience. Confidence.
                            </p>
                            <p className="text-[#FAF8F5]/50 text-sm">
                                That's not just a strategy — it's a fundamentally different way to buy a car.
                            </p>
                        </div>

                        <Link
                            to="/book"
                            className="inline-block relative overflow-hidden group/btn bg-[#C9A84C] text-[#0D0D12] px-8 py-4 rounded-full font-bold text-lg transition-transform duration-300 hover:scale-[1.03] shadow-[0_4px_20px_rgba(201,168,76,0.2)]"
                            style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
                        >
                            <span className="relative z-10 block transition-transform group-hover/btn:-translate-y-[1px]">
                                Talk to an Advisor
                            </span>
                            <span className="absolute inset-0 bg-white/30 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 rounded-full"></span>
                        </Link>
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
