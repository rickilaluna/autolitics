import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User as UserIcon, Save, Loader2, ShieldCheck, BookOpen, Clock, CarFront, Plus, X } from 'lucide-react';
import VehicleAutocomplete from '../../components/VehicleAutocomplete';
import { getConsideringModelStrings, recordConsideringModel } from '../../lib/vehicleContextStorage';
import { useAuth } from '../../contexts/AuthContext';
import { useClientProfile } from '../../hooks/useClientProfile';
import { usePurchases } from '../../hooks/usePurchases';
import { useJourneyStatus } from '../../hooks/useJourneyStatus';
import ResourceHubCrosslinks from '../../components/dashboard/ResourceHubCrosslinks';
import VehiclePreviewModal from '../../components/dashboard/VehiclePreviewModal';

const PHASES = [
    { num: 1, label: 'Setup' },
    { num: 2, label: 'Strategy' },
    { num: 3, label: 'Evaluate' },
    { num: 4, label: 'Negotiate' },
];

const BUDGET_MIN = 0;
const BUDGET_MAX = 150000;
const BUDGET_STEP = 5000;

const formatBudget = (val) => {
    if (val >= 1000) return `$${Math.round(val / 1000)}K`;
    return `$${val}`;
};

// ── Static sub-components (defined outside render to preserve React identity) ──

const ReadOnlyField = ({ label, value }) => (
    <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#0D0D12]/5">
        <p className="text-xs text-[#0D0D12]/50 font-['JetBrains_Mono'] mb-1">{label}</p>
        <p className="font-medium text-sm">{value || '—'}</p>
    </div>
);

const TextInput = ({ label, value, onChange, type = 'text', placeholder }) => (
    <div>
        <label className="block text-xs text-[#0D0D12]/50 font-['JetBrains_Mono'] mb-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="studio-touch-input w-full bg-white border border-[#0D0D12]/20 rounded-xl px-4 py-2.5 text-sm text-[#0D0D12] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50"
        />
    </div>
);

const SelectInput = ({ label, value, onChange, options }) => (
    <div>
        <label className="block text-xs text-[#0D0D12]/50 font-['JetBrains_Mono'] mb-1">{label}</label>
        <select
            value={value}
            onChange={onChange}
            className="studio-touch-input w-full bg-white border border-[#0D0D12]/20 rounded-xl px-4 py-2.5 text-sm text-[#0D0D12] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50"
        >
            <option value="">—</option>
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
    </div>
);

const BudgetSlider = ({ min, max, onChange }) => {
    const pctLeft = ((min - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100;
    const pctRight = ((max - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100;

    return (
        <div className="sm:col-span-2">
            <label className="block text-xs text-[#0D0D12]/50 font-['JetBrains_Mono'] mb-3">Budget Range</label>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[#0D0D12]">{formatBudget(min)}</span>
                <span className="text-xs text-[#0D0D12]/40 font-['JetBrains_Mono']">to</span>
                <span className="text-sm font-semibold text-[#0D0D12]">{formatBudget(max)}{max >= BUDGET_MAX ? '+' : ''}</span>
            </div>
            <div className="relative h-10 flex items-center">
                {/* Track background */}
                <div className="absolute inset-x-0 h-2 bg-[#0D0D12]/10 rounded-full" />
                {/* Active track */}
                <div
                    className="absolute h-2 bg-[#C9A84C] rounded-full"
                    style={{ left: `${pctLeft}%`, right: `${100 - pctRight}%` }}
                />
                {/* Min thumb */}
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
                    className="absolute inset-x-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#0D0D12] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#0D0D12] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-grab"
                    style={{ zIndex: min > BUDGET_MAX - BUDGET_STEP * 2 ? 5 : 3 }}
                />
                {/* Max thumb */}
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
                    className="absolute inset-x-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#C9A84C] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#C9A84C] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-grab"
                    style={{ zIndex: 4 }}
                />
            </div>
        </div>
    );
};

function ProfileShortlistEditor({ form, setForm, contextRecent }) {
    const [draft, setDraft] = useState('');
    const add = () => {
        const t = draft.trim();
        if (!t) return;
        recordConsideringModel(t);
        setForm((prev) => ({
            ...prev,
            active_shortlist: [...(prev.active_shortlist || []), t],
        }));
        setDraft('');
    };
    const remove = (idx) => {
        setForm((prev) => ({
            ...prev,
            active_shortlist: (prev.active_shortlist || []).filter((_, i) => i !== idx),
        }));
    };
    const list = form.active_shortlist || [];
    return (
        <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
                <VehicleAutocomplete
                    value={draft}
                    onChange={setDraft}
                    contextRecent={contextRecent}
                    placeholder="Add a vehicle"
                    helperText=""
                    className="studio-touch-input flex-1 min-w-0 bg-white border border-[#0D0D12]/20 rounded-xl px-4 py-2.5 text-sm text-[#0D0D12]"
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
                    className="inline-flex items-center justify-center gap-1 bg-[#0D0D12] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1A1A24] shrink-0"
                >
                    <Plus size={16} /> Add
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                {list.map((car, idx) => (
                    <span
                        key={`${car}-${idx}`}
                        className="inline-flex items-center gap-2 bg-[#FAF8F5] border border-[#0D0D12]/10 px-3 py-1.5 rounded-lg text-sm text-[#0D0D12]"
                    >
                        <CarFront size={14} className="text-[#C9A84C] shrink-0" />
                        {car}
                        <button
                            type="button"
                            onClick={() => remove(idx)}
                            className="p-0.5 text-[#0D0D12]/40 hover:text-red-500 rounded"
                            aria-label="Remove"
                        >
                            <X size={14} />
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );
}

// ── Main component ──

const Profile = () => {
    const { user } = useAuth();
    const { profile, loading: profileLoading, updateProfile } = useClientProfile();
    const { loading: purchaseLoading, hasPurchasedAdvisory, hasPurchasedGuide } = usePurchases();
    const { currentPhase, nextStep } = useJourneyStatus({ profile, hasPurchasedAdvisory });

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({});
    const [previewVehicle, setPreviewVehicle] = useState(null);

    useEffect(() => {
        if (profile) {
            setForm({
                phone: profile.phone || '',
                pronouns: profile.pronouns || '',
                preferred_contact: profile.preferred_contact || 'email',
                location: profile.location || '',
                partner_name: profile.partner_name || '',
                partner_email: profile.partner_email || '',
                budget_min: profile.budget_min ?? 0,
                budget_max: profile.budget_max ?? 75000,
                body_style_preference: profile.body_style_preference || '',
                new_or_used: profile.new_or_used || '',
                buying_timeline: profile.buying_timeline || '',
                primary_goal: profile.primary_goal || '',
                trade_in_status: profile.trade_in_status || '',
                active_shortlist: Array.isArray(profile.active_shortlist) ? [...profile.active_shortlist] : [],
            });
        }
    }, [profile]);

    const profileContextRecent = useMemo(() => getConsideringModelStrings(), [form.active_shortlist]);

    const set = useCallback((field) => (e) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        await updateProfile(form);
        setSaving(false);
        setEditing(false);
    };

    if (profileLoading || purchaseLoading) {
        return (
            <div className="flex flex-col h-[400px] items-center justify-center text-[#0D0D12]/50 font-['JetBrains_Mono'] gap-4">
                <Loader2 className="w-8 h-8 text-[#C9A84C] animate-spin" />
                Loading profile...
            </div>
        );
    }

    const budgetDisplay = (profile?.budget_min != null && profile?.budget_max != null)
        ? `${formatBudget(profile.budget_min)} – ${formatBudget(profile.budget_max)}${profile.budget_max >= BUDGET_MAX ? '+' : ''}`
        : null;

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <header className="mb-2">
                <h1 className="text-3xl font-semibold tracking-tight text-[#0D0D12] mb-2">Profile</h1>
                <p className="text-[#0D0D12]/60 font-['JetBrains_Mono']">Your account, preferences, and engagement summary.</p>
            </header>

            {/* Account Card */}
            <div className="bg-white border border-[#0D0D12]/10 rounded-[2rem] p-8 shadow-sm">
                <div className="flex items-center gap-6 mb-6 pb-6 border-b border-[#0D0D12]/10">
                    <div className="bg-[#0D0D12]/5 w-16 h-16 rounded-full flex items-center justify-center shrink-0">
                        <UserIcon size={32} className="text-[#C9A84C]" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-2xl font-semibold truncate">
                            {profile?.primary_contact_name || `${user?.user_metadata?.first_name || ''} ${user?.user_metadata?.last_name || ''}`.trim() || 'Client'}
                        </h2>
                        <p className="text-[#0D0D12]/60 font-['JetBrains_Mono'] text-sm truncate">{user?.email}</p>
                        {profile?.pronouns && (
                            <p className="text-[#0D0D12]/40 text-xs mt-1">{profile.pronouns}</p>
                        )}
                    </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-3">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-xs font-semibold uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-green-500" /> Active Member
                    </span>
                    {hasPurchasedAdvisory && (
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#C9A84C]/10 text-[#C9A84C] rounded-full text-xs font-semibold uppercase tracking-wider">
                            <ShieldCheck size={14} /> Advisory Client
                        </span>
                    )}
                    {hasPurchasedGuide && (
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold uppercase tracking-wider">
                            <BookOpen size={14} /> Guide Owner
                        </span>
                    )}
                    {profile && (
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D0D12]/5 text-[#0D0D12]/70 rounded-full text-xs font-semibold uppercase tracking-wider">
                            <Clock size={14} /> Phase: {PHASES.find(p => p.num === currentPhase)?.label || 'Setup'}
                        </span>
                    )}
                </div>
            </div>

            {/* Contact & Preferences Card */}
            <div className="bg-white border border-[#0D0D12]/10 rounded-[2rem] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold tracking-tight text-[#0D0D12]">Contact & Preferences</h3>
                    {!editing ? (
                        <button onClick={() => setEditing(true)} className="text-sm font-medium text-[#C9A84C] hover:text-[#0D0D12] transition-colors">
                            Edit
                        </button>
                    ) : (
                        <div className="flex gap-3">
                            <button onClick={() => { setEditing(false); }} className="text-sm font-medium text-[#0D0D12]/50 hover:text-[#0D0D12] transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="inline-flex items-center gap-2 text-sm font-medium bg-[#0D0D12] text-white px-4 py-2 rounded-xl hover:bg-[#1A1A24] transition-colors disabled:opacity-50"
                            >
                                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                Save
                            </button>
                        </div>
                    )}
                </div>

                {editing ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <TextInput label="Phone" value={form.phone} onChange={set('phone')} type="tel" placeholder="(555) 555-1234" />
                        <SelectInput label="Pronouns" value={form.pronouns} onChange={set('pronouns')} options={[
                            { value: 'he/him', label: 'He / Him' },
                            { value: 'she/her', label: 'She / Her' },
                            { value: 'they/them', label: 'They / Them' },
                            { value: 'other', label: 'Other / Prefer not to say' },
                        ]} />
                        <SelectInput label="Preferred Contact" value={form.preferred_contact} onChange={set('preferred_contact')} options={[
                            { value: 'email', label: 'Email' },
                            { value: 'phone', label: 'Phone Call' },
                            { value: 'text', label: 'Text Message' },
                        ]} />
                        <TextInput label="Location" value={form.location} onChange={set('location')} placeholder="City, State" />

                        {/* Purchase Partner */}
                        <div className="sm:col-span-2 pt-4 border-t border-[#0D0D12]/10">
                            <p className="text-xs text-[#0D0D12]/50 font-['JetBrains_Mono'] uppercase tracking-wider mb-3">Purchase Partner</p>
                        </div>
                        <TextInput label="Partner Name" value={form.partner_name} onChange={set('partner_name')} placeholder="Name of co-buyer or spouse" />
                        <TextInput label="Partner Email" value={form.partner_email} onChange={set('partner_email')} type="email" placeholder="partner@email.com" />

                        {/* Vehicle Preferences */}
                        <div className="sm:col-span-2 pt-4 border-t border-[#0D0D12]/10">
                            <p className="text-xs text-[#0D0D12]/50 font-['JetBrains_Mono'] uppercase tracking-wider mb-3">Vehicle Preferences</p>
                        </div>
                        <BudgetSlider
                            min={form.budget_min}
                            max={form.budget_max}
                            onChange={(newMin, newMax) => setForm(prev => ({ ...prev, budget_min: newMin, budget_max: newMax }))}
                        />
                        <SelectInput label="Body Style" value={form.body_style_preference} onChange={set('body_style_preference')} options={[
                            { value: 'Sedan', label: 'Sedan' },
                            { value: 'SUV / Crossover', label: 'SUV / Crossover' },
                            { value: 'Truck', label: 'Truck' },
                            { value: 'Minivan', label: 'Minivan' },
                            { value: 'Coupe / Sports', label: 'Coupe / Sports' },
                            { value: 'Wagon / Hatchback', label: 'Wagon / Hatchback' },
                            { value: 'No Preference', label: 'No Preference' },
                        ]} />
                        <SelectInput label="New or Used" value={form.new_or_used} onChange={set('new_or_used')} options={[
                            { value: 'New', label: 'New' },
                            { value: 'Certified Pre-Owned', label: 'Certified Pre-Owned (CPO)' },
                            { value: 'Used', label: 'Used' },
                            { value: 'Open to All', label: 'Open to All' },
                        ]} />

                        {/* Search Context */}
                        <div className="sm:col-span-2 pt-4 border-t border-[#0D0D12]/10">
                            <p className="text-xs text-[#0D0D12]/50 font-['JetBrains_Mono'] uppercase tracking-wider mb-3">Search Context</p>
                        </div>
                        <SelectInput label="Buying Timeline" value={form.buying_timeline} onChange={set('buying_timeline')} options={[
                            { value: 'ASAP (1-2 Weeks)', label: 'ASAP (1-2 Weeks)' },
                            { value: 'Within 30 Days', label: 'Within 30 Days' },
                            { value: '3-6 Months', label: '3-6 Months' },
                            { value: 'Not sure yet', label: 'Not sure yet' },
                        ]} />
                        <SelectInput label="Primary Goal" value={form.primary_goal} onChange={set('primary_goal')} options={[
                            { value: 'Lowest Total Payment', label: 'Lowest overall cost/payment' },
                            { value: 'Specific Vehicle Acquisition', label: 'Finding a specific vehicle' },
                            { value: 'Best Trade-In Offset', label: 'Maximizing trade-in value' },
                            { value: 'Reliability & Family Hauling', label: 'Maximum safety & reliability' },
                            { value: 'Ev/Hybrid Economy', label: 'EV or Hybrid economy' },
                        ]} />
                        <SelectInput label="Trade-In Status" value={form.trade_in_status} onChange={set('trade_in_status')} options={[
                            { value: 'No Trade-In', label: 'No, straight purchase' },
                            { value: 'Yes, Finance Paid Off', label: 'Yes, paid off' },
                            { value: 'Yes, With Loan', label: 'Yes, with active loan' },
                            { value: 'Yes, Lease Return', label: 'Yes, lease maturity' },
                        ]} />

                        <div className="sm:col-span-2 pt-4 border-t border-[#0D0D12]/10">
                            <p className="text-xs text-[#0D0D12]/50 font-['JetBrains_Mono'] uppercase tracking-wider mb-3">Models considering</p>
                            <p className="text-xs text-[#0D0D12]/45 mb-3">Same catalog as the Decision Engine and OTD tools — suggestions include vehicles you&apos;ve entered elsewhere on this device.</p>
                            <ProfileShortlistEditor
                                form={form}
                                setForm={setForm}
                                contextRecent={profileContextRecent}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <ReadOnlyField label="Phone" value={profile?.phone} />
                        <ReadOnlyField label="Pronouns" value={profile?.pronouns} />
                        <ReadOnlyField label="Preferred Contact" value={profile?.preferred_contact} />
                        <ReadOnlyField label="Location" value={profile?.location} />
                        <ReadOnlyField label="Purchase Partner" value={
                            profile?.partner_name
                                ? `${profile.partner_name}${profile.partner_email ? ` (${profile.partner_email})` : ''}`
                                : null
                        } />
                        <ReadOnlyField label="Budget Range" value={budgetDisplay} />
                        <ReadOnlyField label="Body Style" value={profile?.body_style_preference} />
                        <ReadOnlyField label="New or Used" value={profile?.new_or_used} />
                        <ReadOnlyField label="Buying Timeline" value={profile?.buying_timeline} />
                        <ReadOnlyField label="Primary Goal" value={profile?.primary_goal} />
                        <ReadOnlyField label="Trade-In Status" value={profile?.trade_in_status} />
                    </div>
                )}
            </div>

            {/* Active Shortlist */}
            {profile?.active_shortlist?.length > 0 && (
                <div className="bg-white border border-[#0D0D12]/10 rounded-[2rem] p-8 shadow-sm">
                    <h3 className="text-lg font-semibold tracking-tight text-[#0D0D12] mb-4">Active Shortlist</h3>
                    <div className="flex flex-wrap gap-3">
                        {profile.active_shortlist.map((car, idx) => (
                            <button
                                key={idx}
                                onClick={() => setPreviewVehicle(car)}
                                className="bg-[#FAF8F5] border border-[#0D0D12]/10 px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 hover:border-[#C9A84C]/50 hover:bg-[#C9A84C]/5 transition-colors cursor-pointer"
                            >
                                <CarFront size={16} className="text-[#C9A84C]" />
                                {car}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <ResourceHubCrosslinks variant="compact" emphasizePhase={nextStep?.resourcePhase || null} />

            {/* Account Details */}
            <div className="bg-white border border-[#0D0D12]/10 rounded-[2rem] p-8 shadow-sm">
                <h3 className="text-lg font-semibold tracking-tight text-[#0D0D12] mb-4">Account</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ReadOnlyField label="Email" value={user?.email} />
                    <ReadOnlyField label="Member Since" value={user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'} />
                </div>
            </div>

            {previewVehicle && (
                <VehiclePreviewModal vehicleName={previewVehicle} onClose={() => setPreviewVehicle(null)} />
            )}
        </div>
    );
};

export default Profile;
