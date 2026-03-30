import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronRight, FileText, CheckCircle2, ShieldCheck, Plus, Minus, ArrowRight, Lock, BookOpen } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

gsap.registerPlugin(ScrollTrigger);

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-[#2A2A35] rounded-2xl bg-[#1A1A24]/30 overflow-hidden transition-all duration-300">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-left px-6 py-5 flex items-center justify-between font-medium hover:bg-[#1A1A24] transition-colors"
                aria-expanded={isOpen}
            >
                <span className="text-[#FAF8F5]/90 pr-4">{question}</span>
                {isOpen ? <Minus className="w-5 h-5 text-[#C9A84C] shrink-0" /> : <Plus className="w-5 h-5 text-[#C9A84C] shrink-0" />}
            </button>
            <div className={`px-6 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-48 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="text-[#FAF8F5]/60 text-sm leading-relaxed">{answer}</p>
            </div>
        </div>
    );
};

const Guide = () => {
    const heroRef = useRef(null);
    const pricingRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".hero-text",
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, duration: 1.2, stagger: 0.1, ease: "power3.out", delay: 0.2 }
            );

            gsap.utils.toArray('.content-section').forEach((section) => {
                gsap.fromTo(section,
                    { y: 40, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 1,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: section,
                            start: "top 85%",
                        }
                    }
                );
            });

            if (pricingRef.current) {
                gsap.fromTo(pricingRef.current,
                    { y: 40, opacity: 0, scale: 0.95 },
                    {
                        y: 0, opacity: 1, scale: 1, duration: 1, ease: "power3.out",
                        scrollTrigger: {
                            trigger: pricingRef.current,
                            start: "top 85%"
                        }
                    }
                );
            }
        });

        return () => ctx.revert();
    }, []);

    const transformations = [
        "You'll narrow from hundreds of models to 3–5 intelligently.",
        "You'll understand what \"market price\" actually means.",
        "You'll recognize unnecessary add-ons immediately.",
        "You'll evaluate offers calmly and strategically.",
        "You'll enter the dealership process prepared — not reactive."
    ];

    const chapters = [
        {
            num: "I",
            title: "Strategy Before Price",
            items: ["Mindset & decision framework", "Defining what actually matters", "Use-case clarity worksheet"]
        },
        {
            num: "II",
            title: "Navigating the Market",
            items: ["Model filtering system", "MSRP, invoice & market adjustments explained", "Incentives & timing"]
        },
        {
            num: "III",
            title: "Structured Evaluation",
            items: ["Shortlist framework", "Test drive scorecard", "Offer evaluation template"]
        },
        {
            num: "IV",
            title: "Dealership Reality, Decoded",
            items: ["Understanding sales tactics", "How to request written breakdowns", "Negotiation posture"]
        },
        {
            num: "V",
            title: "Ownership Intelligence",
            items: ["Total cost of ownership", "Depreciation awareness", "Lease vs finance clarity"]
        }
    ];

    const faqs = [
        {
            q: "Is this a negotiation tactics book?",
            a: "No. This is a structured decision framework designed to reduce stress and clarify positioning before negotiation begins."
        },
        {
            q: "Is this suitable for EV buyers?",
            a: "Yes. The guide includes EV-specific considerations including incentives, charging, and ownership economics."
        },
        {
            q: "How long is the guide?",
            a: "Approximately 45 pages plus printable worksheets."
        },
        {
            q: "Will this replace a strategy session?",
            a: "This guide captures the methodology. Advisory sessions apply it directly to your specific situation."
        }
    ];

    const stripeLink = "https://buy.stripe.com/aFa9AT78C2CT9QIfa98N201";

    return (
        <div className="bg-[#0D0D12] text-[#FAF8F5] min-h-screen font-['Inter'] selection:bg-[#C9A84C]/30 selection:text-[#FAF8F5] pb-24 sm:pb-0">
            <Navbar />

            {/* HERO SECTION */}
            <section ref={heroRef} className="relative min-h-[90vh] flex items-center pt-32 pb-20 px-6 sm:px-12 xl:px-24 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1618365908648-e71bd5716cba?q=80&w=2670&auto=format&fit=crop"
                        alt="Dark architectural texture"
                        className="w-full h-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D12] via-[#0D0D12]/80 to-transparent" />
                </div>

                <div className="relative z-10 max-w-5xl mx-auto md:mx-0">
                    <div className="hero-text inline-block px-4 py-1.5 rounded-full border border-[#2A2A35] bg-[#1A1A1A]/50 backdrop-blur-md mb-8">
                        <span className="text-xs font-['JetBrains_Mono'] tracking-wider text-[#C9A84C] uppercase">
                            Digital Product
                        </span>
                    </div>

                    <h1 className="hero-text text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-8 leading-tight">
                        Make a confident car decision — <br className="hidden lg:block" />
                        <span className="font-['Playfair_Display'] italic font-normal text-[#C9A84C]">without weeks of research</span><br className="hidden lg:block" />
                        or dealership stress.
                    </h1>

                    <p className="hero-text text-lg sm:text-xl text-[#FAF8F5]/80 max-w-3xl mb-12 font-light leading-relaxed">
                        A structured, decision-first framework that replaces overwhelm with clarity and replaces negotiation anxiety with strategy.
                    </p>

                    <div className="hero-text flex flex-col items-start gap-4">
                        <a href={stripeLink} className="group relative overflow-hidden bg-[#C9A84C] text-[#0D0D12] py-4 px-10 rounded-full font-bold text-lg transition-transform duration-300 shadow-[0_4px_14px_rgba(201,168,76,0.2)] hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-2">
                            <span className="relative z-10 flex items-center gap-2">
                                Buy the Guide
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-full"></span>
                        </a>
                        <div className="flex items-center gap-2 text-sm text-[#FAF8F5]/50 font-['JetBrains_Mono'] ml-2">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Instant digital access. Secure checkout.</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* TRANSFORMATION SECTION */}
            <section className="py-24 px-6 sm:px-12 xl:px-24 border-t border-[#2A2A35]/50 relative overflow-hidden">
                <div className="max-w-4xl mx-auto content-section">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-['Playfair_Display'] italic mb-16 text-center">
                        What This Guide Changes
                    </h2>

                    <div className="space-y-6">
                        {transformations.map((text, i) => (
                            <div key={i} className="flex items-start sm:items-center gap-5 p-6 rounded-2xl bg-[#1A1A24]/40 border border-[#2A2A35]/60 hover:border-[#C9A84C]/30 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-[#0D0D12] flex items-center justify-center border border-[#2A2A35] shrink-0 mt-1 sm:mt-0">
                                    <CheckCircle2 className="w-5 h-5 text-[#C9A84C]" />
                                </div>
                                <p className="text-lg text-[#FAF8F5]/90 font-light leading-relaxed">{text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <div className="max-w-4xl mx-auto w-full h-px bg-gradient-to-r from-transparent via-[#C9A84C]/20 to-transparent" />

            {/* VALUE ANCHOR SECTION */}
            <section className="py-32 px-6 sm:px-12 xl:px-24 bg-[#14141B]">
                <div className="max-w-3xl mx-auto text-center content-section">
                    <h2 className="text-sm font-['JetBrains_Mono'] text-[#C9A84C] mb-6 uppercase tracking-wider">Why This Is Different</h2>
                    <h3 className="text-3xl sm:text-4xl font-['Playfair_Display'] italic mb-10 leading-snug">
                        Most buyers spend <br className="sm:hidden" />20–40 hours researching <br className="hidden sm:block" />and still feel uncertain.
                    </h3>
                    <p className="text-lg text-[#FAF8F5]/70 leading-relaxed mb-6">
                        This guide compresses that learning into a structured framework you can apply immediately.
                    </p>
                    <p className="text-lg text-[#FAF8F5]/70 leading-relaxed">
                        It captures the same decision methodology used inside Autolitics Studio advisory engagements — translated into a clear, self-directed format.
                    </p>
                </div>
            </section>

            <div className="max-w-4xl mx-auto w-full h-px bg-gradient-to-r from-transparent via-[#C9A84C]/20 to-transparent" />

            {/* CONTENT STRUCTURE SECTION */}
            <section className="py-24 px-6 sm:px-12 xl:px-24">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    <div className="content-section">
                        <h2 className="text-4xl sm:text-5xl font-['Playfair_Display'] italic mb-12">
                            Inside The Guide
                        </h2>

                        <div className="space-y-10">
                            {chapters.map((chapter, i) => (
                                <div key={i} className="relative pl-8">
                                    <div className="absolute left-0 top-0 bottom-0 w-px bg-[#2A2A35]" />
                                    <div className="absolute left-[-4px] top-2 w-2 h-2 rounded-full bg-[#C9A84C]" />

                                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-3">
                                        <span className="font-['Playfair_Display'] italic text-[#C9A84C] text-2xl w-6">{chapter.num}</span>
                                        <span className="text-white/40 font-light">—</span>
                                        {chapter.title}
                                    </h3>
                                    <ul className="space-y-3 text-[#FAF8F5]/60">
                                        {chapter.items.map((item, j) => (
                                            <li key={j} className="flex items-start gap-3">
                                                <span className="text-[#C9A84C] mt-1 text-xs opacity-80 shrink-0">•</span>
                                                <span className="leading-relaxed">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="content-section lg:sticky lg:top-32 space-y-8">
                        {/* Fixed broken unsplash link with a dark architectural abstract image */}
                        <div className="aspect-[4/3] rounded-[2rem] overflow-hidden border border-[#2A2A35] relative group cursor-pointer">
                            <img
                                src="https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=2874&auto=format&fit=crop"
                                alt="Abstract structure"
                                className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#0D0D12] to-transparent opacity-60" />

                            <div className="absolute bottom-6 left-6 right-6 backdrop-blur-md bg-[#1A1A1A]/80 border border-white/5 rounded-2xl p-4 flex items-center gap-4 group-hover:bg-[#1A1A1A] transition-colors">
                                <BookOpen className="w-8 h-8 text-[#C9A84C] shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold">Preview a Sample Page</p>
                                    <p className="text-xs text-white/50">Click to view snapshot</p>
                                </div>
                            </div>
                        </div>

                        {/* SPECIFIC DELIVERABLES */}
                        <div className="bg-[#1A1A24] border border-[#2A2A35] rounded-[2rem] p-8 shadow-xl">
                            <h3 className="text-2xl font-semibold mb-6">What You Receive</h3>
                            <ul className="space-y-4">
                                {[
                                    "Full digital guide (45 pages)",
                                    "Printable Test Drive Scorecard",
                                    "Offer Evaluation Template",
                                    "Vehicle Comparison Matrix",
                                    "Negotiation Preparation Notes",
                                    "Quick Reference Glossary"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-[#FAF8F5]/80">
                                        <FileText className="w-5 h-5 text-[#C9A84C] flex-shrink-0" />
                                        <span className="font-light">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* PRICING BLOCK UPDATE */}
            <section className="py-24 px-6 sm:px-12 xl:px-24 bg-[#14141B]">
                <div className="max-w-3xl mx-auto" ref={pricingRef}>
                    <div className="bg-[#1A1A24] border border-[#C9A84C]/30 p-8 sm:p-12 rounded-[3rem] text-center relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <ShieldCheck className="w-64 h-64" />
                        </div>

                        <div className="relative z-10">
                            <h2 className="text-3xl sm:text-4xl font-semibold mb-4">Digital Access</h2>

                            <div className="flex items-center justify-center gap-2 mb-2">
                                <span className="text-6xl font-bold">$149</span>
                            </div>
                            <p className="text-[#FAF8F5]/60 font-medium mb-10 text-lg">One-time payment. No subscription.</p>

                            <a href={stripeLink} className="inline-flex w-full sm:w-auto group relative overflow-hidden bg-[#C9A84C] text-[#0D0D12] py-4 px-12 rounded-full font-bold text-lg transition-transform duration-300 shadow-[0_4px_20px_rgba(201,168,76,0.3)] hover:scale-[1.03] active:scale-95 items-center justify-center gap-2 mb-6">
                                <span className="relative z-10 flex items-center gap-2">
                                    Secure Your Copy
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </a>

                            <div className="flex flex-col items-center gap-2">
                                <p className="text-sm text-[#FAF8F5]/50 font-['JetBrains_Mono']">
                                    Instant digital access. Lifetime updates included.
                                </p>
                                <div className="flex items-center gap-2 text-xs text-[#FAF8F5]/40 mt-2">
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>Secure checkout powered by Stripe</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-24 px-6 sm:px-12 xl:px-24">
                <div className="max-w-3xl mx-auto content-section">
                    <h2 className="text-3xl sm:text-4xl font-['Playfair_Display'] italic mb-12 text-center">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <FAQItem key={i} question={faq.q} answer={faq.a} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ADVISORY BRIDGE */}
            <section className="py-24 px-6 sm:px-12 xl:px-24 border-t border-[#2A2A35]/30">
                <div className="max-w-2xl mx-auto text-center content-section">
                    <h2 className="text-2xl font-semibold mb-6">Want This Applied to Your Specific Situation?</h2>
                    <p className="text-[#FAF8F5]/60 mb-10 leading-relaxed">
                        If you'd prefer tailored guidance, Autolitics Studio offers structured 1:1 advisory engagements to handle your strategy directly.
                    </p>
                    <Link to="/start" className="inline-flex border border-[#2A2A35] hover:border-[#C9A84C]/50 bg-[#1A1A24] text-[#FAF8F5] py-3.5 px-8 rounded-full font-medium transition-colors duration-300">
                        Schedule a Strategy Session
                    </Link>
                </div>
            </section>

            <Footer />

            {/* MOBILE STICKY CTA */}
            <div className="sm:hidden fixed bottom-6 left-6 right-6 z-50 animate-fade-in-up">
                <a href={stripeLink} className="flex justify-center items-center gap-2 w-full bg-[#C9A84C] text-[#0D0D12] py-4 rounded-full font-bold shadow-[0_10px_30px_rgba(0,0,0,0.5)] active:scale-95 transition-transform">
                    Buy the Guide
                </a>
            </div>

            <style>{`
                .animate-fade-in-up {
                    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    opacity: 0;
                    transform: translateY(20px);
                }
                @keyframes fadeInUp {
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default Guide;
