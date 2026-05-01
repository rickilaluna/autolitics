import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    Check,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Circle,
    Clock,
    PartyPopper,
    Sparkles,
    Target,
} from 'lucide-react';
import { BUYER_MISSION_PATH, STRATEGIC_CAR_BUYER_STAGES } from '../../data/strategicCarBuyerGuide';
import { useClientProfile } from '../../hooks/useClientProfile';
import { asArray, readBuyerMission } from '../../lib/buyerMissionStorage';
import { getWorkspaceActivity } from '../../lib/vehicleContextStorage';

const LOCAL_GUIDE_TASKS_KEY = 'autolitics_guide_completed_tasks_v1';

function readLocalTasks() {
    try {
        const raw = localStorage.getItem(LOCAL_GUIDE_TASKS_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
    } catch {
        return [];
    }
}

function writeLocalTasks(tasks) {
    try {
        localStorage.setItem(LOCAL_GUIDE_TASKS_KEY, JSON.stringify(tasks));
    } catch {}
}

function checkpointIsSystemComplete(checkpoint, { profile, workspace }) {
    if (!checkpoint.systemCheck) return false;
    if (checkpoint.systemCheck === 'profile') return !!(profile?.buying_timeline && profile?.primary_goal);
    if (checkpoint.systemCheck === 'decisionEngine') return (workspace?.decisionEngineCount || 0) >= 2;
    if (checkpoint.systemCheck === 'scorecard') return !!workspace?.hasScorecard;
    if (checkpoint.systemCheck === 'offers') return !!workspace?.hasOfferComparison;
    if (checkpoint.systemCheck === 'otd') return (workspace?.otdQuotes?.length || 0) > 0;
    return false;
}

function getStageProgress(stage, isComplete) {
    const done = stage.checkpoints.filter((cp) => isComplete(cp)).length;
    return { done, total: stage.checkpoints.length, pct: stage.checkpoints.length ? Math.round((done / stage.checkpoints.length) * 100) : 0 };
}

function formatBudget(val) {
    if (val == null) return null;
    if (val >= 1000) return `$${Math.round(val / 1000)}K`;
    return `$${val}`;
}

// Estimate completion time for tasks
const TASK_ESTIMATES = {
    guide_define_mission: '10 min',
    c_framework: '5 min read',
    c_playbook: '15 min read',
    guide_build_shortlist: '5 min',
    c_decision: '10 min',
    c_test_drive: '5 min per vehicle',
    guide_request_itemized_quotes: '10 min',
    c_otd: '5 min',
    c_offer_comp: '10 min',
    c_decision_final: '10 min',
    c_paperwork: '5 min review',
};

export default function StrategicCarBuyerGuide() {
    const { profile, toggleTaskCompletion } = useClientProfile();
    const [localTasks, setLocalTasks] = useState(() => readLocalTasks());
    const [workspace, setWorkspace] = useState(() => getWorkspaceActivity());
    const [localMission, setLocalMission] = useState(() => readBuyerMission());
    const [activeStageIndex, setActiveStageIndex] = useState(0);
    const [showOutcome, setShowOutcome] = useState(false);

    useEffect(() => {
        setWorkspace(getWorkspaceActivity());
        setLocalMission(readBuyerMission());
    }, []);

    const completedTasks = Array.isArray(profile?.completed_journey_tasks) ? profile.completed_journey_tasks : [];

    const isComplete = (checkpoint) =>
        checkpointIsSystemComplete(checkpoint, { profile, workspace }) ||
        completedTasks.includes(checkpoint.id) ||
        localTasks.includes(checkpoint.id);

    const toggleCheckpoint = async (checkpoint) => {
        if (checkpointIsSystemComplete(checkpoint, { profile, workspace })) return;

        if (profile?.id && toggleTaskCompletion) {
            await toggleTaskCompletion(checkpoint.id);
            return;
        }

        setLocalTasks((current) => {
            const next = current.includes(checkpoint.id)
                ? current.filter((id) => id !== checkpoint.id)
                : [...current, checkpoint.id];
            writeLocalTasks(next);
            return next;
        });
    };

    // Calculate progress for each stage
    const stageProgress = useMemo(() => {
        return STRATEGIC_CAR_BUYER_STAGES.map((stage) => getStageProgress(stage, isComplete));
    }, [completedTasks, localTasks, profile, workspace]);

    // Overall progress
    const overallProgress = useMemo(() => {
        const all = STRATEGIC_CAR_BUYER_STAGES.flatMap((s) => s.checkpoints);
        const done = all.filter((cp) => isComplete(cp)).length;
        return { done, total: all.length, pct: all.length ? Math.round((done / all.length) * 100) : 0 };
    }, [completedTasks, localTasks, profile, workspace]);

    // Find next incomplete checkpoint globally
    const nextCheckpoint = useMemo(() => {
        for (let i = 0; i < STRATEGIC_CAR_BUYER_STAGES.length; i++) {
            const stage = STRATEGIC_CAR_BUYER_STAGES[i];
            const checkpoint = stage.checkpoints.find((cp) => !isComplete(cp));
            if (checkpoint) return { stageIndex: i, stage, checkpoint };
        }
        return null;
    }, [completedTasks, localTasks, profile, workspace]);

    // Auto-select the stage with the next incomplete task
    useEffect(() => {
        if (nextCheckpoint) {
            setActiveStageIndex(nextCheckpoint.stageIndex);
        }
    }, []);

    const mission = profile?.buyer_mission && typeof profile.buyer_mission === 'object' ? profile.buyer_mission : localMission;

    const hasMission = !!(
        mission?.savedAt ||
        profile?.buying_timeline ||
        profile?.primary_goal ||
        asArray(mission?.active_shortlist || profile?.active_shortlist).length
    );

    const budgetLabel =
        profile?.budget_min != null && profile?.budget_max != null
            ? `${formatBudget(profile.budget_min)}-${formatBudget(profile.budget_max)}${profile.budget_max >= 150000 ? '+' : ''}`
            : null;

    const activeStage = STRATEGIC_CAR_BUYER_STAGES[activeStageIndex];
    const activeProgress = stageProgress[activeStageIndex];
    const isStageComplete = activeProgress.done === activeProgress.total;

    const allComplete = overallProgress.done === overallProgress.total;

    return (
        <div className="animate-fade-in">
            {/* Sticky Next Step Header */}
            {nextCheckpoint && (
                <div className="sticky top-0 z-20 -mx-6 lg:-mx-10 mb-6 bg-[#0D0D12] border-b border-white/10 px-6 lg:px-10 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C9A84C]/20">
                                <Sparkles size={20} className="text-[#C9A84C]" />
                            </div>
                            <div>
                                <p className="text-xs font-['JetBrains_Mono'] uppercase tracking-wider text-[#C9A84C]">
                                    Your next step
                                </p>
                                <p className="text-white font-medium">{nextCheckpoint.checkpoint.label}</p>
                                {TASK_ESTIMATES[nextCheckpoint.checkpoint.id] && (
                                    <p className="text-white/50 text-xs flex items-center gap-1 mt-0.5">
                                        <Clock size={11} />
                                        {TASK_ESTIMATES[nextCheckpoint.checkpoint.id]}
                                    </p>
                                )}
                            </div>
                        </div>
                        {nextCheckpoint.checkpoint.to && (
                            <Link
                                to={nextCheckpoint.checkpoint.to}
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#C9A84C] px-6 py-3 text-sm font-bold text-[#0D0D12] transition-transform hover:scale-[1.02] shrink-0"
                            >
                                {nextCheckpoint.checkpoint.cta || 'Start'}
                                <ArrowRight size={16} />
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {/* All Complete Celebration */}
            {allComplete && (
                <div className="mb-6 rounded-2xl bg-gradient-to-r from-[#C9A84C]/20 to-[#C9A84C]/5 border border-[#C9A84C]/30 p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#C9A84C]">
                            <PartyPopper size={24} className="text-[#0D0D12]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-[#0D0D12]">You've completed the Guide!</h2>
                            <p className="text-[#0D0D12]/60">All checkpoints done. Use any tool anytime to revisit decisions.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Layout: Vertical Tabs + Content */}
            <div className="flex gap-6 lg:gap-8">
                {/* Left: Vertical Stage Tabs */}
                <nav className="hidden sm:block w-48 lg:w-56 shrink-0">
                    <div className="sticky top-28 space-y-2">
                        <p className="text-xs font-['JetBrains_Mono'] uppercase tracking-wider text-[#0D0D12]/40 mb-4 px-1">
                            Your Journey
                        </p>
                        {STRATEGIC_CAR_BUYER_STAGES.map((stage, idx) => {
                            const progress = stageProgress[idx];
                            const isActive = idx === activeStageIndex;
                            const isDone = progress.done === progress.total;
                            const isFuture = idx > (nextCheckpoint?.stageIndex ?? STRATEGIC_CAR_BUYER_STAGES.length);

                            return (
                                <button
                                    key={stage.id}
                                    onClick={() => setActiveStageIndex(idx)}
                                    className={`w-full text-left rounded-xl p-3 transition-all ${
                                        isActive
                                            ? 'bg-[#0D0D12] text-white shadow-lg'
                                            : isDone
                                            ? 'bg-[#C9A84C]/10 text-[#0D0D12] hover:bg-[#C9A84C]/20'
                                            : isFuture
                                            ? 'bg-[#FAF8F5] text-[#0D0D12]/40 hover:bg-[#0D0D12]/5'
                                            : 'bg-[#FAF8F5] text-[#0D0D12] hover:bg-[#0D0D12]/5'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
                                                isActive
                                                    ? 'bg-[#C9A84C] text-[#0D0D12]'
                                                    : isDone
                                                    ? 'bg-[#C9A84C] text-[#0D0D12]'
                                                    : 'bg-[#0D0D12]/10 text-[#0D0D12]/60'
                                            }`}
                                        >
                                            {isDone ? <Check size={16} strokeWidth={3} /> : stage.number}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className={`text-sm font-semibold truncate ${isActive ? 'text-white' : ''}`}>
                                                {stage.label}
                                            </p>
                                            <p className={`text-xs ${isActive ? 'text-white/60' : 'text-[#0D0D12]/50'}`}>
                                                {progress.done}/{progress.total} tasks
                                            </p>
                                        </div>
                                    </div>
                                    {/* Mini progress bar */}
                                    <div className={`mt-2 h-1 rounded-full ${isActive ? 'bg-white/20' : 'bg-[#0D0D12]/10'}`}>
                                        <div
                                            className={`h-full rounded-full transition-all ${isActive ? 'bg-[#C9A84C]' : isDone ? 'bg-[#C9A84C]' : 'bg-[#0D0D12]/30'}`}
                                            style={{ width: `${progress.pct}%` }}
                                        />
                                    </div>
                                </button>
                            );
                        })}

                        {/* Overall Progress */}
                        <div className="mt-6 pt-4 border-t border-[#0D0D12]/10">
                            <div className="flex items-center justify-between text-xs text-[#0D0D12]/50 mb-2">
                                <span>Overall progress</span>
                                <span className="font-semibold text-[#0D0D12]">{overallProgress.pct}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-[#0D0D12]/10">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-[#C9A84C] to-[#D4B55C] transition-all"
                                    style={{ width: `${overallProgress.pct}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Mobile Stage Selector */}
                <div className="sm:hidden mb-4 -mt-2">
                    <select
                        value={activeStageIndex}
                        onChange={(e) => setActiveStageIndex(Number(e.target.value))}
                        className="w-full bg-[#0D0D12] text-white rounded-xl px-4 py-3 text-sm font-medium"
                    >
                        {STRATEGIC_CAR_BUYER_STAGES.map((stage, idx) => (
                            <option key={stage.id} value={idx}>
                                Stage {stage.number}: {stage.label} ({stageProgress[idx].done}/{stageProgress[idx].total})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Right: Active Stage Content */}
                <div className="flex-1 min-w-0">
                    {/* Stage Header */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C9A84C] px-3 py-1 text-xs font-bold text-[#0D0D12]">
                                Stage {activeStage.number}
                            </span>
                            {isStageComplete && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 text-green-700 px-3 py-1 text-xs font-medium">
                                    <CheckCircle2 size={12} />
                                    Complete
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0D0D12] mb-2">
                            {activeStage.title}
                        </h1>
                        <p className="text-[#0D0D12]/60 max-w-2xl">{activeStage.summary}</p>
                    </div>

                    {/* Collapsible: What You'll Achieve */}
                    <button
                        type="button"
                        onClick={() => setShowOutcome(!showOutcome)}
                        className="w-full mb-6 flex items-center justify-between gap-3 rounded-xl border border-[#0D0D12]/10 bg-[#FAF8F5] px-4 py-3 text-left hover:border-[#C9A84C]/30 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Target size={18} className="text-[#C9A84C]" />
                            <span className="text-sm font-medium text-[#0D0D12]">What you'll achieve in this stage</span>
                        </div>
                        {showOutcome ? <ChevronDown size={18} className="text-[#0D0D12]/40" /> : <ChevronRight size={18} className="text-[#0D0D12]/40" />}
                    </button>

                    {showOutcome && (
                        <div className="mb-6 rounded-xl border border-[#C9A84C]/20 bg-[#FFFCF7] p-5 animate-fade-in">
                            <ul className="space-y-2">
                                {(activeStage.outcomeBullets || [activeStage.outcome]).map((item, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-[#0D0D12]/75">
                                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C9A84C]" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            {activeStage.methodHighlights && (
                                <div className="mt-4 pt-4 border-t border-[#C9A84C]/20">
                                    <p className="text-xs font-['JetBrains_Mono'] uppercase tracking-wider text-[#8A7228] mb-2">
                                        The approach
                                    </p>
                                    <ul className="space-y-1.5">
                                        {activeStage.methodHighlights.map((item, i) => (
                                            <li key={i} className="text-sm text-[#0D0D12]/60">{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Mission Context - shown when profile data exists */}
                    {hasMission ? (
                        <div className="mb-6 rounded-xl border border-[#0D0D12]/10 bg-white p-4">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                <div className="flex items-start gap-3 flex-1">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0D0D12] shrink-0">
                                        <Target size={18} className="text-[#C9A84C]" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-['JetBrains_Mono'] uppercase tracking-wider text-[#0D0D12]/40 mb-1">Your Buying Profile</p>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                                            {profile?.buying_timeline && (
                                                <span className="text-[#0D0D12]">
                                                    <span className="text-[#0D0D12]/50">Timeline:</span> {profile.buying_timeline}
                                                </span>
                                            )}
                                            {budgetLabel && (
                                                <span className="text-[#0D0D12]">
                                                    <span className="text-[#0D0D12]/50">Budget:</span> {budgetLabel}
                                                </span>
                                            )}
                                            {profile?.primary_goal && (
                                                <span className="text-[#0D0D12]">
                                                    <span className="text-[#0D0D12]/50">Priority:</span> {profile.primary_goal}
                                                </span>
                                            )}
                                        </div>
                                        {(profile?.body_style_preference || asArray(mission?.active_shortlist || profile?.active_shortlist).length > 0) && (
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mt-1">
                                                {profile?.body_style_preference && (
                                                    <span className="text-[#0D0D12]/70">
                                                        <span className="text-[#0D0D12]/40">Style:</span> {profile.body_style_preference}
                                                    </span>
                                                )}
                                                {asArray(mission?.active_shortlist || profile?.active_shortlist).length > 0 && (
                                                    <span className="text-[#0D0D12]/70">
                                                        <span className="text-[#0D0D12]/40">Shortlist:</span> {asArray(mission?.active_shortlist || profile?.active_shortlist).length} vehicle(s)
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <Link
                                    to={BUYER_MISSION_PATH}
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#C9A84C] hover:text-[#0D0D12] shrink-0"
                                >
                                    {mission?.savedAt ? 'Edit mission' : 'Complete mission'}
                                    <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>
                    ) : activeStageIndex === 0 && (
                        <div className="mb-6 rounded-xl border border-dashed border-[#C9A84C]/30 bg-[#FFFCF7] p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#C9A84C]/20">
                                        <Target size={18} className="text-[#C9A84C]" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-[#0D0D12]">Define your buying mission</p>
                                        <p className="text-sm text-[#0D0D12]/50">Set your budget, timeline, and priorities to guide every decision.</p>
                                    </div>
                                </div>
                                <Link
                                    to={BUYER_MISSION_PATH}
                                    className="inline-flex items-center gap-2 rounded-lg bg-[#C9A84C] text-[#0D0D12] px-4 py-2 text-sm font-semibold hover:bg-[#D4B55C] transition-colors shrink-0"
                                >
                                    Start worksheet
                                    <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Tasks List (merged checkpoints + modules) */}
                    <div className="rounded-2xl border border-[#0D0D12]/10 bg-white shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-[#0D0D12]/10 bg-[#FAF8F5]">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-semibold uppercase tracking-wider text-[#0D0D12]/70">
                                    Tasks
                                </h2>
                                <span className="text-sm text-[#0D0D12]/50">
                                    {activeProgress.done} of {activeProgress.total} complete
                                </span>
                            </div>
                        </div>

                        <div className="divide-y divide-[#0D0D12]/5">
                            {activeStage.checkpoints.map((checkpoint) => {
                                const checked = isComplete(checkpoint);
                                const systemComplete = checkpointIsSystemComplete(checkpoint, { profile, workspace });
                                const estimate = TASK_ESTIMATES[checkpoint.id];

                                // Find matching module for additional context
                                const relatedModule = activeStage.modules.find(
                                    (m) => m.to === checkpoint.to
                                );

                                return (
                                    <div
                                        key={checkpoint.id}
                                        className={`p-4 sm:p-5 transition-colors ${checked ? 'bg-[#FAF8F5]/50' : 'hover:bg-[#FAF8F5]/50'}`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <button
                                                type="button"
                                                onClick={() => toggleCheckpoint(checkpoint)}
                                                disabled={systemComplete}
                                                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                                                    checked
                                                        ? 'border-[#C9A84C] bg-[#C9A84C] text-white'
                                                        : 'border-[#0D0D12]/20 text-transparent hover:border-[#C9A84C]/50'
                                                } ${systemComplete ? 'cursor-default' : 'cursor-pointer'}`}
                                                aria-label={checked ? 'Mark incomplete' : 'Mark complete'}
                                            >
                                                <Check size={14} strokeWidth={3} />
                                            </button>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                    <div>
                                                        <p className={`font-medium ${checked ? 'text-[#0D0D12]/40 line-through' : 'text-[#0D0D12]'}`}>
                                                            {checkpoint.label}
                                                        </p>
                                                        {relatedModule && (
                                                            <p className="text-sm text-[#0D0D12]/50 mt-0.5">
                                                                {relatedModule.description}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center gap-3 mt-2">
                                                            {estimate && (
                                                                <span className="inline-flex items-center gap-1 text-xs text-[#0D0D12]/40">
                                                                    <Clock size={11} />
                                                                    {estimate}
                                                                </span>
                                                            )}
                                                            {systemComplete && (
                                                                <span className="inline-flex items-center gap-1 text-xs font-['JetBrains_Mono'] uppercase tracking-wider text-[#8A7228]">
                                                                    <Circle size={6} fill="currentColor" />
                                                                    Auto-tracked
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {checkpoint.to && !checked && (
                                                        <Link
                                                            to={checkpoint.to}
                                                            className="inline-flex items-center gap-2 rounded-lg bg-[#0D0D12] text-white px-4 py-2 text-sm font-medium hover:bg-[#1A1A24] transition-colors shrink-0"
                                                        >
                                                            {checkpoint.cta || 'Start'}
                                                            <ArrowRight size={14} />
                                                        </Link>
                                                    )}
                                                    {checked && checkpoint.to && (
                                                        <Link
                                                            to={checkpoint.to}
                                                            className="inline-flex items-center gap-2 text-sm text-[#0D0D12]/40 hover:text-[#C9A84C] transition-colors shrink-0"
                                                        >
                                                            Revisit
                                                            <ArrowRight size={14} />
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Stage Complete Celebration */}
                        {isStageComplete && (
                            <div className="p-5 bg-gradient-to-r from-[#C9A84C]/10 to-transparent border-t border-[#C9A84C]/20">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C9A84C]">
                                        <Check size={20} className="text-[#0D0D12]" strokeWidth={3} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-[#0D0D12]">Stage {activeStage.number} complete!</p>
                                        <p className="text-sm text-[#0D0D12]/60">
                                            {activeStageIndex < STRATEGIC_CAR_BUYER_STAGES.length - 1
                                                ? `Ready for Stage ${STRATEGIC_CAR_BUYER_STAGES[activeStageIndex + 1].number}: ${STRATEGIC_CAR_BUYER_STAGES[activeStageIndex + 1].label}`
                                                : "You've finished the entire guide. Great work!"}
                                        </p>
                                    </div>
                                    {activeStageIndex < STRATEGIC_CAR_BUYER_STAGES.length - 1 && (
                                        <button
                                            type="button"
                                            onClick={() => setActiveStageIndex(activeStageIndex + 1)}
                                            className="ml-auto inline-flex items-center gap-2 rounded-full bg-[#0D0D12] text-white px-4 py-2 text-sm font-medium hover:bg-[#1A1A24]"
                                        >
                                            Next stage
                                            <ArrowRight size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Additional Tools (modules not directly tied to checkpoints) */}
                    {activeStage.modules.filter((m) => !activeStage.checkpoints.some((cp) => cp.to === m.to)).length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#0D0D12]/50 mb-3">
                                Additional Tools
                            </h3>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {activeStage.modules
                                    .filter((m) => !activeStage.checkpoints.some((cp) => cp.to === m.to))
                                    .map((mod) => (
                                        <Link
                                            key={mod.id}
                                            to={mod.to || '#'}
                                            target={mod.openInNewTab ? '_blank' : undefined}
                                            className="flex items-center gap-3 rounded-xl border border-[#0D0D12]/10 bg-white p-4 hover:border-[#C9A84C]/30 hover:shadow-sm transition-all"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-[#0D0D12] truncate">{mod.title}</p>
                                                <p className="text-xs text-[#0D0D12]/50 capitalize">{mod.kind}</p>
                                            </div>
                                            <ArrowRight size={16} className="text-[#0D0D12]/30" />
                                        </Link>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
