import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';

export default function Philosophy() {
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Parallax Background
            gsap.to('.parallax-bg', {
                yPercent: 20,
                ease: 'none',
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true,
                }
            });

            // Split text reveal simulation
            gsap.fromTo(
                '.phil-el',
                { y: 40, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    stagger: 0.15,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: 'top 60%',
                    }
                }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <section id="philosophy" ref={containerRef} className="relative py-32 md:py-48 bg-primary text-ivory overflow-hidden">
            <div className="absolute inset-0 z-0">
                <div
                    className="parallax-bg w-full h-[120%] absolute -top-[10%] left-0 bg-cover bg-center opacity-20 mix-blend-overlay"
                    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1600861194942-f883de0dfe96?q=80&w=2669&auto=format&fit=crop")' }}
                ></div>
                <div className="absolute inset-0 bg-primary/80"></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6">
                <div className="flex flex-col gap-12">

                    <div className="phil-el">
                        <h2 className="text-3xl md:text-5xl font-sans font-bold text-accent mb-10 tracking-tight">
                            A Big Decision Deserves Clarity
                        </h2>

                        <ul className="space-y-6 text-lg md:text-xl text-ivory/80 font-sans max-w-2xl leading-relaxed">
                            {[
                                "Too many options can feel overwhelming",
                                "Pricing structures vary widely",
                                "Long-term ownership costs aren’t obvious",
                                "Incentives and technology evolve quickly",
                                "Most families make this decision only every 5–10 years"
                            ].map((bullet, i) => (
                                <li key={i} className="flex items-start gap-4">
                                    <span className="text-accent mt-1.5 opacity-70">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </span>
                                    <span>{bullet}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="phil-el mt-8 md:mt-16 border-l-2 border-accent/30 pl-6 md:pl-10 py-2">
                        <p className="text-3xl md:text-5xl lg:text-6xl font-drama italic text-ivory leading-[1.1] tracking-tight">
                            You shouldn’t have to become a car expert just to buy one.
                        </p>
                    </div>

                    {/* Micro-CTA block */}
                    <div className="phil-el mt-16 md:mt-24 pt-12 border-t border-ivory/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <h3 className="text-xl md:text-2xl font-sans font-semibold text-ivory">Not sure where to start?</h3>
                        <Link
                            to="/book"
                            className="inline-block border-2 border-accent text-accent hover:bg-accent hover:text-primary px-8 py-4 rounded-full font-bold transition-all duration-300"
                        >
                            Schedule a 20-minute intro session
                        </Link>
                    </div>

                </div>
            </div>
        </section>
    );
}
