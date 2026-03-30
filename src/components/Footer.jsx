import React, { useState } from 'react';
import LegalModal from './LegalModal';

const PRIVACY_POLICY_CONTENT = (
    <div className="space-y-4">
        <p><strong>Effective Date:</strong> January 1, 2026</p>
        <p>Autolitics Studio ("we," "our," or "us") respects your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our website or advisory services.</p>
        <h4 className="font-bold text-primary mt-4 text-base">1. Information We Collect</h4>
        <p>We may collect personal information such as your name, email address, phone number, vehicle preferences, and budget when you schedule an intro call, start a Core Advisory, or communicate with us.</p>
        <h4 className="font-bold text-primary mt-4 text-base">2. How We Use Your Information</h4>
        <p>We use your information exclusively to provide our independent car buying advisory services to you, to communicate with you about your vehicle search, and to process payments.</p>
        <h4 className="font-bold text-primary mt-4 text-base">3. Information Sharing</h4>
        <p>We do not sell, rent, or share your personal information with third parties (including dealerships) for their marketing purposes. We operate entirely independently of any dealer or manufacturer.</p>
        <h4 className="font-bold text-primary mt-4 text-base">4. Data Security</h4>
        <p>We implement reasonable security measures to protect your personal information. However, no electronic transmission or storage is 100% secure.</p>
        <h4 className="font-bold text-primary mt-4 text-base">5. Contact Us</h4>
        <p>If you have any questions about this Privacy Policy, please contact us at ricki@autolitics.com.</p>
    </div>
);

const TERMS_OF_SERVICE_CONTENT = (
    <div className="space-y-4">
        <p><strong>Effective Date:</strong> January 1, 2026</p>
        <p>Welcome to Autolitics Studio. By accessing our website or using our services, you agree to these Terms of Service.</p>
        <h4 className="font-bold text-primary mt-4 text-base">1. Our Services</h4>
        <p>Autolitics Studio provides independent car buying advisory and consulting services. We do not sell vehicles, and we are not a broker or dealership. All vehicle purchases resulting from our guidance are between you and the respective seller or dealership.</p>
        <h4 className="font-bold text-primary mt-4 text-base">2. Payment and Fees</h4>
        <p>Our Core Advisory is offered for a flat fee. Payment must be made before the kickoff of the deep-dive discovery session. Fees are generally non-refundable once the discovery session has commenced.</p>
        <h4 className="font-bold text-primary mt-4 text-base">3. No Guarantee of Purchase</h4>
        <p>While we provide expert strategy, vehicle shortlists, and offer guidance, we do not guarantee vehicle availability, financing approval, or the final terms of any purchase or lease you choose to sign.</p>
        <h4 className="font-bold text-primary mt-4 text-base">4. Limitation of Liability</h4>
        <p>To the maximum extent permitted by law, Autolitics Studio shall not be liable for any indirect, incidental, or consequential damages arising from your use of our services or your subsequent vehicle purchase.</p>
        <h4 className="font-bold text-primary mt-4 text-base">5. Contact Us</h4>
        <p>If you have any questions about these Terms of Service, please contact us at ricki@autolitics.com.</p>
    </div>
);

export default function Footer() {
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', content: null });

    const openModal = (title, content, e) => {
        e.preventDefault();
        setModalConfig({ isOpen: true, title, content });
    };

    const closeModal = () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <>
            <footer className="bg-[#050508] text-ivory pt-24 pb-12 px-6 rounded-t-[4rem] mt-[-4rem] relative z-20 border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-24">
                        {/* Brand Col */}
                        <div className="md:col-span-5 lg:col-span-4">
                            <h2 className="text-2xl font-sans font-bold tracking-tight mb-4">Autolitics Studio</h2>
                            <p className="text-ivory/60 font-mono text-sm leading-relaxed max-w-xs mb-8">
                                Independent Car Buying Advisor
                            </p>
                            <a href="https://id-preview--75fe0aff-f41e-4422-bca1-a702a50ab2a4.lovable.app/book" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-accent font-bold hover:text-white transition-colors group">
                                Book a Free Intro Call
                                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </a>
                        </div>

                        {/* Nav Cols */}
                        <div className="md:col-span-7 lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
                            <div>
                                <h3 className="font-mono text-xs text-ivory/40 uppercase tracking-widest mb-6">Navigation</h3>
                                <ul className="space-y-4 text-sm text-ivory/70">
                                    <li><a href="#features" className="hover:text-accent transition-colors">Methodology</a></li>
                                    <li><a href="#philosophy" className="hover:text-accent transition-colors">Philosophy</a></li>
                                    <li><a href="#protocol" className="hover:text-accent transition-colors">Process</a></li>
                                    <li><a href="#pricing" className="hover:text-accent transition-colors">Pricing</a></li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-mono text-xs text-ivory/40 uppercase tracking-widest mb-6">Legal</h3>
                                <ul className="space-y-4 text-sm text-ivory/70">
                                    <li><a href="#" onClick={(e) => openModal("Privacy Policy", PRIVACY_POLICY_CONTENT, e)} className="hover:text-accent transition-colors">Privacy Policy</a></li>
                                    <li><a href="#" onClick={(e) => openModal("Terms of Service", TERMS_OF_SERVICE_CONTENT, e)} className="hover:text-accent transition-colors">Terms of Service</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <p className="font-mono text-xs text-ivory/40">
                            © 2026 Autolitics Studio. All rights reserved.
                        </p>

                        {/* System Status */}
                        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                            <div className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                            </div>
                            <span className="font-mono text-[10px] text-ivory/60 uppercase tracking-wider">System Operational</span>
                        </div>
                    </div>
                </div>
            </footer>

            <LegalModal
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                title={modalConfig.title}
                content={modalConfig.content}
            />
        </>
    );
}
