import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Search, ListChecks, Car, ShieldCheck } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/* ─── Step 02: Radar scan — 8 options detected, narrow to 3 strong-fit ─ */
const SHORTLIST_BLIPS = [
    { x: 18, y: 12 }, { x: 72, y: 28 }, { x: 35, y: 45 }, { x: 85, y: 55 },
    { x: 22, y: 70 }, { x: 60, y: 82 }, { x: 48, y: 38 }, { x: 78, y: 65 },
];
const SHORTLIST_KEEP_INDICES = [0, 3, 6]; // 3 strong-fit options that remain

function ShortlistRadarScan() {
    const boxRef = useRef(null);
    const lineRef = useRef(null);
    const blipRefs = useRef([]);

    useEffect(() => {
        if (!boxRef.current || !lineRef.current || blipRefs.current.some(B => !B)) return;
        const line = lineRef.current;
        const blips = blipRefs.current;
        const h = boxRef.current.offsetHeight;
        const tl = gsap.timeline({ repeat: -1 });

        // Phase 1: line scans UP (bottom → top); 8 dots blip in as the line passes each
        tl.fromTo(line, { y: h }, { y: 0, duration: 2, ease: 'sine.inOut' });
        SHORTLIST_BLIPS.forEach((p, i) => {
            const tUp = 2 * (1 - p.y / 100);
            tl.to(blips[i], { scale: 1.4, opacity: 1, duration: 0.15, ease: 'power2.out' }, tUp);
            tl.to(blips[i], { scale: 1, opacity: 0.85, duration: 0.2 }, tUp + 0.15);
        });

        // Phase 2: line scans DOWN (top → bottom); 5 dots fade out, 3 strong-fit remain
        tl.to(line, { y: h, duration: 2, ease: 'sine.inOut' });
        SHORTLIST_BLIPS.forEach((p, i) => {
            const tDown = 4 + (p.y / 100) * 2;
            if (SHORTLIST_KEEP_INDICES.includes(i)) {
                tl.to(blips[i], { scale: 1.15, duration: 0.1, ease: 'power2.out' }, tDown);
                tl.to(blips[i], { scale: 1, opacity: 0.9, duration: 0.15 }, tDown + 0.1);
            } else {
                tl.to(blips[i], { scale: 0, opacity: 0, duration: 0.25, ease: 'power2.in' }, tDown);
            }
        });

        return () => tl.kill();
    }, []);

    return (
        <div ref={boxRef} className="w-full max-w-sm h-48 lg:h-64 border border-primary/10 rounded-xl relative overflow-hidden bg-background">
            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to right, #2A2A350a 1px, transparent 1px), linear-gradient(to bottom, #2A2A350a 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            {SHORTLIST_BLIPS.map((p, i) => (
                <div
                    key={i}
                    ref={el => blipRefs.current[i] = el}
                    className="absolute w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(201,168,76,0.9)]"
                    style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%) scale(0)', opacity: 0 }}
                />
            ))}
            <div ref={lineRef} className="absolute left-0 right-0 h-0.5 bg-accent shadow-[0_0_10px_rgba(201,168,76,0.8)]" style={{ top: 0 }} />
        </div>
    );
}

/* ─── Step 03: Horizontal scan with blips (Evaluate & Offer) ───────── */
const OFFER_BLIPS = [
    { x: 15, y: 25 }, { x: 40, y: 50 }, { x: 65, y: 30 }, { x: 85, y: 70 },
    { x: 30, y: 75 }, { x: 55, y: 45 }, { x: 75, y: 55 },
];

function EvaluateOfferScan() {
    const boxRef = useRef(null);
    const lineRef = useRef(null);
    const blipRefs = useRef([]);

    useEffect(() => {
        if (!boxRef.current || !lineRef.current || blipRefs.current.some(B => !B)) return;
        const blips = blipRefs.current;
        const w = 320;
        const tl = gsap.timeline({ repeat: -1 });
        tl.to(lineRef.current, { x: w, duration: 2, ease: 'sine.inOut' });
        OFFER_BLIPS.forEach((p, i) => {
            const tRight = (p.x / 100) * 2;
            tl.to(blips[i], { scale: 1.4, opacity: 1, duration: 0.15, ease: 'power2.out' }, tRight);
            tl.to(blips[i], { scale: 1, opacity: 0.8, duration: 0.2 }, tRight + 0.15);
        });
        tl.to(lineRef.current, { x: 0, duration: 2, ease: 'sine.inOut' });
        OFFER_BLIPS.forEach((p, i) => {
            const tLeft = 4 - (p.x / 100) * 2;
            tl.to(blips[i], { scale: 1.4, opacity: 1, duration: 0.15, ease: 'power2.out' }, tLeft);
            tl.to(blips[i], { scale: 1, opacity: 0.8, duration: 0.2 }, tLeft + 0.15);
        });
        return () => tl.kill();
    }, []);

    return (
        <div ref={boxRef} className="w-full max-w-sm h-32 lg:h-40 border border-white/10 rounded-xl relative overflow-hidden bg-[#0A0A0F]" style={{ width: 320, height: 128 }}>
            <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
            {OFFER_BLIPS.map((p, i) => (
                <div
                    key={i}
                    ref={el => blipRefs.current[i] = el}
                    className="absolute w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(201,168,76,0.9)]"
                    style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%) scale(0)', opacity: 0 }}
                />
            ))}
            <div ref={lineRef} className="absolute top-0 bottom-0 w-0.5 bg-accent shadow-[0_0_10px_rgba(201,168,76,0.8)]" style={{ left: 0, transform: 'translateX(0)' }} />
        </div>
    );
}

/* ─── Step 04: Decision Confidence — spider chart from Decision Engine ─── */
const N_AXES = 8;
const angleFor = (i) => (i / N_AXES) * Math.PI * 2 - Math.PI / 2;
// Spiky, irregular profiles (radii 0..1) — comparison softer, chosen stronger
const COMP_RADII = [0.28, 0.62, 0.35, 0.78, 0.42, 0.55, 0.38, 0.68];
const GOLD_RADII = [0.58, 0.92, 0.48, 0.98, 0.72, 0.65, 0.88, 0.82];

function DecisionConfidenceRadar() {
    const boxRef = useRef(null);
    const sweepRef = useRef(null);
    const phaseRef = useRef({ comp: 0, gold: 0 });
    const [, setTick] = useState(0);
    const forceUpdate = () => setTick(t => t + 1);

    const cx = 100;
    const cy = 100;
    const r = 88;

    const gridPoints = Array.from({ length: N_AXES }, (_, i) => {
        const a = angleFor(i);
        return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
    });

    const polygonPointsFromRadii = (radii) =>
        radii.map((scale, i) => {
            const a = angleFor(i);
            const R = r * scale;
            return `${cx + R * Math.cos(a)},${cy + R * Math.sin(a)}`;
        }).join(' ');

    const compPhase = phaseRef.current.comp;
    const goldPhase = phaseRef.current.gold;
    const compRadii = COMP_RADII.map(v => v * compPhase);
    const goldRadii = GOLD_RADII.map(v => v * goldPhase);

    useEffect(() => {
        if (!boxRef.current || !sweepRef.current) return;
        const sweep = sweepRef.current;
        gsap.set(sweep, { transformOrigin: '0px 0px', opacity: 0 });
        const tl = gsap.timeline({ repeat: -1 });
        // Comparison polygon grows from center
        tl.to(phaseRef.current, { comp: 1, duration: 1.2, ease: 'power2.out', onUpdate: forceUpdate });
        // Chosen (gold) polygon grows — decision takes shape
        tl.to(phaseRef.current, { gold: 1, duration: 1.4, ease: 'power2.out', onUpdate: forceUpdate }, '-=0.3');
        // Subtle sweep line: one slow rotation, then fade
        tl.to(sweep, { opacity: 0.6, duration: 0.4, ease: 'power2.out' }, '-=0.2');
        tl.to(sweep, { rotation: 360, duration: 5, ease: 'none' });
        tl.to(sweep, { opacity: 0, duration: 0.8, ease: 'power2.in' }, '-=0.5');
        tl.to({}, { duration: 1.2 }); // brief hold
        // Reset for next cycle
        tl.to(phaseRef.current, { comp: 0, gold: 0, duration: 0.6, ease: 'power2.in', onUpdate: forceUpdate });
        tl.to(sweep, { rotation: 0, duration: 0, opacity: 0 });
        return () => tl.kill();
    }, []);

    return (
        <div ref={boxRef} className="w-full max-w-sm h-48 lg:h-52 relative mx-auto rounded-xl overflow-hidden border border-[#2A2A35] bg-[#14141B]" style={{ width: 200, height: 200 }}>
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200" aria-hidden>
                {/* Grid: 5 concentric octagons + 8 spokes (Decision Engine style) */}
                {[1, 2, 3, 4, 5].map(level => (
                    <polygon
                        key={level}
                        points={gridPoints.map(p => {
                            const s = level / 5;
                            return `${cx + (p.x - cx) * s},${cy + (p.y - cy) * s}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#2A2A35"
                        strokeWidth="0.6"
                    />
                ))}
                {gridPoints.map((p, i) => (
                    <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#2A2A35" strokeWidth="0.6" />
                ))}
                {/* Comparison polygon (white/grey) */}
                <polygon
                    points={polygonPointsFromRadii(compRadii)}
                    fill="rgba(250,248,245,0.08)"
                    stroke="rgba(250,248,245,0.3)"
                    strokeWidth="1.2"
                />
                {/* Chosen polygon (gold) */}
                <polygon
                    points={polygonPointsFromRadii(goldRadii)}
                    fill="rgba(201,168,76,0.2)"
                    stroke="#C9A84C"
                    strokeWidth="2"
                />
                {/* Sweep line */}
                <g ref={sweepRef} transform={`translate(${cx},${cy})`}>
                    <line x1={0} y1={0} x2={r} y2={0} stroke="#C9A84C" strokeWidth="1" strokeLinecap="round" opacity={0.7} />
                </g>
            </svg>
        </div>
    );
}

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
                                <Search className="text-accent mb-6 w-5 h-5 lg:w-6 lg:h-6" strokeWidth={1.5} />
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
                                <ListChecks className="text-accent mb-6 w-5 h-5 lg:w-6 lg:h-6" strokeWidth={1.5} />
                                <span className="font-mono text-accent text-xl mb-4 lg:mb-6">02 //</span>
                                <h4 className="text-3xl lg:text-4xl font-bold font-sans tracking-tight mb-4 lg:mb-6">Shortlist & Strategy</h4>
                                <p className="text-base lg:text-lg text-text/70 leading-relaxed max-w-md">
                                    3–5 strong-fit options with clear rationale.
                                </p>
                            </div>
                            <div className="lg:w-1/2 bg-primary/5 relative flex items-center justify-center p-8 lg:p-12 overflow-hidden border-t lg:border-t-0 lg:border-l border-text/5 min-h-[250px] lg:min-h-0">
                                <ShortlistRadarScan />
                            </div>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div id="step-03" ref={el => cardsRef.current[2] = el} className="sticky top-24 lg:top-40 h-auto lg:h-[500px] w-full flex items-center justify-center mb-16 lg:mb-32 origin-top">
                        <div className="w-full h-full bg-primary text-ivory rounded-[2.5rem] lg:rounded-[3rem] border border-white/10 shadow-2xl flex flex-col lg:flex-row overflow-hidden">
                            <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                                <Car className="text-accent mb-6 w-5 h-5 lg:w-6 lg:h-6" strokeWidth={1.5} />
                                <span className="font-mono text-accent text-xl mb-4 lg:mb-6">03 //</span>
                                <h4 className="text-3xl lg:text-4xl font-bold font-sans tracking-tight mb-4 lg:mb-6">Evaluate & Offer</h4>
                                <p className="text-base lg:text-lg text-ivory/60 leading-relaxed max-w-md">
                                    What to look for. How to evaluate. How to structure the deal.
                                </p>
                            </div>
                            <div className="lg:w-1/2 bg-[#0A0A0F] relative flex items-center justify-center p-8 lg:p-12 overflow-hidden border-t lg:border-t-0 lg:border-l border-white/5 min-h-[250px] lg:min-h-0">
                                <EvaluateOfferScan />
                            </div>
                        </div>
                    </div>

                    {/* Step 4 */}
                    <div id="step-04" ref={el => cardsRef.current[3] = el} className="sticky top-24 lg:top-44 h-auto lg:h-[500px] w-full flex items-center justify-center origin-top">
                        <div className="w-full h-full bg-ivory rounded-[2.5rem] lg:rounded-[3rem] border border-text/10 shadow-2xl flex flex-col lg:flex-row overflow-hidden">
                            <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                                <ShieldCheck className="text-accent mb-6 w-5 h-5 lg:w-6 lg:h-6" strokeWidth={1.5} />
                                <span className="font-mono text-accent text-xl mb-4 lg:mb-6">04 //</span>
                                <h4 className="text-3xl lg:text-4xl font-bold font-sans tracking-tight mb-4 lg:mb-6">Decision Confidence</h4>
                                <p className="text-base lg:text-lg text-text/70 leading-relaxed max-w-md">
                                    Final review before signing.
                                </p>
                            </div>
                            <div className="lg:w-1/2 bg-primary/5 relative flex items-center justify-center p-8 lg:p-12 overflow-hidden border-t lg:border-t-0 lg:border-l border-text/5 min-h-[250px] lg:min-h-0">
                                <DecisionConfidenceRadar />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
