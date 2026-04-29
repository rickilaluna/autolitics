import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CarFront, CheckCircle2, Loader2, Plus, Save, X } from 'lucide-react';
import VehicleAutocomplete from '../../components/VehicleAutocomplete';
import { getConsideringModelStrings, recordConsideringModel } from '../../lib/vehicleContextStorage';
import { asArray, readBuyerMission, writeBuyerMission } from '../../lib/buyerMissionStorage';
import { useClientProfile } from '../../hooks/useClientProfile';
import { GUIDE_TASKS, STRATEGIC_CAR_BUYER_GUIDE_PATH } from '../../data/strategicCarBuyerGuide';

const BUDGET_MIN = 0;
const BUDGET_MAX = 150000;
const BUDGET_STEP = 5000;
const OWNERSHIP_MIN = 1;
const OWNERSHIP_MAX = 12;
const OWNERSHIP_STEP = 1;

const USE_CASE_GROUPS = [
    {
        field: 'dailyUseSelections',
        label: 'Daily use',
        helper: 'The normal week this vehicle has to handle without friction.',
        options: ['Commute', 'School drop-off', 'City parking', 'Highway driving', 'Client visits', 'Errands', 'Pets', 'Car seats', 'Tight garage', 'Ride share / carpool'],
    },
    {
        field: 'weeklyUseSelections',
        label: 'Weekly or monthly use',
        helper: 'The recurring tasks that can make a vehicle feel right or wrong.',
        options: ['Groceries', 'Weekend trips', 'Sports gear', 'Home projects', 'Family visits', 'Airport runs', 'Outdoor gear', 'Costco / bulk shopping', 'Long errands', 'Teen drivers'],
    },
    {
        field: 'occasionalUseSelections',
        label: 'Occasional but important use',
        helper: 'Infrequent needs that still matter enough to design around.',
        options: ['Road trips', 'Snow trips', 'Towing', 'Camping', 'Moving furniture', 'Visiting relatives', 'Mountain roads', 'Beach / sand', 'Large passengers', 'Backup family car'],
    },
];

const PRIORITY_GROUPS = [
    {
        label: 'Confidence and risk',
        options: ['Reliability', 'Safety tech', 'Warranty coverage', 'Brand / dealer support', 'Low maintenance'],
    },
    {
        label: 'Budget and ownership',
        options: ['Monthly payment target', 'Low total ownership cost', 'Fuel economy', 'Resale value', 'Insurance cost'],
    },
    {
        label: 'Space and daily usability',
        options: ['Cargo space', 'Third row', 'Easy parking', 'Simple controls', 'Car seat fit'],
    },
    {
        label: 'Driving and conditions',
        options: ['AWD / bad weather', 'Strong acceleration', 'Towing capability', 'EV / hybrid efficiency', 'Highway comfort'],
    },
    {
        label: 'Comfort and feel',
        options: ['Comfortable seats', 'Quiet cabin', 'Premium interior', 'Smooth ride', 'Great visibility'],
    },
    {
        label: 'Technology and convenience',
        options: [
            'Advanced Driver Assistance Systems (ADAS / Auto-pilot)',
            'Wireless Apple CarPlay / Android Auto',
            'Wireless phone charging',
            'Advanced voice control assistant',
            'Over-the-air software updates',
        ],
    },
];

const DEALBREAKER_GROUPS = [
    {
        label: 'Practical fit',
        options: ['Too small for passengers', 'Not enough cargo room', 'Hard to park at home', 'Poor visibility', 'Hard to enter / exit'],
    },
    {
        label: 'Financial boundary',
        options: ['Above max budget', 'Payment too high', 'Insurance too expensive', 'Dealer add-ons required', 'Bad financing terms'],
    },
    {
        label: 'Risk boundary',
        options: ['Poor reliability record', 'Unclear service history', 'Open recall concern', 'No nearby service support', 'Warranty gap'],
    },
    {
        label: 'Lifestyle mismatch',
        options: ['Wrong fuel type', 'No AWD / weather confidence', 'Towing need not met', 'Uncomfortable seats', 'Tech too distracting'],
    },
];

const TIMELINE_OPTIONS = ['ASAP (1-2 Weeks)', 'Within 30 Days', '1-3 Months', '3-6 Months', 'Not sure yet'];
const PRIMARY_GOAL_OPTIONS = [
    { value: 'Lowest Total Payment', label: 'Lowest total cost' },
    { value: 'Specific Vehicle Acquisition', label: 'Find a specific vehicle' },
    { value: 'Best Trade-In Offset', label: 'Maximize trade-in value' },
    { value: 'Reliability & Family Hauling', label: 'Safety and reliability' },
    { value: 'Ev/Hybrid Economy', label: 'EV / hybrid economy' },
    { value: 'Best Overall Fit', label: 'Best overall fit' },
];
const BODY_STYLE_OPTIONS = ['Sedan', 'SUV / Crossover', 'Truck', 'Minivan', 'Coupe / Sports', 'Wagon / Hatchback', 'No Preference'];
const PURCHASE_CONDITION_OPTIONS = ['New', 'Certified Pre-Owned', 'Used', 'Open to All'];
const TRANSACTION_TYPE_OPTIONS = ['Purchase', 'Lease', 'Open to either'];
const DRIVETRAIN_OPTIONS = ['Gas', 'Hybrid', 'Plug-in hybrid', 'Electric (BEV)'];
const SEATING_OPTIONS = ['2 seats', '4 seats', '5 seats', '6+ seats'];
const TRADE_IN_OPTIONS = [
    { value: 'No Trade-In', label: 'No trade-in' },
    { value: 'Yes, Finance Paid Off', label: 'Trade-in paid off' },
    { value: 'Yes, With Loan', label: 'Trade-in with loan' },
    { value: 'Yes, Lease Return', label: 'Lease return' },
];
const RELIABILITY_OPTIONS = ['Very low tolerance', 'Moderate tolerance', 'Open to tradeoffs'];

function formatBudget(val) {
    if (val >= 1000) return `$${Math.round(val / 1000)}K`;
    return `$${val}`;
}

function optionValue(option) {
    return typeof option === 'string' ? option : option.value;
}

function optionLabel(option) {
    return typeof option === 'string' ? option : option.label;
}

const NoteField = ({ label, value, onChange, placeholder }) => (
    <label className="block">
        <span className="mb-2 block text-sm font-semibold text-[#0D0D12]">{label}</span>
        <textarea
            rows={3}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="studio-touch-input w-full resize-y rounded-xl border border-[#0D0D12]/15 bg-white px-4 py-3 text-sm leading-relaxed text-[#0D0D12] placeholder:text-[#0D0D12]/30 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
        />
    </label>
);

const MultiSelectChips = ({ label, helper, values = [], onChange, options, columns = false }) => {
    const selected = asArray(values);
    const toggle = (option) => {
        const value = optionValue(option);
        onChange(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
    };

    return (
        <div>
            <div className="mb-3">
                <h3 className="text-sm font-semibold text-[#0D0D12]">{label}</h3>
                {helper && <p className="mt-1 text-xs leading-relaxed text-[#0D0D12]/50">{helper}</p>}
            </div>
            <div className={`grid gap-2 ${columns ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
                {options.map((option) => {
                    const value = optionValue(option);
                    const active = selected.includes(value);
                    return (
                        <button
                            key={value}
                            type="button"
                            onClick={() => toggle(option)}
                            className={`min-h-11 rounded-xl border px-3 py-2 text-left text-sm font-medium transition-colors ${
                                active
                                    ? 'border-[#C9A84C] bg-[#C9A84C]/15 text-[#0D0D12]'
                                    : 'border-[#0D0D12]/10 bg-[#FAF8F5] text-[#0D0D12]/62 hover:border-[#C9A84C]/40'
                            }`}
                        >
                            {optionLabel(option)}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const GroupedMultiSelect = ({ label, helper, values = [], onChange, groups }) => {
    const selected = asArray(values);
    const toggle = (value) => {
        onChange(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
    };

    return (
        <div>
            <div className="mb-4">
                <h3 className="text-sm font-semibold text-[#0D0D12]">{label}</h3>
                {helper && <p className="mt-1 text-xs leading-relaxed text-[#0D0D12]/50">{helper}</p>}
            </div>
            <div className="grid gap-4">
                {groups.map((group) => (
                    <div key={group.label} className="rounded-2xl border border-[#0D0D12]/10 bg-[#FAF8F5] p-4">
                        <p className="mb-3 text-xs font-['JetBrains_Mono'] uppercase tracking-wider text-[#0D0D12]/42">{group.label}</p>
                        <div className="grid gap-2 sm:grid-cols-2">
                            {group.options.map((option) => {
                                const active = selected.includes(option);
                                return (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => toggle(option)}
                                        className={`min-h-11 rounded-xl border px-3 py-2 text-left text-sm font-medium transition-colors ${
                                            active
                                                ? 'border-[#C9A84C] bg-[#C9A84C]/15 text-[#0D0D12]'
                                                : 'border-[#0D0D12]/10 bg-white text-[#0D0D12]/62 hover:border-[#C9A84C]/40'
                                        }`}
                                    >
                                        {option}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PriorityPreferenceSelector = ({ mustHaves = [], niceToHaves = [], onMustHavesChange, onNiceToHavesChange, groups }) => {
    const must = asArray(mustHaves);
    const nice = asArray(niceToHaves);

    const setPriority = (option, priority) => {
        onMustHavesChange(priority === 'must' ? [...must.filter((item) => item !== option), option] : must.filter((item) => item !== option));
        onNiceToHavesChange(priority === 'nice' ? [...nice.filter((item) => item !== option), option] : nice.filter((item) => item !== option));
    };

    const currentPriority = (option) => {
        if (must.includes(option)) return 'must';
        if (nice.includes(option)) return 'nice';
        return 'none';
    };

    return (
        <div>
            <div className="mb-4">
                <h3 className="text-sm font-semibold text-[#0D0D12]">What matters most?</h3>
                <p className="mt-1 text-xs leading-relaxed text-[#0D0D12]/50">
                    Leave an item blank, mark it as a must-have, or mark it as a nice-to-have. Must-haves should be the few things that really shape the shortlist.
                </p>
            </div>
            <div className="grid gap-4">
                {groups.map((group) => (
                    <div key={group.label} className="rounded-2xl border border-[#0D0D12]/10 bg-[#FAF8F5] p-4">
                        <p className="mb-3 text-xs font-['JetBrains_Mono'] uppercase tracking-wider text-[#0D0D12]/42">{group.label}</p>
                        <div className="grid gap-2">
                            {group.options.map((option) => {
                                const priority = currentPriority(option);
                                return (
                                    <div key={option} className="grid gap-2 rounded-xl border border-[#0D0D12]/10 bg-white p-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                                        <p className="px-1 text-sm font-medium text-[#0D0D12]/75">{option}</p>
                                        <div className="grid grid-cols-3 rounded-lg bg-[#FAF8F5] p-1 text-xs font-semibold sm:w-[228px]">
                                            {[
                                                ['none', 'Skip'],
                                                ['must', 'Must'],
                                                ['nice', 'Nice'],
                                            ].map(([value, label]) => (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    onClick={() => setPriority(option, value)}
                                                    className={`rounded-md px-2 py-1.5 transition-colors ${
                                                        priority === value
                                                            ? value === 'must'
                                                                ? 'bg-[#0D0D12] text-white'
                                                                : value === 'nice'
                                                                    ? 'bg-[#C9A84C] text-[#0D0D12]'
                                                                    : 'bg-white text-[#0D0D12]/65 shadow-sm'
                                                            : 'text-[#0D0D12]/45 hover:text-[#0D0D12]'
                                                    }`}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SingleChoiceTiles = ({ label, helper, value, onChange, options, columns = 2 }) => (
    <div>
        <div className="mb-3">
            <h3 className="text-sm font-semibold text-[#0D0D12]">{label}</h3>
            {helper && <p className="mt-1 text-xs leading-relaxed text-[#0D0D12]/50">{helper}</p>}
        </div>
        <div className={`grid gap-2 ${columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
            {options.map((option) => {
                const optionVal = optionValue(option);
                const active = value === optionVal;
                return (
                    <button
                        key={optionVal}
                        type="button"
                        onClick={() => onChange(optionVal)}
                        className={`min-h-11 rounded-xl border px-3 py-2 text-left text-sm font-medium transition-colors ${
                            active
                                ? 'border-[#C9A84C] bg-[#C9A84C]/15 text-[#0D0D12]'
                                : 'border-[#0D0D12]/10 bg-[#FAF8F5] text-[#0D0D12]/62 hover:border-[#C9A84C]/40'
                        }`}
                    >
                        {optionLabel(option)}
                    </button>
                );
            })}
        </div>
    </div>
);

const BudgetSlider = ({ min, max, onChange }) => {
    const pctLeft = ((min - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100;
    const pctRight = ((max - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100;

    return (
        <div>
            <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-[#0D0D12]">{formatBudget(min)}</span>
                <span className="text-xs font-['JetBrains_Mono'] text-[#0D0D12]/35">target range</span>
                <span className="text-sm font-semibold text-[#0D0D12]">
                    {formatBudget(max)}
                    {max >= BUDGET_MAX ? '+' : ''}
                </span>
            </div>
            <div className="relative flex h-10 items-center">
                <div className="absolute inset-x-0 h-2 rounded-full bg-[#0D0D12]/10" />
                <div className="absolute h-2 rounded-full bg-[#C9A84C]" style={{ left: `${pctLeft}%`, right: `${100 - pctRight}%` }} />
                <input
                    type="range"
                    min={BUDGET_MIN}
                    max={BUDGET_MAX}
                    step={BUDGET_STEP}
                    value={min}
                    onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val <= max - BUDGET_STEP) onChange(val, max);
                    }}
                    className="absolute inset-x-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#0D0D12] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab"
                    style={{ zIndex: 3 }}
                />
                <input
                    type="range"
                    min={BUDGET_MIN}
                    max={BUDGET_MAX}
                    step={BUDGET_STEP}
                    value={max}
                    onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val >= min + BUDGET_STEP) onChange(min, val);
                    }}
                    className="absolute inset-x-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#C9A84C] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab"
                    style={{ zIndex: 4 }}
                />
            </div>
        </div>
    );
};

const OwnershipRangeSlider = ({ min, max, onChange }) => {
    const pctLeft = ((min - OWNERSHIP_MIN) / (OWNERSHIP_MAX - OWNERSHIP_MIN)) * 100;
    const pctRight = ((max - OWNERSHIP_MIN) / (OWNERSHIP_MAX - OWNERSHIP_MIN)) * 100;
    const label = (value) => (value >= OWNERSHIP_MAX ? `${OWNERSHIP_MAX}+ years` : `${value} years`);

    return (
        <div className="rounded-2xl border border-[#0D0D12]/10 bg-[#FAF8F5] p-4 sm:col-span-2">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                    <h3 className="text-sm font-semibold text-[#0D0D12]">How long do you expect to keep it?</h3>
                    <p className="mt-1 text-xs text-[#0D0D12]/50">A range is okay. This shapes reliability, depreciation, warranty, and financing choices.</p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-[#0D0D12]">
                    {label(min)} - {label(max)}
                </span>
            </div>
            <div className="relative flex h-10 items-center">
                <div className="absolute inset-x-0 h-2 rounded-full bg-[#0D0D12]/10" />
                <div className="absolute h-2 rounded-full bg-[#C9A84C]" style={{ left: `${pctLeft}%`, right: `${100 - pctRight}%` }} />
                <input
                    type="range"
                    min={OWNERSHIP_MIN}
                    max={OWNERSHIP_MAX}
                    step={OWNERSHIP_STEP}
                    value={min}
                    onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val <= max - OWNERSHIP_STEP) onChange(val, max);
                    }}
                    className="absolute inset-x-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#0D0D12] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab"
                    style={{ zIndex: 3 }}
                />
                <input
                    type="range"
                    min={OWNERSHIP_MIN}
                    max={OWNERSHIP_MAX}
                    step={OWNERSHIP_STEP}
                    value={max}
                    onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val >= min + OWNERSHIP_STEP) onChange(min, val);
                    }}
                    className="absolute inset-x-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#C9A84C] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab"
                    style={{ zIndex: 4 }}
                />
            </div>
        </div>
    );
};

function ShortlistEditor({ values, onChange }) {
    const [draft, setDraft] = useState('');
    const contextRecent = useMemo(() => getConsideringModelStrings(), [values]);

    const add = () => {
        const t = draft.trim();
        if (!t) return;
        recordConsideringModel(t);
        onChange([...(values || []), t]);
        setDraft('');
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row">
                <VehicleAutocomplete
                    value={draft}
                    onChange={setDraft}
                    contextRecent={contextRecent}
                    placeholder="Add a vehicle you are considering"
                    helperText=""
                    className="studio-touch-input min-w-0 flex-1 rounded-xl border border-[#0D0D12]/15 bg-white px-4 py-3 text-sm text-[#0D0D12]"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            add();
                        }
                    }}
                />
                <button
                    type="button"
                    onClick={add}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0D0D12] px-4 py-3 text-sm font-medium text-white hover:bg-[#1A1A24]"
                >
                    <Plus size={16} />
                    Add
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                {(values || []).map((vehicle, idx) => (
                    <span key={`${vehicle}-${idx}`} className="inline-flex items-center gap-2 rounded-xl border border-[#0D0D12]/10 bg-[#FAF8F5] px-3 py-2 text-sm font-medium text-[#0D0D12]">
                        <CarFront size={14} className="text-[#C9A84C]" />
                        {vehicle}
                        <button
                            type="button"
                            onClick={() => onChange(values.filter((_, i) => i !== idx))}
                            className="rounded p-0.5 text-[#0D0D12]/35 hover:text-red-500"
                            aria-label={`Remove ${vehicle}`}
                        >
                            <X size={14} />
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );
}

export default function BuyerMission() {
    const { profile, loading, updateProfile, toggleTaskCompletion } = useClientProfile();
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [form, setForm] = useState(() => ({
        dailyUseSelections: [],
        weeklyUseSelections: [],
        occasionalUseSelections: [],
        useCaseNotes: '',
        mustHaves: [],
        niceToHaves: [],
        dealbreakers: [],
        priorityNotes: '',
        ownershipMin: 3,
        ownershipMax: 7,
        reliabilityTolerance: '',
        transaction_type: 'Purchase',
        drivetrain_preferences: [],
        seating_preferences: [],
        budget_min: 0,
        budget_max: 75000,
        body_style_preference: [],
        new_or_used: [],
        buying_timeline: '',
        primary_goal: '',
        trade_in_status: '',
        active_shortlist: [],
        ...readBuyerMission(),
    }));

    useEffect(() => {
        if (!profile) return;
        const persistedMission = profile.buyer_mission && typeof profile.buyer_mission === 'object'
            ? profile.buyer_mission
            : {};
        setForm((current) => ({
            ...current,
            ...persistedMission,
            budget_min: profile.budget_min ?? current.budget_min,
            budget_max: profile.budget_max ?? current.budget_max,
            body_style_preference: persistedMission.body_style_preference?.length ? persistedMission.body_style_preference : (current.body_style_preference?.length ? current.body_style_preference : asArray(profile.body_style_preference)),
            new_or_used: persistedMission.new_or_used?.length ? persistedMission.new_or_used : (current.new_or_used?.length ? current.new_or_used : asArray(profile.new_or_used)),
            buying_timeline: profile.buying_timeline || current.buying_timeline,
            primary_goal: profile.primary_goal || current.primary_goal,
            trade_in_status: profile.trade_in_status || current.trade_in_status,
            active_shortlist: Array.isArray(profile.active_shortlist) ? profile.active_shortlist : current.active_shortlist,
        }));
    }, [profile]);

    const set = (field) => (value) => {
        setSaved(false);
        setForm((current) => ({ ...current, [field]: value }));
    };

    const save = async () => {
        setSaving(true);
        writeBuyerMission(form);
        const profileResult = await updateProfile({
            budget_min: form.budget_min,
            budget_max: form.budget_max,
            body_style_preference: asArray(form.body_style_preference).join(', '),
            new_or_used: asArray(form.new_or_used).join(', '),
            buying_timeline: form.buying_timeline,
            primary_goal: form.primary_goal,
            trade_in_status: form.trade_in_status,
            active_shortlist: form.active_shortlist,
        });

        const canPersistMission = profileResult?.data && Object.prototype.hasOwnProperty.call(profileResult.data, 'buyer_mission');
        if (canPersistMission) {
            await updateProfile({
                buyer_mission: {
                    ...form,
                    savedAt: new Date().toISOString(),
                },
            });
        }

        if (profile?.id && !profile?.completed_journey_tasks?.includes(GUIDE_TASKS.mission)) {
            await toggleTaskCompletion(GUIDE_TASKS.mission);
        }

        setSaving(false);
        setSaved(true);
    };

    if (loading) {
        return (
            <div className="flex h-[400px] flex-col items-center justify-center gap-4 text-[#0D0D12]/50 font-['JetBrains_Mono']">
                <Loader2 className="h-8 w-8 animate-spin text-[#C9A84C]" />
                Loading mission worksheet...
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <Link to={STRATEGIC_CAR_BUYER_GUIDE_PATH} className="inline-flex items-center gap-2 text-sm font-medium text-[#0D0D12]/55 hover:text-[#C9A84C]">
                <ArrowLeft size={16} />
                Back to Strategic Guide
            </Link>

            <header className="rounded-[2rem] border border-[#0D0D12]/10 bg-[#14141B] p-8 text-white shadow-sm sm:p-10">
                <p className="mb-4 text-xs font-['JetBrains_Mono'] uppercase tracking-wider text-[#C9A84C]">Stage 01 worksheet</p>
                <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">Define My Goals</h1>
                <p className="mt-4 max-w-3xl text-[#FAF8F5]/65 leading-relaxed">
                    Build the decision brief you will use for the rest of the guide. Once this is clear, every test drive,
                    comparison, and quote review has a job to do.
                </p>
            </header>

            <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-6">
                    <div className="rounded-[2rem] border border-[#0D0D12]/10 bg-white p-6 shadow-sm sm:p-8">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold tracking-tight text-[#0D0D12]">How the vehicle has to fit your life</h2>
                            <p className="mt-2 text-sm leading-relaxed text-[#0D0D12]/55">
                                Choose the jobs this vehicle needs to perform. These selections make the rest of the guide easier to judge.
                            </p>
                        </div>
                        <div className="grid gap-7">
                            {USE_CASE_GROUPS.map((group) => (
                                <MultiSelectChips
                                    key={group.field}
                                    label={group.label}
                                    helper={group.helper}
                                    values={form[group.field]}
                                    onChange={set(group.field)}
                                    options={group.options}
                                />
                            ))}
                            <NoteField
                                label="Anything unusual about how you will use it?"
                                value={form.useCaseNotes}
                                onChange={set('useCaseNotes')}
                                placeholder="Optional: parking constraints, mobility needs, climate, road conditions, family logistics..."
                            />
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-[#0D0D12]/10 bg-white p-6 shadow-sm sm:p-8">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold tracking-tight text-[#0D0D12]">Priorities and boundaries</h2>
                            <p className="mt-2 text-sm leading-relaxed text-[#0D0D12]/55">
                                Sort the same decision factors into what must be true, what would be nice, and what should rule a vehicle out.
                            </p>
                        </div>
                        <div className="grid gap-7">
                            <PriorityPreferenceSelector
                                mustHaves={form.mustHaves}
                                niceToHaves={form.niceToHaves}
                                onMustHavesChange={set('mustHaves')}
                                onNiceToHavesChange={set('niceToHaves')}
                                groups={PRIORITY_GROUPS}
                            />
                            <GroupedMultiSelect
                                label="Dealbreakers"
                                helper="Use these as red flags. A dealbreaker is a boundary, not a desirable feature."
                                values={form.dealbreakers}
                                onChange={set('dealbreakers')}
                                groups={DEALBREAKER_GROUPS}
                            />
                            <NoteField
                                label="Priority notes"
                                value={form.priorityNotes}
                                onChange={set('priorityNotes')}
                                placeholder="Optional: explain any non-obvious tradeoffs, family constraints, or emotional preferences."
                            />
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-[#0D0D12]/10 bg-white p-6 shadow-sm sm:p-8">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold tracking-tight text-[#0D0D12]">Search parameters</h2>
                            <p className="mt-2 text-sm leading-relaxed text-[#0D0D12]/55">
                                Keep the core buying constraints visible so you can refine the search without hunting through dropdowns.
                            </p>
                        </div>
                        <div className="grid gap-7 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <BudgetSlider min={form.budget_min} max={form.budget_max} onChange={(min, max) => {
                                    setSaved(false);
                                    setForm((current) => ({ ...current, budget_min: min, budget_max: max }));
                                }} />
                            </div>
                            <SingleChoiceTiles label="Buying timeline" value={form.buying_timeline} onChange={set('buying_timeline')} options={TIMELINE_OPTIONS} />
                            <SingleChoiceTiles label="Main purchase goal" value={form.primary_goal} onChange={set('primary_goal')} options={PRIMARY_GOAL_OPTIONS} />
                            <SingleChoiceTiles label="Transaction type" value={form.transaction_type} onChange={set('transaction_type')} options={TRANSACTION_TYPE_OPTIONS} columns={3} />
                            <MultiSelectChips label="New, CPO, or used" values={form.new_or_used} onChange={set('new_or_used')} options={PURCHASE_CONDITION_OPTIONS} columns />
                            <MultiSelectChips label="Body style" values={form.body_style_preference} onChange={set('body_style_preference')} options={BODY_STYLE_OPTIONS} columns />
                            <MultiSelectChips label="Drivetrain / fuel type" values={form.drivetrain_preferences} onChange={set('drivetrain_preferences')} options={DRIVETRAIN_OPTIONS} columns />
                            <MultiSelectChips label="Seating needed" values={form.seating_preferences} onChange={set('seating_preferences')} options={SEATING_OPTIONS} columns />
                            <SingleChoiceTiles label="Trade-in status" value={form.trade_in_status} onChange={set('trade_in_status')} options={TRADE_IN_OPTIONS} />
                            <SingleChoiceTiles label="Reliability tolerance" value={form.reliabilityTolerance} onChange={set('reliabilityTolerance')} options={RELIABILITY_OPTIONS} />
                            <OwnershipRangeSlider min={form.ownershipMin} max={form.ownershipMax} onChange={(min, max) => {
                                setSaved(false);
                                setForm((current) => ({ ...current, ownershipMin: min, ownershipMax: max }));
                            }} />
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-[#0D0D12]/10 bg-white p-6 shadow-sm sm:p-8">
                        <h2 className="mb-2 text-xl font-semibold tracking-tight text-[#0D0D12]">Vehicles already on your radar</h2>
                        <p className="mb-5 text-sm text-[#0D0D12]/55">Add anything you are considering. You can refine this list later in the Decision Engine.</p>
                        <ShortlistEditor values={form.active_shortlist || []} onChange={set('active_shortlist')} />
                    </div>
                </div>

                <aside className="h-fit rounded-[2rem] border border-[#C9A84C]/25 bg-[#FFFCF7] p-6 shadow-sm lg:sticky lg:top-6">
                    <p className="mb-2 text-xs font-['JetBrains_Mono'] uppercase tracking-wider text-[#8A7228]">Your decision brief</p>
                    <h2 className="text-xl font-semibold text-[#0D0D12]">Save this before you compare vehicles.</h2>
                    <p className="mt-3 text-sm leading-relaxed text-[#0D0D12]/60">
                        This gives the rest of the guide context: what matters, what does not, and which options deserve real evaluation.
                    </p>
                    <button
                        type="button"
                        onClick={save}
                        disabled={saving}
                        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0D0D12] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1A1A24] disabled:opacity-60"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
                        {saving ? 'Saving...' : saved ? 'Saved' : 'Save mission'}
                    </button>
                    {saved && (
                        <Link to={STRATEGIC_CAR_BUYER_GUIDE_PATH} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#0D0D12]/10 bg-white px-5 py-3 text-sm font-semibold text-[#0D0D12] hover:border-[#C9A84C]/40">
                            Return to guide
                        </Link>
                    )}
                </aside>
            </section>
        </div>
    );
}
