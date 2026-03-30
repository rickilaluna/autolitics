import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';

const heroImage = '/img/autolitics-studio-hero.png';

export default function Hero() {
    const containerRef = useRef(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                '.hero-el',
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'power3.out', delay: 0.2 }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="relative h-[100dvh] w-full flex items-end overflow-hidden pb-12 md:pb-24">
            <div className="absolute inset-0 z-0">
                <img
                    src={heroImage}
                    alt="Autolitics Studio Hero Image"
                    className="w-full h-full object-cover origin-center opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/60 to-transparent"></div>
            </div>

            <div className="relative z-10 w-full px-8 md:px-16 lg:px-24 max-w-7xl mx-auto flex flex-col justify-end h-full">
                <div className="max-w-3xl mb-12">
                    <h1 className="flex flex-col gap-2">
                        <span className="hero-el text-xl md:text-2xl font-bold text-accent tracking-tighter mix-blend-lighten">
                            Buy the Right Car.
                        </span>
                        <span className="hero-el text-5xl md:text-7xl lg:text-8xl font-drama text-ivory leading-[1.05] tracking-tight">
                            With an Expert<br /><i className="text-[0.9em]">in Your Corner.</i>
                        </span>
                    </h1>

                    <div className="hero-el mt-10 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                        <Link to="/book" className="inline-block bg-accent text-primary px-8 py-4 rounded-full font-bold transition-transform duration-300 hover:scale-[1.03]" style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}>
                            Schedule Your Intro Strategy Session
                        </Link>
                        <p className="font-mono text-sm text-ivory/60 max-w-sm leading-relaxed">
                            Make a confident vehicle decision — with expert clarity and no dealership game-play.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
