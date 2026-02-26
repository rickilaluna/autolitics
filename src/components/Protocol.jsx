import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const stepsData = [
    { num: '01', id: 'step-01', title: 'Discovery Call', desc: 'Understand needs, lifestyle, budget, preferences.' },
    { num: '02', id: 'step-02', title: 'Vehicle Shortlist & Strategy', desc: '3–5 strong-fit options with clear rationale.' },
    { num: '03', id: 'step-03', title: 'Test Drive & Offer Guidance', desc: 'What to look for. How to evaluate. How to structure the deal.' },
    { num: '04', id: 'step-04', title: 'Decision Confidence', desc: 'Final review before signing.' }
];

export default function Protocol() {
    const containerRef = useRef(null);
    const cardsRef = useRef([]);
    const [activeStep, setActiveStep] = useState(0);

    const scrollToStep = (index) => {
        const card = cardsRef.current[index];
        if (card) {
            // Include top offset for sticky header / padding
            const offset = 120; // ~top-32
            const top = card.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const mm = gsap.matchMedia();

        mm.add("(min-width: 1024px)", () => {
            const ctx = gsap.context(() => {
                const cards = cardsRef.current;

                cards.forEach((card, index) => {
                    // Update active step tracker based on when the card scrolls into the central focus area
                    if (index > 0) {
                        ScrollTrigger.create({
                            trigger: card,
                            start: 'top 55%',
                            onEnter: () => setActiveStep(index),
                            onLeaveBack: () => setActiveStep(index - 1),
                        });
                    }

                    // Stacking visual effect: Current card fades when the NEXT card overlaps it significantly
                    if (index === cards.length - 1) return;

                    gsap.to(card, {
                        scale: 0.92,
                        y: -30,
                        opacity: 0.3,
                        filter: 'blur(8px)',
                        scrollTrigger: {
                            trigger: cards[index + 1],
                            start: 'top 55%', // Sync perfectly with the active step tracking
                            end: 'top 15%',
                            scrub: true,
                        }
                    });
                });
            }, containerRef);
            return () => ctx.revert();
        });

        mm.add("(max-width: 1023px)", () => {
            const ctx = gsap.context(() => {
                const cards = cardsRef.current;
                cards.forEach((card, index) => {
                    ScrollTrigger.create({
                        trigger: card,
                        start: 'top 60%',
                        end: 'bottom 40%',
                        onToggle: (self) => {
                            if (self.isActive) setActiveStep(index);
                        }
                    });
                });
            }, containerRef);
            return () => ctx.revert();
        });

        return () => mm.revert();
    }, []);

    return (
        <section id="protocol" ref={containerRef} className="py-24 lg:py-32 bg-background px-6">
            <div className="max-w-7xl mx-auto text-center mb-16 lg:mb-24 relative z-10">
                <h2 className="text-sm font-mono text-accent uppercase tracking-[0.2em] mb-6">Process</h2>
                <h3 className="text-4xl md:text-5xl lg:text-7xl font-sans font-bold text-primary max-w-4xl mx-auto leading-[1.1] tracking-tight">
                    Simple, Structured,<br /><i>Effective</i>
                </h3>
            </div>

            <div className="max-w-7xl mx-auto flex gap-8 lg:gap-16 relative">

                {/* Floating Tracker (Desktop Only) */}
                <div className="hidden lg:block w-48 shrink-0 relative">
                    <div className="sticky top-40 flex flex-col gap-8 py-4 pr-8 border-r-2 border-text/10">
                        {stepsData.map((step, idx) => {
                            const isActive = activeStep === idx;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => scrollToStep(idx)}
                                    className="group flex flex-col items-start text-left focus:outline-none relative"
                                    aria-label={`Scroll to ${step.title}`}
                                    aria-current={isActive ? 'step' : undefined}
                                >
                                    {/* Active State Indicator Bar */}
                                    <div className={`absolute -right-[34px] top-0 w-1 transition-all duration-500 ease-out rounded-full bg-accent ${isActive ? 'h-full opacity-100 scale-y-100' : 'h-0 opacity-0 scale-y-0'}`}></div>

                                    <span className={`font-mono text-xs uppercase tracking-widest mb-2 transition-all duration-300 ${isActive ? 'text-accent font-bold' : 'text-text/50 group-hover:text-text/80'}`}>
                                        Step {step.num}
                                    </span>
                                    <span className={`text-sm font-bold font-sans pr-4 transition-all duration-300 ${isActive ? 'text-primary' : 'text-text/40 group-hover:text-text/70'}`}>
                                        {step.title}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex-1 w-full pb-32 lg:pb-0 relative z-10">

                    {/* Step 1 */}
                    <div id="step-01" ref={el => cardsRef.current[0] = el} className="sticky top-24 lg:top-32 h-auto lg:h-[500px] w-full flex items-center justify-center mb-16 lg:mb-32 origin-top">
                        <div className="w-full h-full bg-ivory rounded-[2.5rem] lg:rounded-[3rem] border border-text/10 shadow-2xl flex flex-col lg:flex-row overflow-hidden">
                            <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                                <span className="font-mono text-accent text-xl mb-4 lg:mb-6">01 //</span>
                                <h4 className="text-3xl lg:text-4xl font-bold font-sans tracking-tight mb-4 lg:mb-6">Discovery Call</h4>
                                <p className="text-base lg:text-lg text-text/70 leading-relaxed max-w-md">
                                    (20–30 mins)<br /><br />
                                    Understand needs, lifestyle, budget, preferences.
                                </p>
                            </div>
                            <div className="lg:w-1/2 bg-primary/5 relative flex items-center justify-center p-8 lg:p-12 overflow-hidden border-t lg:border-t-0 lg:border-l border-text/5 min-h-[250px] lg:min-h-0">
                                <div className="w-48 h-48 lg:w-64 lg:h-64 border-[1px] border-primary/20 rounded-full flex items-center justify-center animate-[spin_20s_linear_infinite]">
                                    <div className="w-32 h-32 lg:w-48 lg:h-48 border-[1px] border-accent/40 rounded-full flex items-center justify-center animate-[spin_15s_linear_infinite_reverse]">
                                        <div className="w-20 h-20 lg:w-32 lg:h-32 border-[1px] border-primary/20 rounded-full border-dashed animate-[spin_10s_linear_infinite]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div id="step-02" ref={el => cardsRef.current[1] = el} className="sticky top-24 lg:top-36 h-auto lg:h-[500px] w-full flex items-center justify-center mb-16 lg:mb-32 origin-top">
                        <div className="w-full h-full bg-white rounded-[2.5rem] lg:rounded-[3rem] border border-text/10 shadow-2xl flex flex-col lg:flex-row overflow-hidden">
                            <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                                <span className="font-mono text-accent text-xl mb-4 lg:mb-6">02 //</span>
                                <h4 className="text-3xl lg:text-4xl font-bold font-sans tracking-tight mb-4 lg:mb-6">Shortlist & Strategy</h4>
                                <p className="text-base lg:text-lg text-text/70 leading-relaxed max-w-md">
                                    3–5 strong-fit options with clear rationale.
                                </p>
                            </div>
                            <div className="lg:w-1/2 bg-primary/5 relative flex items-center justify-center p-8 lg:p-12 overflow-hidden border-t lg:border-t-0 lg:border-l border-text/5 min-h-[250px] lg:min-h-0">
                                <div className="w-full max-w-sm h-48 lg:h-64 border border-primary/10 rounded-xl relative overflow-hidden bg-background">
                                    <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to right, #2A2A350a 1px, transparent 1px), linear-gradient(to bottom, #2A2A350a 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                                    <div className="absolute top-0 left-0 w-full h-[2px] bg-accent shadow-[0_0_10px_rgba(201,168,76,0.8)]" style={{ animation: 'scan 4s ease-in-out infinite alternate' }}></div>
                                    <style>{`
                                        @keyframes scan {
                                            0% { transform: translateY(0); }
                                            100% { transform: translateY(256px); }
                                        }
                                    `}</style>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div id="step-03" ref={el => cardsRef.current[2] = el} className="sticky top-24 lg:top-40 h-auto lg:h-[500px] w-full flex items-center justify-center mb-16 lg:mb-32 origin-top">
                        <div className="w-full h-full bg-primary text-ivory rounded-[2.5rem] lg:rounded-[3rem] border border-white/10 shadow-2xl flex flex-col lg:flex-row overflow-hidden">
                            <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                                <span className="font-mono text-accent text-xl mb-4 lg:mb-6">03 //</span>
                                <h4 className="text-3xl lg:text-4xl font-bold font-sans tracking-tight mb-4 lg:mb-6">Evaluate & Offer</h4>
                                <p className="text-base lg:text-lg text-ivory/60 leading-relaxed max-w-md">
                                    What to look for. How to evaluate. How to structure the deal.
                                </p>
                            </div>
                            <div className="lg:w-1/2 bg-[#0A0A0F] relative flex items-center justify-center p-8 lg:p-12 overflow-hidden border-t lg:border-t-0 lg:border-l border-white/5 min-h-[250px] lg:min-h-0">
                                <svg className="w-full max-w-sm h-32" viewBox="0 0 400 100" fill="none">
                                    <path d="M0 50 L100 50 L120 20 L140 80 L160 10 L180 90 L200 40 L220 60 L240 50 L400 50" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 800, strokeDashoffset: 800, animation: 'dash 3s linear infinite' }} />
                                    <style>{`
                                        @keyframes dash {
                                            to { stroke-dashoffset: 0; }
                                        }
                                    `}</style>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Step 4 */}
                    <div id="step-04" ref={el => cardsRef.current[3] = el} className="sticky top-24 lg:top-44 h-auto lg:h-[500px] w-full flex items-center justify-center origin-top">
                        <div className="w-full h-full bg-ivory rounded-[2.5rem] lg:rounded-[3rem] border border-text/10 shadow-2xl flex flex-col lg:flex-row overflow-hidden">
                            <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                                <span className="font-mono text-accent text-xl mb-4 lg:mb-6">04 //</span>
                                <h4 className="text-3xl lg:text-4xl font-bold font-sans tracking-tight mb-4 lg:mb-6">Decision Confidence</h4>
                                <p className="text-base lg:text-lg text-text/70 leading-relaxed max-w-md">
                                    Final review before signing.
                                </p>
                            </div>
                            <div className="lg:w-1/2 bg-primary/5 relative flex items-center justify-center p-8 lg:p-12 overflow-hidden border-t lg:border-t-0 lg:border-l border-text/5 min-h-[250px] lg:min-h-0">
                                <svg className="w-full max-w-sm h-48 opacity-60" viewBox="0 0 100 100" fill="none">
                                    <rect x="25" y="25" w="20" h="20" stroke="#C9A84C" strokeWidth="1" className="opacity-40" />
                                    <rect x="55" y="25" w="20" h="20" stroke="#C9A84C" strokeWidth="1" className="opacity-40" />
                                    <rect x="25" y="55" w="20" h="20" stroke="#C9A84C" strokeWidth="2" />
                                    <rect x="55" y="55" w="20" h="20" stroke="#C9A84C" strokeWidth="1" className="opacity-40" />
                                    <path d="M 30,65 L 40,65" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" className="animate-pulse" />
                                </svg>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
