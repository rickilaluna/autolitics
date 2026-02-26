import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

export default function Features() {
    const containerRef = useRef(null);

    // Clarity Fade State
    const [activeIndex, setActiveIndex] = useState(0);
    const clarityItems = [
        'Define true needs over marketing',
        'Best-fit vehicles for lifestyle',
        'Clear evaluation frameworks'
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % clarityItems.length);
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    // Strategy Typewriter State
    const [typedText, setTypedText] = useState('');
    const fullText = "Identify best-fit options. Analyze long-term costs. Move forward confidently.";

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            setTypedText(fullText.substring(0, index));
            index++;
            if (index > fullText.length) {
                setTimeout(() => { index = 0; setTypedText(''); }, 3000);
            }
        }, 50);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Advocacy Path Animation
            const tlAdv = gsap.timeline({ repeat: -1, repeatDelay: 1 });

            // Note: Line length is roughly sqrt(160^2 + 40^2) ≈ 165
            tlAdv.fromTo('#advocacy-line', { strokeDashoffset: 165 }, { strokeDashoffset: 0, duration: 2, ease: 'power2.inOut' }, 0)
                .fromTo('#advocacy-dot', { x: 0, y: 0 }, { x: 160, y: -40, duration: 2, ease: 'power2.inOut' }, 0)
                .fromTo('#advocacy-pulse', { scale: 1, opacity: 1 }, { scale: 3, opacity: 0, duration: 0.8, transformOrigin: 'calc(180px) calc(30px)', ease: 'power2.out' }, "-=0.2");

            // Entrance Animation
            gsap.fromTo(
                '.feature-card',
                { y: 60, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    stagger: 0.15,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: 'top 75%',
                    }
                }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <section id="features" ref={containerRef} className="py-32 bg-background px-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-24">
                    <h2 className="text-sm font-mono text-accent uppercase tracking-[0.2em] mb-6">Independent. Strategic. On Your Side.</h2>
                    <h3 className="text-4xl md:text-5xl lg:text-6xl font-sans font-bold text-primary max-w-3xl leading-[1.1] tracking-tight">
                        You shouldn't have to become a car expert <br /><i>just to buy one.</i>
                    </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Clarity Card */}
                    <div className="feature-card bg-white rounded-[2rem] p-10 border border-text/5 shadow-sm hover:shadow-xl transition-shadow duration-500 flex flex-col h-[460px]">
                        <h4 className="text-2xl font-bold font-sans text-primary mb-3">Clarity</h4>
                        <p className="text-text/70 text-[15px] mb-8 leading-relaxed">
                            We define what you actually need — not what marketing pushes.
                        </p>

                        <div className="relative h-[200px] w-full mt-auto bg-background rounded-xl border border-text/5 p-6 overflow-hidden flex items-center justify-center text-center">
                            {clarityItems.map((item, i) => (
                                <div
                                    key={i}
                                    className="absolute w-full px-6 transition-all duration-1000 ease-in-out"
                                    style={{
                                        opacity: activeIndex === i ? 1 : 0,
                                        transform: activeIndex === i ? 'translateY(0)' : 'translateY(10px)',
                                        pointerEvents: activeIndex === i ? 'auto' : 'none'
                                    }}
                                >
                                    <span className="font-mono text-sm text-primary/80 leading-relaxed block">{item}</span>
                                </div>
                            ))}
                            {/* Pagination dots */}
                            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
                                {clarityItems.map((_, i) => (
                                    <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${activeIndex === i ? 'bg-accent' : 'bg-text/20'}`}></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Strategy Card */}
                    <div className="feature-card bg-primary text-ivory rounded-[2rem] p-10 shadow-2xl overflow-hidden flex flex-col h-[460px] relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-transparent opacity-50"></div>
                        <div className="flex justify-between items-center mb-8">
                            <h4 className="text-2xl font-bold font-sans">Strategy</h4>
                            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                                <span className="font-mono text-[9px] text-[#10B981] uppercase tracking-wider">Live Feed</span>
                            </div>
                        </div>

                        <p className="text-ivory/60 text-[15px] mb-8 leading-relaxed">
                            We identify the best-fit vehicles for your lifestyle and budget.
                        </p>

                        <div className="mt-auto bg-[#08080A] rounded-xl p-6 border border-white/5 font-mono text-sm leading-relaxed h-40 relative flex flex-col justify-center">
                            <div className="text-accent/90">{typedText}<span className="inline-block w-2 h-4 bg-accent ml-1 -mb-1 animate-pulse"></span></div>
                            <div className="absolute bottom-4 right-6 text-[9px] text-white/20">SYS.OUT_</div>
                        </div>
                    </div>

                    {/* Advocacy Card */}
                    <div className="feature-card bg-white rounded-[2rem] p-10 border border-text/5 shadow-sm hover:shadow-xl transition-shadow duration-500 flex flex-col h-[460px]">
                        <h4 className="text-2xl font-bold font-sans text-primary mb-3">Advocacy</h4>
                        <p className="text-text/70 text-[15px] mb-8 flex-grow leading-relaxed">
                            I guide you through test drives, pricing, and decision-making so you move forward confidently.
                        </p>

                        <div className="relative mt-auto bg-background rounded-xl p-6 border border-text/5 h-44 flex flex-col items-center justify-center overflow-hidden">
                            <svg className="w-full h-full max-w-[200px]" viewBox="0 0 200 100">
                                {/* Base path */}
                                <line x1="20" y1="70" x2="180" y2="30" stroke="rgba(42, 42, 53, 0.1)" strokeWidth="2" strokeDasharray="4 4" />
                                {/* Stops */}
                                <circle cx="20" cy="70" r="3" fill="rgba(42, 42, 53, 0.2)" />
                                <circle cx="100" cy="50" r="3" fill="rgba(42, 42, 53, 0.2)" />
                                <circle cx="180" cy="30" r="3" fill="rgba(42, 42, 53, 0.2)" />

                                {/* Active path */}
                                <line id="advocacy-line" x1="20" y1="70" x2="180" y2="30" stroke="#C9A84C" strokeWidth="2" strokeDasharray="165" strokeDashoffset="165" />
                                {/* Moving dot */}
                                <circle id="advocacy-dot" cx="20" cy="70" r="4" fill="#C9A84C" />
                                {/* Final pulse */}
                                <circle id="advocacy-pulse" cx="180" cy="30" r="4" fill="none" stroke="#C9A84C" strokeWidth="2" opacity="0" />
                            </svg>
                            <div className="absolute bottom-4 flex justify-between w-full px-8 text-[9px] font-mono text-text/40 tracking-widest uppercase">
                                <span>Start</span>
                                <span>Support</span>
                                <span>Decide</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
