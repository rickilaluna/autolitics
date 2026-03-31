import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { setOfferReviewPrefill } from '../../lib/offerPrefill';

const OFFER_PATH = '/dashboard/my-search/offer';

/**
 * @param {'dark' | 'light'} variant
 * @param {object} [prefill] — passed to setOfferReviewPrefill when CTA clicked
 * @param {string} [className]
 */
export default function ExpertReviewUpsellCard({ variant = 'dark', prefill = null, className = '' }) {
    const { user } = useAuth();

    const loginHref = `/login?redirect=${encodeURIComponent(OFFER_PATH)}`;

    const handlePrefill = () => {
        if (prefill) setOfferReviewPrefill(prefill);
    };

    const isDark = variant === 'dark';
    const box = isDark
        ? 'bg-[#C9A84C]/[0.07] border-[#C9A84C]/25'
        : 'bg-[#FAF8F5] border-[#C9A84C]/30';
    const title = isDark ? 'text-[#FAF8F5]/95' : 'text-[#0D0D12]';
    const body = isDark ? 'text-[#FAF8F5]/60' : 'text-[#0D0D12]/65';
    const accent = 'text-[#C9A84C]';

    const CtaInner = () => (
        <>
            <span>Expert review with Core Advisory</span>
            <ArrowRight size={16} className="opacity-80" />
        </>
    );

    return (
        <div className={`rounded-2xl border p-6 ${box} ${className}`}>
            <div className="flex gap-4">
                <div
                    className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${
                        isDark ? 'bg-[#C9A84C]/15 border border-[#C9A84C]/25' : 'bg-white border border-[#C9A84C]/20'
                    }`}
                >
                    <Sparkles size={20} className={accent} />
                </div>
                <div className="min-w-0 flex-1">
                    <h4 className={`text-sm font-semibold mb-2 ${title}`}>Want a line-by-line read before you sign?</h4>
                    <p className={`text-sm leading-relaxed mb-4 ${body}`}>
                        These tools help you see structure and variance on your own.{' '}
                        <span className={accent}>Core Advisory</span> adds an experienced review of the buyer&apos;s order,
                        fee stack, and negotiation angles — so you are not interpreting numbers alone.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        {user ? (
                            <Link
                                to={OFFER_PATH}
                                onClick={handlePrefill}
                                className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors ${
                                    isDark
                                        ? 'bg-[#C9A84C] text-[#0D0D12] hover:opacity-90'
                                        : 'bg-[#0D0D12] text-white hover:bg-[#1A1A24]'
                                }`}
                            >
                                <CtaInner />
                            </Link>
                        ) : (
                            <Link
                                to={loginHref}
                                onClick={handlePrefill}
                                className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors ${
                                    isDark
                                        ? 'bg-[#C9A84C] text-[#0D0D12] hover:opacity-90'
                                        : 'bg-[#0D0D12] text-white hover:bg-[#1A1A24]'
                                }`}
                            >
                                <CtaInner />
                            </Link>
                        )}
                        <Link
                            to="/core-advisory"
                            className={`inline-flex items-center text-sm font-medium ${accent} hover:underline`}
                        >
                            Learn about Core Advisory
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
