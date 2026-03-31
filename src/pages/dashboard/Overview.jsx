import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    ShieldCheck,
    Calendar,
    CarFront,
    MessagesSquare,
    FileSignature,
    Loader2,
    Target,
    Clock,
    KeySquare,
    CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePurchases } from '../../hooks/usePurchases';
import { useClientProfile } from '../../hooks/useClientProfile';
import { useJourneyStatus } from '../../hooks/useJourneyStatus';
import { PHASE_RESOURCES } from '../../data/dashboardResourceCatalog';
import ResourceHubCrosslinks from '../../components/dashboard/ResourceHubCrosslinks';
import OnboardingModal from './OnboardingModal';
import { getConsideringModelStrings } from '../../lib/vehicleContextStorage';

const PHASES = [
    { num: 1, label: 'Setup', short: 'Profile' },
    { num: 2, label: 'Strategy', short: 'Research' },
    { num: 3, label: 'Evaluate', short: 'Test Drive' },
    { num: 4, label: 'Negotiate', short: 'Close' },
];

const ProgressStepper = ({ currentPhase }) => (
    <div className="bg-white border border-[#0D0D12]/10 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
            {PHASES.map((phase, idx) => {
                const isComplete = currentPhase > phase.num;
                const isCurrent = currentPhase === phase.num;
                return (
                    <React.Fragment key={phase.num}>
                        <div className="flex flex-col items-center gap-2 min-w-0">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                                isComplete
                                    ? 'bg-[#C9A84C] text-white'
                                    : isCurrent
                                        ? 'bg-[#0D0D12] text-white'
                                        : 'bg-[#0D0D12]/5 text-[#0D0D12]/30'
                            }`}>
                                {isComplete ? (
                                    <CheckCircle2 size={18} />
                                ) : (
                                    <span className="text-sm font-bold">{phase.num}</span>
                                )}
                            </div>
                            <div className="text-center">
                                <p className={`text-xs font-semibold uppercase tracking-wider ${
                                    isCurrent ? 'text-[#0D0D12]' : isComplete ? 'text-[#C9A84C]' : 'text-[#0D0D12]/30'
                                }`}>{phase.label}</p>
                                <p className="text-[10px] text-[#0D0D12]/40 font-['JetBrains_Mono'] hidden sm:block">{phase.short}</p>
                            </div>
                        </div>
                        {idx < PHASES.length - 1 && (
                            <div className={`flex-1 h-px mx-2 sm:mx-4 ${
                                currentPhase > phase.num ? 'bg-[#C9A84C]' : 'bg-[#0D0D12]/10'
                            }`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    </div>
);

const NextStepCard = ({ nextStep, onOpenOnboarding }) => {
    if (!nextStep) return null;

    return (
        <div className="bg-[#FAF8F5] border border-[#C9A84C]/30 rounded-[2rem] p-8 shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A84C]/5 rounded-bl-[100px] pointer-events-none" />
            <h3 className="text-xs font-['JetBrains_Mono'] text-[#C9A84C] uppercase tracking-widest mb-4">Recommended Next Step</h3>
            <h2 className="text-xl font-semibold mb-2">{nextStep.label}</h2>
            <p className="text-[#0D0D12]/70 max-w-2xl mb-6">{nextStep.description}</p>
            {nextStep.action === 'onboarding' ? (
                <button
                    onClick={onOpenOnboarding}
                    className="inline-flex font-medium text-[#0D0D12] hover:text-[#C9A84C] transition-colors items-center gap-2 group"
                >
                    Get Started <ArrowRight size={16} className="group-hover:translate-x-1 duration-300" />
                </button>
            ) : nextStep.link ? (
                <Link
                    to={nextStep.link}
                    className="inline-flex font-medium text-[#0D0D12] hover:text-[#C9A84C] transition-colors items-center gap-2 group"
                >
                    {nextStep.linkLabel} <ArrowRight size={16} className="group-hover:translate-x-1 duration-300" />
                </Link>
            ) : null}
        </div>
    );
};

const Overview = () => {
    const { user } = useAuth();
    const { loading: purchaseLoading, hasPurchasedAdvisory } = usePurchases();
    const { profile, loading: profileLoading, updateProfile } = useClientProfile();
    const [showOnboarding, setShowOnboarding] = useState(false);

    const { loading: journeyLoading, currentPhase, nextStep } = useJourneyStatus({
        profile,
        hasPurchasedAdvisory,
    });

    if (purchaseLoading || profileLoading || journeyLoading) {
        return (
            <div className="flex flex-col h-[400px] items-center justify-center text-[#0D0D12]/50 font-['JetBrains_Mono'] gap-4">
                <Loader2 className="w-8 h-8 text-[#C9A84C] animate-spin" />
                Loading mission control...
            </div>
        );
    }

    const isProfileComplete = profile && profile.buying_timeline && profile.primary_goal;
    const hasActiveShortlist = profile?.active_shortlist && profile.active_shortlist.length > 0;

    const mergedConsideringModels = (() => {
        const fromProfile = profile?.active_shortlist || [];
        const fromTools = getConsideringModelStrings();
        const set = new Set();
        [...fromProfile, ...fromTools].forEach((s) => {
            const t = (s || '').trim();
            if (t) set.add(t);
        });
        return [...set];
    })();

    const handleOpenOnboarding = () => setShowOnboarding(true);

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <header className="mb-2">
                <h1 className="text-3xl font-semibold tracking-tight text-[#0D0D12] mb-2">
                    Welcome back, {user?.user_metadata?.first_name || 'Client'}.
                </h1>
                <p className="text-[#0D0D12]/60 max-w-2xl">
                    This is your vehicle search command center.
                </p>
            </header>

            {/* Progress Stepper */}
            {isProfileComplete && <ProgressStepper currentPhase={currentPhase} />}

            {/* Advisory Status Banner */}
            {hasPurchasedAdvisory && isProfileComplete && (
                <div className="bg-white border border-[#0D0D12]/10 rounded-[2rem] p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <ShieldCheck className="text-[#C9A84C]" size={24} />
                                <h2 className="text-2xl font-semibold">Active Advisory</h2>
                                <span className="px-3 py-1 bg-[#C9A84C]/10 text-[#C9A84C] rounded-full text-xs font-bold uppercase tracking-wider">
                                    {PHASES.find(p => p.num === currentPhase)?.label || 'Active'}
                                </span>
                            </div>
                            <p className="text-[#0D0D12]/60 max-w-xl text-sm">Your advisor is with you at every step. Review your strategy or book a call.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link to="/dashboard/strategy-brief" className="inline-flex justify-center bg-[#0D0D12] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#1A1A24] transition-colors items-center gap-2">
                                Open My Strategy
                            </Link>
                            <a href="mailto:rickilaluna@gmail.com?subject=Advisory Call" className="inline-flex justify-center bg-[#FAF8F5] border border-[#0D0D12]/10 text-[#0D0D12] px-6 py-3 rounded-xl text-sm font-medium hover:bg-white transition-colors items-center gap-2">
                                <Calendar size={16} /> Book Call
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Expert Coaching Promo (non-advisory, profile complete) */}
            {!hasPurchasedAdvisory && isProfileComplete && (
                <div className="bg-white border text-left border-[#0D0D12]/10 rounded-[2rem] p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="bg-[#0D0D12]/5 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                            <ShieldCheck size={20} className="text-[#0D0D12]" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Expert Coaching Available</h2>
                        <p className="text-[#0D0D12]/60 max-w-xl text-sm">
                            Want to guarantee you don't overpay? Our 1:1 advisory embeds a strategist in your corner through the entire negotiation.
                        </p>
                    </div>
                    <Link to="/start" className="inline-flex bg-[#0D0D12] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#1A1A24] transition-colors items-center gap-2 shrink-0">
                        Learn About Advisory
                    </Link>
                </div>
            )}

            {/* Dynamic Next Step */}
            <NextStepCard nextStep={nextStep} onOpenOnboarding={handleOpenOnboarding} />

            {/* Profile Context Bar */}
            {isProfileComplete && (
                <div className="bg-[#0D0D12] rounded-[2rem] p-6 text-white text-sm grid grid-cols-1 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-white/10">
                    <div className="flex items-center gap-4 px-4">
                        <Target className="text-[#C9A84C] shrink-0" size={24} />
                        <div>
                            <p className="text-white/50 text-xs font-['JetBrains_Mono'] uppercase tracking-wider mb-1">Target Priority</p>
                            <p className="font-semibold">{profile.primary_goal}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 px-4 pt-4 md:pt-0">
                        <Clock className="text-[#C9A84C] shrink-0" size={24} />
                        <div>
                            <p className="text-white/50 text-xs font-['JetBrains_Mono'] uppercase tracking-wider mb-1">Buying Timeline</p>
                            <p className="font-semibold text-white/90">{profile.buying_timeline}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 px-4 pt-4 md:pt-0">
                        <KeySquare className="text-[#C9A84C] shrink-0" size={24} />
                        <div>
                            <p className="text-white/50 text-xs font-['JetBrains_Mono'] uppercase tracking-wider mb-1">Trade-In Status</p>
                            <p className="font-semibold text-white/90">{profile.trade_in_status || 'None'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 pt-4 md:pt-0">
                        <button onClick={handleOpenOnboarding} className="text-[#C9A84C] hover:text-white transition-colors text-xs font-['JetBrains_Mono'] underline uppercase tracking-wider">
                            Edit Profile
                        </button>
                    </div>
                </div>
            )}

            {/* Target Vehicles / Context */}
            {isProfileComplete && (
                <div>
                    <h3 className="text-xl font-semibold tracking-tight text-[#0D0D12] mb-4">Active Shortlist</h3>
                    {hasActiveShortlist ? (
                        <div className="flex flex-wrap gap-3">
                            {profile.active_shortlist.map((car, idx) => (
                                <div key={idx} className="bg-white border border-[#0D0D12]/20 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2">
                                    <CarFront size={16} className="text-[#0D0D12]/50" />
                                    {car}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-[#FAF8F5] border border-[#0D0D12]/10 rounded-xl p-4 text-sm font-['JetBrains_Mono'] text-[#0D0D12]/50">
                            No vehicles added to shortlist yet. Use Edit Profile to add targets, or add models in the Decision Engine — they sync here on this device.
                        </div>
                    )}
                </div>
            )}

            {isProfileComplete && mergedConsideringModels.length > 0 && (
                <div className="bg-white border border-[#0D0D12]/10 rounded-[2rem] p-8 shadow-sm">
                    <h3 className="text-sm font-['JetBrains_Mono'] text-[#0D0D12]/40 uppercase tracking-widest mb-2">Models considering</h3>
                    <p className="text-sm text-[#0D0D12]/55 mb-4 max-w-2xl">
                        Union of your profile shortlist and vehicles you&apos;ve typed in the Decision Engine, OTD checker, and offer comparison on this browser.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-5">
                        {mergedConsideringModels.map((car) => (
                            <div
                                key={car}
                                className="bg-[#FAF8F5] border border-[#0D0D12]/15 px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2"
                            >
                                <CarFront size={16} className="text-[#C9A84C]" />
                                {car}
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                        <Link to="/resources/vehicle-comparison-matrix" className="font-medium text-[#C9A84C] hover:text-[#0D0D12] transition-colors">
                            Vehicle Decision Engine →
                        </Link>
                        <Link to="/resources/out-the-door-calculator" className="font-medium text-[#C9A84C] hover:text-[#0D0D12] transition-colors">
                            OTD Price Checker →
                        </Link>
                        <Link to="/resources/dealer-offer-comparison" className="font-medium text-[#C9A84C] hover:text-[#0D0D12] transition-colors">
                            Offer comparison →
                        </Link>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div>
                <h3 className="text-sm font-['JetBrains_Mono'] text-[#0D0D12]/40 uppercase tracking-widest mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Link to="/dashboard/my-search/listing" className="p-5 bg-white border border-[#0D0D12]/10 rounded-2xl hover:border-[#C9A84C]/50 transition-colors group">
                        <CarFront className="text-[#0D0D12] mb-3 group-hover:text-[#C9A84C] transition-colors" size={20} />
                        <h3 className="font-semibold text-sm mb-1">Submit Listing</h3>
                        <p className="text-xs text-[#0D0D12]/50 line-clamp-2">Vet a listing before visiting.</p>
                    </Link>
                    <Link to="/dashboard/my-search/test-drive" className="p-5 bg-white border border-[#0D0D12]/10 rounded-2xl hover:border-[#C9A84C]/50 transition-colors group">
                        <MessagesSquare className="text-[#0D0D12] mb-3 group-hover:text-[#C9A84C] transition-colors" size={20} />
                        <h3 className="font-semibold text-sm mb-1">Log Test Drive</h3>
                        <p className="text-xs text-[#0D0D12]/50 line-clamp-2">Record reactions post-drive.</p>
                    </Link>
                    <Link to="/dashboard/my-search/offer" className="p-5 bg-white border border-[#0D0D12]/10 rounded-2xl hover:border-[#C9A84C]/50 transition-colors group">
                        <FileSignature className="text-[#0D0D12] mb-3 group-hover:text-[#C9A84C] transition-colors" size={20} />
                        <h3 className="font-semibold text-sm mb-1">Review Offer</h3>
                        <p className="text-xs text-[#0D0D12]/50 line-clamp-2">Verify quote structures.</p>
                    </Link>
                </div>
            </div>

            {/* Full toolkit strip — same IP as Resources hub */}
            {isProfileComplete && (
                <ResourceHubCrosslinks variant="compact" emphasizePhase={nextStep?.resourcePhase || null} />
            )}

            {/* Phase-relevant Resources */}
            {isProfileComplete && nextStep?.resourcePhase && PHASE_RESOURCES[nextStep.resourcePhase] && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-['JetBrains_Mono'] text-[#0D0D12]/40 uppercase tracking-widest mb-1">Relevant Resources</h3>
                            <p className="text-xs text-[#0D0D12]/40">{PHASE_RESOURCES[nextStep.resourcePhase].description}</p>
                        </div>
                        <Link to="/dashboard/resources" className="text-xs font-medium text-[#C9A84C] hover:text-[#0D0D12] transition-colors flex items-center gap-1">
                            View All <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {PHASE_RESOURCES[nextStep.resourcePhase].items.map((resource) => {
                            const Icon = resource.icon;
                            return (
                                <Link key={resource.id} to={resource.to}
                                    className="flex items-start gap-4 p-5 bg-white border border-[#0D0D12]/10 rounded-2xl hover:border-[#C9A84C]/50 transition-colors group">
                                    <div className="h-10 w-10 bg-[#0D0D12]/5 rounded-xl flex items-center justify-center shrink-0 text-[#0D0D12] group-hover:bg-[#C9A84C]/10 group-hover:text-[#C9A84C] transition-colors">
                                        <Icon size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-semibold text-sm mb-0.5">{resource.title}</h4>
                                        <p className="text-xs text-[#0D0D12]/50 line-clamp-2">{resource.description}</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Modals */}
            {showOnboarding && (
                <OnboardingModal
                    profile={profile}
                    onClose={() => setShowOnboarding(false)}
                    onSave={(updates) => {
                        updateProfile(updates);
                        setShowOnboarding(false);
                    }}
                />
            )}
        </div>
    );
};

export default Overview;
