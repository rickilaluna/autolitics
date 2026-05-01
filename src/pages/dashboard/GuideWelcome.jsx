import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import {
    ArrowRight,
    ArrowLeft,
    Check,
    Target,
    Clock,
    Wallet,
    Car,
    Sparkles,
    CarFront,
    Plus,
    X,
    FileText,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useClientProfile } from '../../hooks/useClientProfile';
import VehicleAutocomplete from '../../components/VehicleAutocomplete';
import { getConsideringModelStrings, recordConsideringModel } from '../../lib/vehicleContextStorage';

const STEPS = [
    { id: 'welcome', label: 'Welcome' },
    { id: 'context', label: 'Context' },
    { id: 'preferences', label: 'Preferences' },
    { id: 'vehicles', label: 'Vehicles' },
    { id: 'ready', label: 'Ready' },
];

const TIMELINE_OPTIONS = [
    { value: 'ASAP (1-2 Weeks)', label: 'ASAP', sublabel: '1-2 weeks' },
    { value: 'Within 30 Days', label: 'This month', sublabel: 'Within 30 days' },
    { value: '1-3 Months', label: 'Soon', sublabel: '1-3 months' },
    { value: '3-6 Months', label: 'Planning ahead', sublabel: '3-6 months' },
    { value: 'Not sure yet', label: 'Not sure yet', sublabel: 'Still exploring' },
];

const GOAL_OPTIONS = [
    { value: 'Lowest Total Payment', label: 'Lowest total cost', icon: Wallet },
    { value: 'Specific Vehicle Acquisition', label: 'Find a specific vehicle', icon: Target },
    { value: 'Best Trade-In Offset', label: 'Maximize trade-in', icon: Car },
    { value: 'Reliability & Family Hauling', label: 'Safety & reliability', icon: Check },
    { value: 'Ev/Hybrid Economy', label: 'EV / hybrid economy', icon: Sparkles },
];

const BODY_STYLES = ['Sedan', 'SUV / Crossover', 'Truck', 'Minivan', 'Coupe / Sports', 'Wagon / Hatchback'];
const CONDITION_OPTIONS = ['New', 'Certified Pre-Owned', 'Used', 'Open to All'];

const BUDGET_MIN = 0;
const BUDGET_MAX = 150000;
const BUDGET_STEP = 5000;

function formatBudget(val) {
    if (val >= 1000) return `$${Math.round(val / 1000)}K`;
    return `$${val}`;
}

export default function GuideWelcome() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { profile, updateProfile } = useClientProfile();
    const [currentStep, setCurrentStep] = useState(0);
    const [saving, setSaving] = useState(false);
    const containerRef = useRef(null);
    const stepRefs = useRef([]);

    const [formData, setFormData] = useState({
        buying_timeline: '',
        primary_goal: '',
        budget_min: 25000,
        budget_max: 60000,
        body_style_preference: [],
        new_or_used: [],
        active_shortlist: [],
    });

    const [vehicleDraft, setVehicleDraft] = useState('');
    const contextRecent = useMemo(() => getConsideringModelStrings(), [formData.active_shortlist]);

    const displayFirstName =
        (profile?.primary_contact_name || '').trim().split(/\s+/)[0] ||
        user?.user_metadata?.first_name ||
        'there';

    // Animate step transitions
    useEffect(() => {
        const current = stepRefs.current[currentStep];
        if (!current) return;

        gsap.fromTo(
            current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
        );
    }, [currentStep]);

    const updateField = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const toggleArrayField = (field, value) => {
        setFormData((prev) => {
            const arr = prev[field] || [];
            return {
                ...prev,
                [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
            };
        });
    };

    const addVehicle = () => {
        const trimmed = vehicleDraft.trim();
        if (!trimmed) return;
        recordConsideringModel(trimmed);
        setFormData((prev) => ({
            ...prev,
            active_shortlist: [...(prev.active_shortlist || []), trimmed],
        }));
        setVehicleDraft('');
    };

    const removeVehicle = (idx) => {
        setFormData((prev) => ({
            ...prev,
            active_shortlist: prev.active_shortlist.filter((_, i) => i !== idx),
        }));
    };

    const canProceed = () => {
        switch (currentStep) {
            case 0: return true; // Welcome
            case 1: return formData.buying_timeline && formData.primary_goal; // Context
            case 2: return true; // Preferences (optional)
            case 3: return true; // Vehicles (optional)
            case 4: return true; // Ready
            default: return true;
        }
    };

    const goNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep((s) => s + 1);
        }
    };

    const goBack = () => {
        if (currentStep > 0) {
            setCurrentStep((s) => s - 1);
        }
    };

    const handleComplete = async () => {
        setSaving(true);
        try {
            await updateProfile({
                buying_timeline: formData.buying_timeline,
                primary_goal: formData.primary_goal,
                budget_min: formData.budget_min,
                budget_max: formData.budget_max,
                body_style_preference: formData.body_style_preference.join(', '),
                new_or_used: formData.new_or_used.join(', '),
                active_shortlist: formData.active_shortlist,
                guide_onboarding_completed: true,
            });
            navigate('/dashboard/strategic-car-buyer-guide');
        } catch (err) {
            console.error('Error saving onboarding:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleSkip = async () => {
        setSaving(true);
        try {
            await updateProfile({ guide_onboarding_completed: true });
            navigate('/dashboard/strategic-car-buyer-guide');
        } catch (err) {
            console.error('Error skipping onboarding:', err);
        } finally {
            setSaving(false);
        }
    };

    const renderProgressDots = () => (
        <div className="flex items-center gap-2 mb-8">
            {STEPS.map((step, idx) => (
                <div
                    key={step.id}
                    className={`h-2 rounded-full transition-all duration-300 ${
                        idx === currentStep
                            ? 'w-8 bg-[#C9A84C]'
                            : idx < currentStep
                            ? 'w-2 bg-[#C9A84C]/60'
                            : 'w-2 bg-white/20'
                    }`}
                />
            ))}
        </div>
    );

    return (
        <div
            ref={containerRef}
            className="min-h-screen bg-[#0D0D12] text-white flex flex-col"
        >
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                <div className="w-full max-w-2xl">
                    {renderProgressDots()}

                    {/* Step 0: Welcome */}
                    {currentStep === 0 && (
                        <div ref={(el) => (stepRefs.current[0] = el)} className="space-y-8">
                            <div className="space-y-4">
                                <p className="text-[#C9A84C] text-sm font-['JetBrains_Mono'] uppercase tracking-wider">
                                    Welcome to the Guide
                                </p>
                                <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
                                    Hey {displayFirstName}, let's get you set up.
                                </h1>
                                <p className="text-white/60 text-lg max-w-xl leading-relaxed">
                                    Quick setup to personalize your Guide. Takes about 2 minutes.
                                </p>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                                <h3 className="font-semibold text-lg">We'll capture:</h3>
                                <div className="grid gap-3">
                                    {[
                                        { icon: Clock, text: 'Your timeline and main priority' },
                                        { icon: Wallet, text: 'Budget range and vehicle preferences' },
                                        { icon: CarFront, text: 'Any vehicles already on your radar' },
                                    ].map(({ icon: Icon, text }) => (
                                        <div key={text} className="flex items-center gap-3 text-white/80">
                                            <div className="w-8 h-8 rounded-lg bg-[#C9A84C]/20 flex items-center justify-center">
                                                <Icon size={16} className="text-[#C9A84C]" />
                                            </div>
                                            {text}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <p className="text-white/40 text-sm">
                                Want to define detailed preferences? You'll find the full Buyer Mission worksheet inside the Guide.
                            </p>

                            <button
                                type="button"
                                onClick={handleSkip}
                                disabled={saving}
                                className="text-white/40 hover:text-white/60 text-sm transition-colors"
                            >
                                Skip for now
                            </button>
                        </div>
                    )}

                    {/* Step 1: Timeline & Goal */}
                    {currentStep === 1 && (
                        <div ref={(el) => (stepRefs.current[1] = el)} className="space-y-10">
                            <div className="space-y-3">
                                <p className="text-[#C9A84C] text-sm font-['JetBrains_Mono'] uppercase tracking-wider">
                                    Step 1 of 3
                                </p>
                                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                                    When are you looking to buy?
                                </h2>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {TIMELINE_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => updateField('buying_timeline', opt.value)}
                                        className={`p-4 rounded-xl border text-left transition-all ${
                                            formData.buying_timeline === opt.value
                                                ? 'border-[#C9A84C] bg-[#C9A84C]/10'
                                                : 'border-white/10 bg-white/5 hover:border-white/30'
                                        }`}
                                    >
                                        <p className="font-semibold">{opt.label}</p>
                                        <p className="text-sm text-white/50">{opt.sublabel}</p>
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-4 pt-4">
                                <h3 className="text-xl font-semibold">What matters most to you?</h3>
                                <div className="grid gap-3">
                                    {GOAL_OPTIONS.map(({ value, label, icon: Icon }) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => updateField('primary_goal', value)}
                                            className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                                                formData.primary_goal === value
                                                    ? 'border-[#C9A84C] bg-[#C9A84C]/10'
                                                    : 'border-white/10 bg-white/5 hover:border-white/30'
                                            }`}
                                        >
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                formData.primary_goal === value ? 'bg-[#C9A84C]/20' : 'bg-white/10'
                                            }`}>
                                                <Icon size={20} className={formData.primary_goal === value ? 'text-[#C9A84C]' : 'text-white/60'} />
                                            </div>
                                            <span className="font-medium">{label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Budget & Preferences */}
                    {currentStep === 2 && (
                        <div ref={(el) => (stepRefs.current[2] = el)} className="space-y-10">
                            <div className="space-y-3">
                                <p className="text-[#C9A84C] text-sm font-['JetBrains_Mono'] uppercase tracking-wider">
                                    Step 2 of 3
                                </p>
                                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                                    What's your budget range?
                                </h2>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                                <div className="flex items-center justify-between text-lg">
                                    <span className="font-semibold">{formatBudget(formData.budget_min)}</span>
                                    <span className="text-white/40 text-sm">to</span>
                                    <span className="font-semibold">
                                        {formatBudget(formData.budget_max)}
                                        {formData.budget_max >= BUDGET_MAX ? '+' : ''}
                                    </span>
                                </div>
                                <div className="relative h-12 flex items-center">
                                    <div className="absolute inset-x-0 h-2 rounded-full bg-white/10" />
                                    <div
                                        className="absolute h-2 rounded-full bg-[#C9A84C]"
                                        style={{
                                            left: `${((formData.budget_min - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100}%`,
                                            right: `${100 - ((formData.budget_max - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100}%`,
                                        }}
                                    />
                                    <input
                                        type="range"
                                        min={BUDGET_MIN}
                                        max={BUDGET_MAX}
                                        step={BUDGET_STEP}
                                        value={formData.budget_min}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            if (val <= formData.budget_max - BUDGET_STEP) {
                                                updateField('budget_min', val);
                                            }
                                        }}
                                        className="absolute inset-x-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-grab"
                                        style={{ zIndex: 3 }}
                                    />
                                    <input
                                        type="range"
                                        min={BUDGET_MIN}
                                        max={BUDGET_MAX}
                                        step={BUDGET_STEP}
                                        value={formData.budget_max}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            if (val >= formData.budget_min + BUDGET_STEP) {
                                                updateField('budget_max', val);
                                            }
                                        }}
                                        className="absolute inset-x-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#C9A84C] [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-grab"
                                        style={{ zIndex: 4 }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold">New, used, or open?</h3>
                                <div className="flex flex-wrap gap-2">
                                    {CONDITION_OPTIONS.map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => toggleArrayField('new_or_used', opt)}
                                            className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                                                formData.new_or_used.includes(opt)
                                                    ? 'border-[#C9A84C] bg-[#C9A84C]/10 text-[#C9A84C]'
                                                    : 'border-white/10 bg-white/5 text-white/70 hover:border-white/30'
                                            }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold">Body style preferences</h3>
                                <div className="flex flex-wrap gap-2">
                                    {BODY_STYLES.map((style) => (
                                        <button
                                            key={style}
                                            type="button"
                                            onClick={() => toggleArrayField('body_style_preference', style)}
                                            className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                                                formData.body_style_preference.includes(style)
                                                    ? 'border-[#C9A84C] bg-[#C9A84C]/10 text-[#C9A84C]'
                                                    : 'border-white/10 bg-white/5 text-white/70 hover:border-white/30'
                                            }`}
                                        >
                                            {style}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Vehicles */}
                    {currentStep === 3 && (
                        <div ref={(el) => (stepRefs.current[3] = el)} className="space-y-10">
                            <div className="space-y-3">
                                <p className="text-[#C9A84C] text-sm font-['JetBrains_Mono'] uppercase tracking-wider">
                                    Step 3 of 3
                                </p>
                                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                                    Any vehicles already on your radar?
                                </h2>
                                <p className="text-white/60">
                                    Add vehicles you're considering. You can always update this later.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <VehicleAutocomplete
                                        value={vehicleDraft}
                                        onChange={setVehicleDraft}
                                        contextRecent={contextRecent}
                                        placeholder="e.g. 2024 Toyota RAV4 Hybrid"
                                        helperText=""
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#C9A84C]/50"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addVehicle();
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={addVehicle}
                                        className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>

                                {formData.active_shortlist.length > 0 && (
                                    <div className="space-y-2">
                                        {formData.active_shortlist.map((vehicle, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <CarFront size={18} className="text-[#C9A84C]" />
                                                    <span className="font-medium">{vehicle}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeVehicle(idx)}
                                                    className="p-1 text-white/40 hover:text-red-400 transition-colors"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {formData.active_shortlist.length === 0 && (
                                    <p className="text-white/40 text-sm">
                                        No problem if you're not sure yet. The Guide will help you build your shortlist.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Ready */}
                    {currentStep === 4 && (
                        <div ref={(el) => (stepRefs.current[4] = el)} className="space-y-10">
                            <div className="space-y-4">
                                <div className="w-16 h-16 rounded-2xl bg-[#C9A84C]/20 flex items-center justify-center mb-6">
                                    <Check size={32} className="text-[#C9A84C]" />
                                </div>
                                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                                    You're all set, {displayFirstName}.
                                </h2>
                                <p className="text-white/60 text-lg max-w-xl leading-relaxed">
                                    Your profile is ready. The Guide will use this context to help you make smarter decisions at every stage.
                                </p>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                                <h3 className="font-semibold text-lg">Your buying profile:</h3>
                                <div className="grid gap-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-white/50">Timeline</span>
                                        <span className="font-medium">{formData.buying_timeline || 'Not set'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/50">Priority</span>
                                        <span className="font-medium">
                                            {GOAL_OPTIONS.find((g) => g.value === formData.primary_goal)?.label || 'Not set'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/50">Budget</span>
                                        <span className="font-medium">
                                            {formatBudget(formData.budget_min)} - {formatBudget(formData.budget_max)}
                                        </span>
                                    </div>
                                    {formData.body_style_preference.length > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-white/50">Body styles</span>
                                            <span className="font-medium text-right max-w-[200px]">
                                                {formData.body_style_preference.join(', ')}
                                            </span>
                                        </div>
                                    )}
                                    {formData.active_shortlist.length > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-white/50">Considering</span>
                                            <span className="font-medium">{formData.active_shortlist.length} vehicle(s)</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/25 rounded-2xl p-5 flex items-start gap-4">
                                <FileText size={20} className="text-[#C9A84C] mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-medium text-white/90">Want to go deeper?</p>
                                    <p className="text-white/50 text-sm">
                                        Use the Buyer Mission worksheet in Stage 1 to define must-haves, dealbreakers, and detailed use cases.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-12 pt-8 border-t border-white/10">
                        {currentStep > 0 ? (
                            <button
                                type="button"
                                onClick={goBack}
                                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                            >
                                <ArrowLeft size={18} />
                                Back
                            </button>
                        ) : (
                            <div />
                        )}

                        {currentStep < STEPS.length - 1 ? (
                            <button
                                type="button"
                                onClick={goNext}
                                disabled={!canProceed()}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                                    canProceed()
                                        ? 'bg-[#C9A84C] text-[#0D0D12] hover:bg-[#D4B55C]'
                                        : 'bg-white/10 text-white/30 cursor-not-allowed'
                                }`}
                            >
                                Continue
                                <ArrowRight size={18} />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleComplete}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-[#C9A84C] text-[#0D0D12] hover:bg-[#D4B55C] transition-all disabled:opacity-60"
                            >
                                {saving ? 'Saving...' : "Let's get started"}
                                <ArrowRight size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
