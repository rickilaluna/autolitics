import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

export default function SocialProof() {
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                '.testimonial-el',
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: 'top 80%',
                    }
                }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="py-24 bg-background px-6">
            <div className="max-w-4xl mx-auto flex justify-center">
                <div className="testimonial-el bg-[#2A2A35] text-[#FAF8F5] p-12 md:p-16 rounded-[2.5rem] md:rounded-[3rem] shadow-xl text-center max-w-3xl">
                    <p className="text-2xl md:text-3xl lg:text-4xl font-drama italic leading-relaxed mb-8">
                        "Ricki helped us narrow our options and approach the dealership with confidence. The structure alone was worth it."
                    </p>
                    <p className="font-mono text-sm uppercase tracking-widest text-[#C9A84C]">
                        — Client Name, City
                    </p>
                </div>
            </div>
        </section>
    );
}
