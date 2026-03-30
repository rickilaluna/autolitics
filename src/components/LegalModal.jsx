import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { X } from 'lucide-react';

export default function LegalModal({ isOpen, onClose, title, content }) {
    const overlayRef = useRef(null);
    const modalRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
            gsap.fromTo(modalRef.current, { y: 20, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' });
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleClose = () => {
        gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, ease: 'power2.in' });
        gsap.to(modalRef.current, { y: 20, opacity: 0, scale: 0.95, duration: 0.3, ease: 'power3.in', onComplete: onClose });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            {/* Overlay */}
            <div ref={overlayRef} className="fixed inset-0 bg-primary/80 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={handleClose}></div>

            {/* Modal */}
            <div ref={modalRef} className="relative bg-background rounded-[2rem] w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl border border-text/10 flex flex-col">
                <div className="flex items-center justify-between px-6 py-5 border-b border-text/5 bg-white/50 backdrop-blur-md sticky top-0 z-10">
                    <h3 className="text-xl font-bold text-primary" id="modal-title">{title}</h3>
                    <button onClick={handleClose} className="p-2 rounded-full hover:bg-black/5 text-text/60 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-accent">
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto px-6 py-8 text-sm text-text/80 space-y-6">
                    {content}
                </div>

                <div className="px-6 py-4 border-t border-text/5 bg-text/5 flex justify-end">
                    <button onClick={handleClose} className="bg-primary text-white px-6 py-2 rounded-full font-bold text-sm tracking-wide hover:bg-primary/90 transition-colors shadow-sm focus:outline-none focus:ring-4 focus:ring-accent/30">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
