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

import GlobalJourneyTracker from '../../components/dashboard/GlobalJourneyTracker';
import WorkspaceActivityModule from '../../components/dashboard/WorkspaceActivityModule';
import VehiclePreviewModal from '../../components/dashboard/VehiclePreviewModal';
import OnboardingModal from './OnboardingModal';
import { getConsideringModelStrings } from '../../lib/vehicleContextStorage';



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
    const { profile, loading: profileLoading, updateProfile, toggleTaskCompletion } = useClientProfile();
    const [profileSaveError, setProfileSaveError] = useState(null);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [previewVehicle, setPreviewVehicle] = useState(null);

    const { loading: journeyLoading, currentPhase, nextStep, counts, workspace } = useJourneyStatus({
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
    
    const completedTasks = Array.isArray(profile?.completed_journey_tasks) ? profile.completed_journey_tasks : [];
    const hasHadIntroCall = completedTasks.includes('c_intro');
    const hasReviewedStrategy = completedTasks.includes('c_strategy');

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

    const displayFirstName =
        (profile?.primary_contact_name || '').trim().split(/\s+/)[0] ||
        user?.user_metadata?.first_name ||
        'Client';

    const deliverableCount = counts?.deliverables ?? 0;
    const briefReadyForPortal =
        deliverableCount > 0 ||
        !!profile?.advisory_strategy_brief_at;

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <header className="mb-2">
                <h1 className="text-3xl font-semibold tracking-tight text-[#0D0D12] mb-2">
                    Welcome back, {displayFirstName}.
                </h1>
                <p className="text-[#0D0D12]/60 max-w-2xl">
                    {hasPurchasedAdvisory
                        ? 'This is your advisory command center. Manage your active vehicle search, access your strategy, and use curated resources.'
                        : 'This is your vehicle search command center.'}
                </p>
            </header>

            {/* Global Journey Progress Tracker */}
            {isProfileComplete && <GlobalJourneyTracker variant="expanded" />}

            {/* Advisory Status Banner */}
            {hasPurchasedAdvisory && isProfileComplete && (
                <div className="bg-white border border-[#0D0D12]/10 rounded-[2rem] p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <ShieldCheck className="text-[#C9A84C]" size={24} />
                                <h2 className="text-2xl font-semibold">Active Advisory</h2>
                                <span className="px-3 py-1 bg-[#C9A84C]/10 text-[#C9A84C] rounded-full text-xs font-bold uppercase tracking-wider">
                                    {['Discover', 'Evaluate', 'Compare Offers', 'Decision & Purchase'][currentPhase - 1] || 'Active'}
                                </span>
                            </div>
                            <p className="text-[#0D0D12]/60 max-w-xl text-sm">
                                {briefReadyForPortal
                                    ? 'Your custom vehicle strategy brief is ready for review. Read through the strategy and mark it reviewed when you are ready to proceed.'
                                    : hasHadIntroCall 
                                        ? 'Your engagement has started. We are assembling your custom strategy brief and will publish it here soon.' 
                                        : 'We are onboarding your engagement. Schedule your intro call to begin, and your advisor will publish your strategy brief here when it is ready.'}
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            {briefReadyForPortal ? (
                                <>
                                    <Link to="/dashboard/strategy-brief" className="inline-flex justify-center bg-[#0D0D12] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#1A1A24] transition-colors items-center gap-2">
                                        Open Strategy Brief
                                    </Link>
                                    <button 
                                        onClick={() => toggleTaskCompletion && toggleTaskCompletion('c_strategy')} 
                                        className={`inline-flex justify-center px-6 py-3 rounded-xl text-sm font-medium transition-colors items-center gap-2 ${hasReviewedStrategy ? 'bg-[#C9A84C]/10 text-[#C9A84C]' : 'bg-[#FAF8F5] border border-[#0D0D12]/10 text-[#0D0D12] hover:bg-white'}`}
                                    >
                                        {hasReviewedStrategy ? 'Reviewed ✓' : 'Mark Reviewed'}
                                    </button>
                                    {!hasHadIntroCall && (
                                        <a href="mailto:rickilaluna@gmail.com?subject=Advisory%20Call" className="inline-flex justify-center bg-[#FAF8F5] border border-[#0D0D12]/10 text-[#0D0D12] px-6 py-3 rounded-xl text-sm font-medium hover:bg-white transition-colors items-center gap-2">
                                            <Calendar size={16} /> Schedule Call
                                        </a>
                                    )}
                                </>
                            ) : (
                                <>
                                    {!hasHadIntroCall && (
                                        <Link to="/book" className="inline-flex justify-center bg-[#0D0D12] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#1A1A24] transition-colors items-center gap-2">
                                            <Calendar size={16} /> Schedule Intro Call
                                        </Link>
                                    )}
                                    <a href="mailto:rickilaluna@gmail.com?subject=Advisory%20question" className="inline-flex justify-center bg-[#FAF8F5] border border-[#0D0D12]/10 text-[#0D0D12] px-6 py-3 rounded-xl text-sm font-medium hover:bg-white transition-colors items-center gap-2">
                                        Email advisor
                                    </a>
                                </>
                            )}
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
                <div className="bg-white border border-[#0D0D12]/10 rounded-[2rem] p-6 shadow-sm mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold tracking-tight text-[#0D0D12]">Your Target Vehicles</h3>
                    </div>

                    <div className="space-y-6">
                        {/* Profile Shortlist */}
                        <div>
                            <h4 className="text-xs font-['JetBrains_Mono'] text-[#0D0D12]/40 uppercase tracking-widest mb-3">Profile Targets</h4>
                            {hasActiveShortlist ? (
                                <div className="flex flex-wrap gap-2">
                                    {profile.active_shortlist.map((car, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setPreviewVehicle(car)}
                                            className="bg-[#FAF8F5] border border-[#0D0D12]/10 px-3 py-1.5 rounded-lg font-medium text-sm flex items-center gap-2 text-[#0D0D12] hover:border-[#C9A84C]/50 hover:bg-[#C9A84C]/5 transition-colors cursor-pointer text-left"
                                        >
                                            <CarFront size={14} className="text-[#0D0D12]/50" />
                                            {car}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-[#0D0D12]/50">No initial targets defined in your profile. Use Edit Profile to add them.</p>
                            )}
                        </div>

                        {/* Local Workspace Considerations */}
                        {mergedConsideringModels.length > 0 && (
                            <div className="pt-5 border-t border-[#0D0D12]/5">
                                <h4 className="text-xs font-['JetBrains_Mono'] text-[#0D0D12]/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    Workspace Activity
                                    <span className="bg-[#C9A84C]/10 text-[#C9A84C] text-[10px] px-2 py-0.5 rounded-full lowercase tracking-normal font-sans">auto-synced</span>
                                </h4>
                                <p className="text-xs text-[#0D0D12]/50 mb-3 max-w-xl">
                                    Vehicles you are actively exploring in the Decision Engine, Scorecard, and OTD Calculator on this device.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {mergedConsideringModels.map((car) => (
                                        <button
                                            key={car}
                                            type="button"
                                            onClick={() => setPreviewVehicle(car)}
                                            className="bg-white border border-[#C9A84C]/30 px-3 py-1.5 rounded-lg font-medium text-sm flex items-center gap-2 shadow-sm text-[#0D0D12] hover:border-[#C9A84C]/60 hover:bg-[#C9A84C]/5 transition-colors cursor-pointer text-left"
                                        >
                                            <CarFront size={14} className="text-[#C9A84C]" />
                                            {car}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Your Saved Workspace — dynamic local storage artifacts */}
            {isProfileComplete && workspace && (
                <WorkspaceActivityModule workspace={workspace} />
            )}

            {/* Modules moved inside GlobalJourneyTracker */}

            {/* Modals */}
            {showOnboarding && (
                <OnboardingModal
                    profile={profile}
                    onClose={() => setShowOnboarding(false)}
                    onSave={async (updates) => {
                        setProfileSaveError(null);
                        const result = await updateProfile(updates);
                        if (result?.error) {
                            setProfileSaveError(result.error);
                            return;
                        }
                        setShowOnboarding(false);
                    }}
                />
            )}
            {previewVehicle && (
                <VehiclePreviewModal vehicleName={previewVehicle} onClose={() => setPreviewVehicle(null)} />
            )}
            {profileSaveError && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] max-w-md w-[calc(100%-2rem)] bg-red-500/15 border border-red-500/40 text-red-800 px-4 py-3 rounded-xl text-sm font-['JetBrains_Mono'] shadow-lg">
                    Could not save profile: {profileSaveError}
                </div>
            )}
        </div>
    );
};

export default Overview;
