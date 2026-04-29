import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    BookOpen,
    Check,
    Circle,
    ClipboardCheck,
    FileText,
    Library,
    MousePointer2,
    Printer,
    Target,
} from 'lucide-react';
import { BUYER_MISSION_PATH, STRATEGIC_CAR_BUYER_STAGES } from '../../data/strategicCarBuyerGuide';
import { useClientProfile } from '../../hooks/useClientProfile';
import { asArray, readBuyerMission } from '../../lib/buyerMissionStorage';
import { getWorkspaceActivity } from '../../lib/vehicleContextStorage';

const LOCAL_GUIDE_TASKS_KEY = 'autolitics_guide_completed_tasks_v1';

const kindStyles = {
    read: { label: 'Read', className: 'bg-[#0D0D12]/[0.06] text-[#0D0D12]/80 border-[#0D0D12]/10', Icon: BookOpen },
    interactive: { label: 'Interactive', className: 'bg-[#C9A84C]/10 text-[#8A7228] border-[#C9A84C]/25', Icon: MousePointer2 },
    print: { label: 'Print', className: 'bg-[#0D0D12]/5 text-[#0D0D12]/70 border-[#0D0D12]/10', Icon: Printer },
    worksheet: { label: 'Worksheet', className: 'bg-[#0D0D12]/[0.06] text-[#0D0D12]/80 border-[#0D0D12]/10', Icon: FileText },
    checklist: { label: 'Checklist', className: 'bg-[#0D0D12]/5 text-[#0D0D12]/70 border-[#0D0D12]/10', Icon: ClipboardCheck },
};

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
    } catch {
        /* local storage can fail in private contexts; the UI still works in memory */
    }
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

function groupModules(modules) {
    return modules.reduce((groups, mod) => {
        const group = mod.group || 'Tools';
        if (!groups[group]) groups[group] = [];
        groups[group].push(mod);
        return groups;
    }, {});
}

function getStageProgress(stage, ctx) {
    const done = stage.checkpoints.filter((checkpoint) => ctx.isComplete(checkpoint)).length;
    return {
        done,
        total: stage.checkpoints.length,
        pct: stage.checkpoints.length ? Math.round((done / stage.checkpoints.length) * 100) : 0,
    };
}

function formatBudget(val) {
    if (val == null) return null;
    if (val >= 1000) return `$${Math.round(val / 1000)}K`;
    return `$${val}`;
}

function summarizeList(items, fallback = 'Not set') {
    const list = asArray(items);
    if (!list.length) return fallback;
    if (list.length <= 3) return list.join(', ');
    return `${list.slice(0, 3).join(', ')} +${list.length - 3}`;
}

const ModuleCard = ({ mod }) => {
    const meta = kindStyles[mod.kind] || kindStyles.read;
    const Icon = meta.Icon;
    const cardClass =
        'group flex h-full flex-col rounded-2xl border border-[#0D0D12]/10 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#C9A84C]/35 hover:shadow-md';
    const inner = (
        <>
            <div className="mb-4 flex items-start justify-between gap-3">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${meta.className}`}>
                    <Icon size={13} strokeWidth={2} />
                    {meta.label}
                </span>
            </div>
            <h3 className="mb-2 text-base font-semibold text-[#0D0D12]">{mod.title}</h3>
            <p className="mb-5 flex-1 text-sm leading-relaxed text-[#0D0D12]/58">{mod.description}</p>
            {mod.note && <p className="mb-5 rounded-xl bg-[#FAF8F5] p-3 text-xs leading-relaxed text-[#0D0D12]/55">{mod.note}</p>}
            {mod.to && (
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#C9A84C] transition-all group-hover:gap-3">
                    {mod.cta || 'Open'}
                    <ArrowRight size={14} />
                </span>
            )}
        </>
    );

    if (!mod.to) return <div className={cardClass}>{inner}</div>;

    return (
        <Link
            to={mod.to}
            target={mod.openInNewTab ? '_blank' : undefined}
            rel={mod.openInNewTab ? 'noopener noreferrer' : undefined}
            className={cardClass}
        >
            {inner}
        </Link>
    );
};

export default function StrategicCarBuyerGuide() {
    const { profile, toggleTaskCompletion } = useClientProfile();
    const [localTasks, setLocalTasks] = useState(() => readLocalTasks());
    const [workspace, setWorkspace] = useState(() => getWorkspaceActivity());
    const [localMission, setLocalMission] = useState(() => readBuyerMission());

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

    const progress = useMemo(() => {
        const all = STRATEGIC_CAR_BUYER_STAGES.flatMap((stage) => stage.checkpoints);
        const done = all.filter((checkpoint) => isComplete(checkpoint)).length;
        return { done, total: all.length, pct: all.length ? Math.round((done / all.length) * 100) : 0 };
    }, [completedTasks, localTasks, profile, workspace]);

    const nextCheckpoint = useMemo(() => {
        for (const stage of STRATEGIC_CAR_BUYER_STAGES) {
            const checkpoint = stage.checkpoints.find((item) => !isComplete(item));
            if (checkpoint) return { stage, checkpoint };
        }
        return null;
    }, [completedTasks, localTasks, profile, workspace]);

    const mission = profile?.buyer_mission && typeof profile.buyer_mission === 'object'
        ? profile.buyer_mission
        : localMission;

    const hasMission = !!(
        mission?.savedAt ||
        profile?.buying_timeline ||
        profile?.primary_goal ||
        asArray(mission?.mustHaves).length ||
        asArray(mission?.active_shortlist || profile?.active_shortlist).length
    );

    const budgetLabel = profile?.budget_min != null && profile?.budget_max != null
        ? `${formatBudget(profile.budget_min)}-${formatBudget(profile.budget_max)}${profile.budget_max >= 150000 ? '+' : ''}`
        : null;

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <header className="relative overflow-hidden rounded-[2rem] border border-[#0D0D12]/10 bg-white p-7 shadow-sm sm:p-10">
                <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#C9A84C]/[0.07]" aria-hidden />
                <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
                    <div>
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#0D0D12]/10 bg-[#FAF8F5] px-3 py-1 text-xs font-['JetBrains_Mono'] uppercase tracking-wider text-[#0D0D12]/60">
                            <Library size={14} className="text-[#C9A84C]" />
                            Digital guide workspace
                        </div>
                        <h1 className="mb-3 text-3xl font-semibold tracking-tight text-[#0D0D12] sm:text-4xl">
                            The Strategic Car Buyer
                        </h1>
                        <p className="max-w-2xl text-lg leading-relaxed text-[#0D0D12]/68">
                            Your step-by-step command center for buying with clarity. Define what matters, compare vehicles
                            intelligently, pressure-test every quote, and walk into the final decision prepared.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-[#C9A84C]/25 bg-[#FFFCF7] p-5">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <p className="text-xs font-['JetBrains_Mono'] uppercase tracking-wider text-[#8A7228]">Guide progress</p>
                            <span className="text-sm font-semibold text-[#0D0D12]">{progress.pct}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-[#0D0D12]/10">
                            <div className="h-full rounded-full bg-[#C9A84C] transition-all" style={{ width: `${progress.pct}%` }} />
                        </div>
                        <p className="mt-3 text-sm text-[#0D0D12]/55">{progress.done} of {progress.total} checkpoints complete</p>
                    </div>
                </div>
            </header>

            <section className="rounded-[2rem] border border-[#0D0D12]/10 bg-[#14141B] p-6 text-[#FAF8F5] shadow-sm sm:p-8">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                    <div>
                        <p className="mb-2 text-xs font-['JetBrains_Mono'] uppercase tracking-wider text-[#C9A84C]">
                            Recommended next step
                        </p>
                        {nextCheckpoint ? (
                            <>
                                <h2 className="text-2xl font-semibold tracking-tight">{nextCheckpoint.checkpoint.label}</h2>
                                <p className="mt-2 text-sm text-[#FAF8F5]/55">
                                    Stage {nextCheckpoint.stage.number}: {nextCheckpoint.stage.label}
                                </p>
                            </>
                        ) : (
                            <>
                                <h2 className="text-2xl font-semibold tracking-tight">You have completed the guide path.</h2>
                                <p className="mt-2 text-sm text-[#FAF8F5]/55">Revisit any tool when you need to compare or verify a decision.</p>
                            </>
                        )}
                    </div>
                    {nextCheckpoint?.checkpoint.to && (
                        <Link
                            to={nextCheckpoint.checkpoint.to}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#C9A84C] px-6 py-3 text-sm font-bold text-[#0D0D12] transition-transform hover:scale-[1.02]"
                        >
                            {nextCheckpoint.checkpoint.cta || 'Start'}
                            <ArrowRight size={16} />
                        </Link>
                    )}
                </div>
            </section>

            {hasMission && (
                <section className="rounded-[2rem] border border-[#0D0D12]/10 bg-white p-6 shadow-sm sm:p-8">
                    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="mb-2 text-xs font-['JetBrains_Mono'] uppercase tracking-wider text-[#C9A84C]">Mission snapshot</p>
                            <h2 className="text-2xl font-semibold tracking-tight text-[#0D0D12]">Your goals are now the baseline for the guide.</h2>
                            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#0D0D12]/55">
                                Use this as the filter for every shortlist, scorecard, and dealer quote. If a vehicle does not serve this brief, it has to earn its way back in.
                            </p>
                        </div>
                        <Link
                            to={BUYER_MISSION_PATH}
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#0D0D12]/10 bg-[#FAF8F5] px-5 py-3 text-sm font-semibold text-[#0D0D12] hover:border-[#C9A84C]/40"
                        >
                            Edit mission
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-2xl border border-[#0D0D12]/10 bg-[#FAF8F5] p-4">
                            <p className="mb-1 text-xs font-['JetBrains_Mono'] uppercase tracking-wider text-[#0D0D12]/40">Search lane</p>
                            <p className="text-sm font-semibold text-[#0D0D12]">{[budgetLabel, profile?.buying_timeline].filter(Boolean).join(' / ') || 'Not set'}</p>
                            <p className="mt-1 text-xs text-[#0D0D12]/50">{summarizeList(mission?.new_or_used || profile?.new_or_used)}</p>
                        </div>
                        <div className="rounded-2xl border border-[#0D0D12]/10 bg-[#FAF8F5] p-4">
                            <p className="mb-1 text-xs font-['JetBrains_Mono'] uppercase tracking-wider text-[#0D0D12]/40">Vehicle fit</p>
                            <p className="text-sm font-semibold text-[#0D0D12]">{summarizeList(mission?.body_style_preference || profile?.body_style_preference)}</p>
                            <p className="mt-1 text-xs text-[#0D0D12]/50">{summarizeList(mission?.drivetrain_preferences)}</p>
                        </div>
                        <div className="rounded-2xl border border-[#0D0D12]/10 bg-[#FAF8F5] p-4">
                            <p className="mb-1 text-xs font-['JetBrains_Mono'] uppercase tracking-wider text-[#0D0D12]/40">Must-haves</p>
                            <p className="text-sm font-semibold text-[#0D0D12]">{summarizeList(mission?.mustHaves)}</p>
                            <p className="mt-1 text-xs text-[#0D0D12]/50">Dealbreakers: {summarizeList(mission?.dealbreakers)}</p>
                        </div>
                        <div className="rounded-2xl border border-[#0D0D12]/10 bg-[#FAF8F5] p-4">
                            <p className="mb-1 text-xs font-['JetBrains_Mono'] uppercase tracking-wider text-[#0D0D12]/40">Shortlist</p>
                            <p className="text-sm font-semibold text-[#0D0D12]">{summarizeList(mission?.active_shortlist || profile?.active_shortlist)}</p>
                            <p className="mt-1 text-xs text-[#0D0D12]/50">{profile?.primary_goal || 'Goal not set'}</p>
                        </div>
                    </div>
                </section>
            )}

            <div className="space-y-8">
                {STRATEGIC_CAR_BUYER_STAGES.map((stage) => {
                    const stageProgress = getStageProgress(stage, { isComplete });
                    const groupedModules = groupModules(stage.modules);
                    return (
                        <section key={stage.id} className="overflow-hidden rounded-[2rem] border border-[#0D0D12]/10 bg-white shadow-sm">
                            <div className="border-b border-[#0D0D12]/10 bg-white p-6 sm:p-8">
                                <div className="grid gap-6 lg:grid-cols-[104px_minmax(0,1fr)_190px] lg:items-start">
                                    <div className="flex h-24 w-24 items-center justify-center rounded-[1.5rem] bg-[#0D0D12] text-[#C9A84C] shadow-sm">
                                        <div className="text-center">
                                            <div className="text-[10px] font-['JetBrains_Mono'] uppercase tracking-[0.2em] text-[#FAF8F5]/45">Stage</div>
                                            <div className="text-4xl font-semibold leading-none">{stage.number}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="mb-3 inline-flex rounded-full bg-[#C9A84C]/10 px-3 py-1 text-xs font-semibold text-[#8A7228]">
                                            {stage.label}
                                        </div>
                                        <h2 className="text-3xl font-semibold tracking-tight text-[#0D0D12]">{stage.title}</h2>
                                        <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#0D0D12]/62">{stage.summary}</p>
                                    </div>
                                    <div className="rounded-2xl border border-[#0D0D12]/10 bg-[#FAF8F5] p-4">
                                        <div className="mb-2 flex items-center justify-between text-sm">
                                            <span className="text-[#0D0D12]/45">Stage progress</span>
                                            <span className="font-semibold text-[#0D0D12]">{stageProgress.pct}%</span>
                                        </div>
                                        <div className="h-1.5 overflow-hidden rounded-full bg-[#0D0D12]/10">
                                            <div className="h-full rounded-full bg-[#C9A84C]" style={{ width: `${stageProgress.pct}%` }} />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-7 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(220px,320px)]">
                                    <div className="rounded-2xl border border-[#0D0D12]/10 bg-[#FAF8F5] p-5">
                                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#0D0D12]">
                                            <Target size={16} className="text-[#C9A84C]" />
                                            Outcome
                                        </div>
                                        <p className="text-sm leading-relaxed text-[#0D0D12]/60">{stage.outcome}</p>
                                    </div>
                                    <div className="rounded-2xl border border-[#0D0D12]/10 bg-[#FAF8F5] p-5">
                                        <p className="mb-3 text-xs font-['JetBrains_Mono'] uppercase tracking-wider text-[#0D0D12]/35">
                                            Autolitics method
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {stage.method.map((item) => (
                                                <span key={item} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#0D0D12]/65">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[320px_minmax(0,1fr)]">
                                <div>
                                    <h3 className="mb-4 text-sm font-['JetBrains_Mono'] uppercase tracking-wider text-[#0D0D12]/40">
                                        Checkpoints
                                    </h3>
                                    <div className="space-y-2">
                                        {stage.checkpoints.map((checkpoint) => {
                                            const checked = isComplete(checkpoint);
                                            const systemComplete = checkpointIsSystemComplete(checkpoint, { profile, workspace });
                                            return (
                                                <div
                                                    key={checkpoint.id}
                                                    className="rounded-xl border border-[#0D0D12]/10 bg-[#FAF8F5] p-3 transition-colors hover:border-[#C9A84C]/35"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleCheckpoint(checkpoint)}
                                                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                                                                checked
                                                                    ? 'border-[#C9A84C] bg-[#C9A84C] text-[#0D0D12]'
                                                                    : 'border-[#0D0D12]/20 text-transparent'
                                                            }`}
                                                            aria-label={checked ? 'Mark incomplete' : 'Mark complete'}
                                                        >
                                                            <Check size={13} strokeWidth={3} />
                                                        </button>
                                                        <div className="min-w-0 flex-1">
                                                            <span className={`block text-sm ${checked ? 'text-[#0D0D12]/45 line-through' : 'text-[#0D0D12]/75'}`}>
                                                                {checkpoint.label}
                                                            </span>
                                                            {systemComplete && (
                                                                <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-['JetBrains_Mono'] uppercase tracking-wider text-[#8A7228]">
                                                                    <Circle size={6} fill="currentColor" />
                                                                    Auto-tracked
                                                                </span>
                                                            )}
                                                            {checkpoint.to && !checked && (
                                                                <Link
                                                                    to={checkpoint.to}
                                                                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#C9A84C] hover:text-[#0D0D12]"
                                                                >
                                                                    {checkpoint.cta || 'Open'}
                                                                    <ArrowRight size={12} />
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-7">
                                    {Object.entries(groupedModules).map(([group, modules]) => (
                                        <section key={group}>
                                            <h3 className="mb-4 text-sm font-['JetBrains_Mono'] uppercase tracking-wider text-[#0D0D12]/40">
                                                {group}
                                            </h3>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                {modules.map((mod) => (
                                                    <ModuleCard key={mod.id} mod={mod} />
                                                ))}
                                            </div>
                                        </section>
                                    ))}
                                </div>
                            </div>
                        </section>
                    );
                })}
            </div>
        </div>
    );
}
