import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

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
                '.phil-text',
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1.2,
                    stagger: 0.2,
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
        <section id="philosophy" ref={containerRef} className="relative py-40 bg-primary text-ivory overflow-hidden">
            <div className="absolute inset-0 z-0">
                <div
                    className="parallax-bg w-full h-[120%] absolute -top-[10%] left-0 bg-cover bg-center opacity-20 mix-blend-overlay"
                    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1600861194942-f883de0dfe96?q=80&w=2669&auto=format&fit=crop")' }}
                ></div>
                <div className="absolute inset-0 bg-primary/80"></div>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6">
                <div className="flex flex-col gap-12 md:gap-20">

                    <div className="phil-text">
                        <p className="text-xl md:text-2xl font-sans text-ivory/60 max-w-2xl leading-relaxed tracking-wide">
                            Most vehicle advisory focuses on <span className="text-ivory">the transaction.</span>
                        </p>
                    </div>

                    <div className="phil-text pl-0 md:pl-12 lg:pl-24">
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-sans font-bold leading-[1.1] tracking-tight">
                            We focus on <br />
                            <span className="text-accent italic font-light font-drama inline-block mt-2">the outcome.</span>
                        </h2>
                    </div>

                </div>
            </div>
        </section>
    );
}
