import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ChevronDown } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const faqs = [
    {
        question: "Are you affiliated with dealerships or manufacturers?",
        answer: "No. Autolitics Studio is fully independent. I receive no commissions, referral fees, or incentives from manufacturers or dealerships."
    },
    {
        question: "Do you negotiate with dealers on my behalf?",
        answer: "I do not represent clients directly in negotiations. Instead, I provide structured guidance on pricing, positioning, and negotiation posture so you can approach discussions confidently. Optional negotiation support is available during active offer stages."
    },
    {
        question: "Do you work with used vehicles?",
        answer: "Yes. The advisory process applies to new, used, hybrid, and electric vehicles."
    },
    {
        question: "What happens after I pay for the Core Advisory?",
        answer: "After payment, you schedule a 60–75 minute discovery session. From there, I prepare your Strategy Brief, vehicle shortlist, test-drive framework, and pricing guidance."
    },
    {
        question: "How long does the process take?",
        answer: "Most clients receive their tailored materials within 3–5 business days of the discovery session."
    },
    {
        question: "What if I already have a vehicle in mind?",
        answer: "That’s perfectly fine. I can evaluate its positioning, pricing, and alternatives to ensure it aligns with your goals and long-term ownership considerations."
    },
    {
        question: "Is this worth it for a moderately priced vehicle?",
        answer: "Even modest pricing missteps, lease structure issues, or ownership tradeoffs can exceed the advisory fee over time. The value is in clarity, positioning, and avoiding preventable mistakes."
    }
];

function AccordionItem({ question, answer, isOpen, onClick }) {
    const contentRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            gsap.to(contentRef.current, {
                height: 'auto',
                opacity: 1,
                duration: 0.4,
                ease: 'power3.out'
            });
        } else {
            gsap.to(contentRef.current, {
                height: 0,
                opacity: 0,
                duration: 0.3,
                ease: 'power2.inOut'
            });
        }
    }, [isOpen]);

    return (
        <div className="border border-text/10 bg-white rounded-[2rem] overflow-hidden shadow-sm transition-colors hover:border-accent/40 mb-4">
            <button
                className="w-full text-left px-6 py-6 md:px-8 flex justify-between items-center bg-transparent focus:outline-none"
                onClick={onClick}
            >
                <span className="font-bold text-primary text-lg pr-4">{question}</span>
                <div className={`w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-accent text-primary' : 'text-accent'}`}>
                    <ChevronDown size={20} />
                </div>
            </button>
            <div
                ref={contentRef}
                className="h-0 opacity-0 overflow-hidden"
            >
                <div className="px-6 pb-6 md:px-8 md:pb-8 text-text/70 leading-relaxed font-medium">
                    {answer}
                </div>
            </div>
        </div>
    );
}

export default function FAQ() {
    const containerRef = useRef(null);
    const [openIndex, setOpenIndex] = useState(0); // Open first by default

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                '.fade-up',
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const toggleAccordion = (index) => {
        setOpenIndex(openIndex === index ? -1 : index);
    };

    return (
        <div ref={containerRef} className="bg-background min-h-screen text-text font-sans relative flex flex-col pt-32 selection:bg-accent/20 selection:text-text">
            {/* Global Noise Overlay */}
            <div className="pointer-events-none fixed inset-0 z-50 opacity-5 mix-blend-overlay">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                    <filter id="noiseFilterFaq">
                        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#noiseFilterFaq)" />
                </svg>
            </div>

            <Navbar />

            <main className="flex-1 w-full max-w-3xl mx-auto px-6 mb-32 space-y-16">

                {/* Header */}
                <div className="pt-16 md:pt-24 fade-up text-center">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary mb-4">
                        Frequently Asked Questions
                    </h1>
                </div>

                {/* Accordion List */}
                <div className="fade-up">
                    {faqs.map((faq, index) => (
                        <AccordionItem
                            key={index}
                            question={faq.question}
                            answer={faq.answer}
                            isOpen={openIndex === index}
                            onClick={() => toggleAccordion(index)}
                        />
                    ))}
                </div>

                {/* CTA Block */}
                <div className="fade-up pt-16 text-center space-y-8">
                    <h2 className="text-2xl font-bold text-primary">Still have questions?</h2>

                    <div className="flex flex-col items-center gap-6">
                        <Link
                            to="/book"
                            className="inline-block w-full sm:w-auto relative overflow-hidden group/btn bg-primary text-white px-8 py-4 rounded-full font-bold text-lg transition-transform duration-300 hover:scale-[1.03] shadow-[0_4px_14px_rgba(13,13,18,0.3)]"
                            style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
                        >
                            <span className="relative z-10 block transition-transform group-hover/btn:-translate-y-[1px]">
                                Schedule Intro Strategy Session
                            </span>
                            <span className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 rounded-full"></span>
                        </Link>

                        <a
                            href="mailto:ricki@autolitics.com"
                            className="inline-flex items-center text-primary font-bold hover:text-accent transition-colors duration-300 relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[2px] after:bg-accent after:scale-x-0 after:origin-right hover:after:scale-x-100 hover:after:origin-left after:transition-transform after:duration-300"
                        >
                            Email Studio Directly
                        </a>
                    </div>
                </div>

            </main>

            <Footer />
        </div>
    );
}
