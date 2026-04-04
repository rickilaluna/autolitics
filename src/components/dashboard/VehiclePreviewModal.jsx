import React, { useEffect, useState } from 'react';
import {
    X,
    CarFront,
    Loader2,
    Fuel,
    DollarSign,
    Tag,
    ShieldCheck,
    Star,
    Gauge,
    Ruler,
    Users,
    Award,
    Gem,
    TrendingUp,
    Package,
    Zap,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { lookupVehicleFullProfile, vehicleNameForLookup } from '../../lib/vehicleCatalogApi';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const fmt = (n) => (n != null ? `$${Number(n).toLocaleString()}` : null);
const num = (v) => (v != null ? Number(v) : null);
const stars = (n) => (n ? '\u2605'.repeat(n) + '\u2606'.repeat(5 - n) : null);

/** Pick the best available hero image from the profile/model. */
function heroImage(model) {
    return (
        model?.photo_url_front_34 ||
        model?.default_image_url ||
        null
    );
}

/** Compute a simple Best-in-Class / Hidden-Gem style badge from profile data. */
function intelligenceBadges(profile) {
    if (!profile) return [];
    const badges = [];

    // IIHS badge
    const iihs = profile.iihs_tsp_status;
    if (iihs === 'TSP+') badges.push({ label: 'IIHS Top Safety Pick+', color: 'emerald', icon: ShieldCheck });
    else if (iihs === 'TSP') badges.push({ label: 'IIHS Top Safety Pick', color: 'green', icon: ShieldCheck });

    // NHTSA 5-star
    if (num(profile.nhtsa_overall_stars) === 5)
        badges.push({ label: '5\u2605 NHTSA', color: 'amber', icon: Star });

    // High reliability
    const rel = num(profile.reliability_score_value);
    if (rel && rel >= 85) badges.push({ label: `Reliability: ${profile.reliability_summary_label || 'Excellent'}`, color: 'blue', icon: Award });

    // High ADI
    const adi = num(profile.eval_adi_score);
    if (adi && adi >= 80) badges.push({ label: `ADI ${adi}/100`, color: 'violet', icon: Gem });

    return badges;
}

const BADGE_COLORS = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    violet: 'bg-violet-50 text-violet-700 border-violet-200',
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionLabel({ icon: Icon, children }) {
    return (
        <h4 className="text-[10px] font-['JetBrains_Mono'] text-[#0D0D12]/40 uppercase tracking-[0.12em] flex items-center gap-1.5 mb-2">
            {Icon && <Icon size={11} />}
            {children}
        </h4>
    );
}

function StatCell({ label, value, unit, className = '' }) {
    if (value == null) return null;
    return (
        <div className={`text-center ${className}`}>
            <p className="text-[10px] font-['JetBrains_Mono'] text-[#0D0D12]/40 uppercase tracking-wider mb-0.5">
                {label}
            </p>
            <p className="text-sm font-semibold text-[#0D0D12] leading-tight">
                {value}
                {unit && <span className="text-[10px] font-normal text-[#0D0D12]/50 ml-0.5">{unit}</span>}
            </p>
        </div>
    );
}

function MiniBar({ value, max = 100, color = '#C9A84C' }) {
    const pct = Math.min(100, Math.max(0, ((num(value) || 0) / max) * 100));
    return (
        <div className="h-1.5 w-full bg-[#0D0D12]/5 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main Modal
// ---------------------------------------------------------------------------
export default function VehiclePreviewModal({ vehicleName, onClose }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const lookupKey = vehicleNameForLookup(vehicleName);

    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    useEffect(() => {
        if (!lookupKey) return;
        setLoading(true);
        lookupVehicleFullProfile(supabase, vehicleName)
            .then((result) => { setData(result); setLoading(false); })
            .catch((err) => { console.error('[VehiclePreviewModal]', err); setData(null); setLoading(false); });
    }, [vehicleName, lookupKey]);

    if (!lookupKey) return null;

    const p = data?.profile;
    const m = data?.model;
    const hero = heroImage(m);
    const badges = intelligenceBadges(p);

    // Pricing from profile
    const baseMsrp = num(p?.base_msrp);
    const topTrimMsrp = num(p?.top_trim_msrp);

    // Dimensions
    const seating = p?.seating_max || p?.seating_standard;
    const cargo = num(p?.max_cargo_cu_ft) || num(p?.cargo_behind_2nd_cu_ft);
    const towing = num(p?.towing_capacity_lbs);

    // Safety
    const nhtsaStars = num(p?.nhtsa_overall_stars);
    const iihs = p?.iihs_tsp_status;

    // Reliability
    const relScore = num(p?.reliability_score_value);
    const relLabel = p?.reliability_summary_label;

    // Evaluations
    const evalScores = p ? [
        { label: 'Space', value: num(p.eval_space_score) },
        { label: 'Comfort', value: num(p.eval_comfort_score) },
        { label: 'Efficiency', value: num(p.eval_efficiency_score) },
        { label: 'Durability', value: num(p.eval_durability_score) },
        { label: 'Usability', value: num(p.eval_usability_score) },
        { label: 'Tech', value: num(p.eval_software_technology_score) },
        { label: 'Value', value: num(p.eval_value_score) },
    ].filter((s) => s.value != null) : [];

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl animate-fade-in overflow-hidden max-h-[90vh] flex flex-col">

                {/* ---- Header with optional hero image ---- */}
                {hero && !loading && data && (
                    <div className="relative h-44 bg-[#F5F3EF] shrink-0 overflow-hidden">
                        <img
                            src={hero}
                            alt={`${m?.make} ${m?.model}`}
                            className="w-full h-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 p-2 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-white transition-colors text-[#0D0D12]/40 hover:text-[#0D0D12]"
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}

                {/* ---- Title bar ---- */}
                <div className={`flex items-center justify-between px-6 pt-${hero && !loading && data ? '3' : '6'} pb-3 shrink-0`}>
                    <div className="flex items-center gap-3 min-w-0">
                        {(!hero || loading || !data) && (
                            <div className="h-10 w-10 bg-[#C9A84C]/10 rounded-xl flex items-center justify-center shrink-0">
                                <CarFront size={20} className="text-[#C9A84C]" />
                            </div>
                        )}
                        <div className="min-w-0">
                            <h2 className="text-lg font-semibold tracking-tight text-[#0D0D12] truncate">
                                {m ? `${m.make} ${m.model}` : lookupKey}
                            </h2>
                            <div className="flex items-center gap-2">
                                {data?.targetYear && (
                                    <span className="text-xs text-[#0D0D12]/50 font-['JetBrains_Mono']">
                                        {data.targetYear} MY
                                    </span>
                                )}
                                {m?.segment && (
                                    <>
                                        <span className="text-[#0D0D12]/20">|</span>
                                        <span className="text-xs text-[#0D0D12]/50">{m.segment}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    {(!hero || loading || !data) && (
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-[#0D0D12]/5 transition-colors text-[#0D0D12]/40 hover:text-[#0D0D12]"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* ---- Body ---- */}
                <div className="px-6 pb-6 space-y-4 overflow-y-auto flex-1">

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 text-[#0D0D12]/40 gap-3">
                            <Loader2 className="animate-spin text-[#C9A84C]" size={28} />
                            <span className="text-xs font-['JetBrains_Mono']">Loading vehicle profile...</span>
                        </div>
                    ) : !data ? (
                        <div className="text-center py-12">
                            <p className="text-sm text-[#0D0D12]/50 mb-1">No match found in the vehicle database.</p>
                            <p className="text-xs text-[#0D0D12]/35 font-['JetBrains_Mono']">{`"${lookupKey}"`} may not be indexed yet.</p>
                        </div>
                    ) : (
                        <>
                            {/* Intelligence Badges */}
                            {badges.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {badges.map((b, i) => {
                                        const Icon = b.icon;
                                        return (
                                            <span
                                                key={i}
                                                className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border ${BADGE_COLORS[b.color]}`}
                                            >
                                                <Icon size={12} />
                                                {b.label}
                                            </span>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Summary */}
                            {m?.vehicle_summary && (
                                <p className="text-[13px] text-[#0D0D12]/65 leading-relaxed">{m.vehicle_summary}</p>
                            )}

                            {/* ---- Safety & Reliability row ---- */}
                            {(nhtsaStars || iihs || relScore) && (
                                <div className="bg-[#FAF8F5] border border-[#0D0D12]/5 rounded-2xl p-4">
                                    <SectionLabel icon={ShieldCheck}>Safety & Reliability</SectionLabel>
                                    <div className="grid grid-cols-3 gap-3">
                                        <StatCell label="NHTSA" value={nhtsaStars ? stars(nhtsaStars) : null} />
                                        <StatCell label="IIHS" value={iihs && iihs !== 'Not Rated' && iihs !== 'None' ? iihs : null} />
                                        <StatCell
                                            label="Reliability"
                                            value={relScore ? `${relScore}` : null}
                                            unit={relLabel ? `(${relLabel})` : null}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* ---- Pricing ---- */}
                            {(baseMsrp || topTrimMsrp) && (
                                <div className="bg-[#FAF8F5] border border-[#0D0D12]/5 rounded-2xl p-4">
                                    <SectionLabel icon={DollarSign}>Pricing</SectionLabel>
                                    <div className="grid grid-cols-2 gap-3">
                                        <StatCell label="Base MSRP" value={fmt(baseMsrp)} />
                                        <StatCell label="Top Trim" value={fmt(topTrimMsrp)} />
                                    </div>
                                </div>
                            )}

                            {/* ---- Key Specs row ---- */}
                            {(seating || cargo || towing) && (
                                <div className="bg-[#FAF8F5] border border-[#0D0D12]/5 rounded-2xl p-4">
                                    <SectionLabel icon={Ruler}>Key Specs</SectionLabel>
                                    <div className="grid grid-cols-3 gap-3">
                                        <StatCell label="Seating" value={seating} unit="pass." />
                                        <StatCell label="Cargo" value={cargo} unit="cu ft" />
                                        <StatCell label="Towing" value={towing ? `${(towing).toLocaleString()}` : null} unit={towing ? 'lbs' : null} />
                                    </div>
                                </div>
                            )}

                            {/* ---- Evaluation Scores ---- */}
                            {evalScores.length > 0 && (
                                <div className="bg-[#FAF8F5] border border-[#0D0D12]/5 rounded-2xl p-4">
                                    <SectionLabel icon={TrendingUp}>Autolitics Evaluation</SectionLabel>
                                    <div className="space-y-2">
                                        {evalScores.map((s) => (
                                            <div key={s.label} className="flex items-center gap-3">
                                                <span className="text-[11px] font-['JetBrains_Mono'] text-[#0D0D12]/50 w-16 shrink-0">
                                                    {s.label}
                                                </span>
                                                <div className="flex-1">
                                                    <MiniBar value={s.value} />
                                                </div>
                                                <span className="text-[11px] font-semibold text-[#0D0D12]/70 w-7 text-right">
                                                    {s.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ---- Powertrains ---- */}
                            {data.powertrains.length > 0 && (
                                <div>
                                    <SectionLabel icon={Zap}>Powertrains</SectionLabel>
                                    <div className="space-y-2">
                                        {data.powertrains.map((pt, i) => (
                                            <div
                                                key={i}
                                                className="bg-[#FAF8F5] border border-[#0D0D12]/5 rounded-2xl p-3.5"
                                            >
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <span className="text-sm font-semibold text-[#0D0D12]">{pt.name}</span>
                                                    {pt.horsepower_hp && (
                                                        <span className="text-xs font-['JetBrains_Mono'] text-[#0D0D12]/50">
                                                            {pt.horsepower_hp} hp
                                                        </span>
                                                    )}
                                                </div>
                                                {pt.engine_description && (
                                                    <p className="text-[11px] text-[#0D0D12]/45 mb-1.5">{pt.engine_description}</p>
                                                )}
                                                <div className="flex gap-4">
                                                    {pt.combined_mpg && (
                                                        <span className="text-xs text-[#0D0D12]/60">
                                                            <span className="font-semibold">{pt.combined_mpg}</span> MPG
                                                        </span>
                                                    )}
                                                    {pt.ev_range_miles && (
                                                        <span className="text-xs text-[#0D0D12]/60">
                                                            <span className="font-semibold">{pt.ev_range_miles}</span> mi EV
                                                        </span>
                                                    )}
                                                    {pt.transmission && (
                                                        <span className="text-xs text-[#0D0D12]/40">{pt.transmission}</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {data.powertrains.length === 0 && m?.powertrain_summary && (
                                <div>
                                    <SectionLabel icon={Zap}>Powertrain</SectionLabel>
                                    <p className="text-[13px] text-[#0D0D12]/60">{m.powertrain_summary}</p>
                                </div>
                            )}

                            {/* ---- Advisory notes ---- */}
                            {(m?.default_best_for || m?.default_tradeoffs) && (
                                <div className="border-t border-[#0D0D12]/5 pt-4 space-y-2">
                                    {m.default_best_for && (
                                        <div>
                                            <SectionLabel icon={Award}>Best For</SectionLabel>
                                            <p className="text-[13px] text-[#0D0D12]/60 leading-relaxed">{m.default_best_for}</p>
                                        </div>
                                    )}
                                    {m.default_tradeoffs && (
                                        <div>
                                            <SectionLabel icon={Gauge}>Tradeoffs</SectionLabel>
                                            <p className="text-[13px] text-[#0D0D12]/60 leading-relaxed">{m.default_tradeoffs}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ---- Expert Ratings ---- */}
                            {(p?.edmunds_rating || p?.car_and_driver_rating) && (
                                <div className="flex gap-3">
                                    {p.edmunds_rating && (
                                        <div className="flex-1 bg-[#FAF8F5] border border-[#0D0D12]/5 rounded-2xl p-3 text-center">
                                            <p className="text-[10px] font-['JetBrains_Mono'] text-[#0D0D12]/40 uppercase tracking-wider mb-0.5">Edmunds</p>
                                            <p className="text-lg font-semibold text-[#0D0D12]">{Number(p.edmunds_rating).toFixed(1)}<span className="text-xs font-normal text-[#0D0D12]/40">/10</span></p>
                                        </div>
                                    )}
                                    {p.car_and_driver_rating && (
                                        <div className="flex-1 bg-[#FAF8F5] border border-[#0D0D12]/5 rounded-2xl p-3 text-center">
                                            <p className="text-[10px] font-['JetBrains_Mono'] text-[#0D0D12]/40 uppercase tracking-wider mb-0.5">Car & Driver</p>
                                            <p className="text-lg font-semibold text-[#0D0D12]">{Number(p.car_and_driver_rating).toFixed(1)}<span className="text-xs font-normal text-[#0D0D12]/40">/10</span></p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* ---- Footer ---- */}
                <div className="px-6 pb-6 pt-2 shrink-0 border-t border-[#0D0D12]/5">
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-xl border border-[#0D0D12]/10 text-sm font-medium text-[#0D0D12] hover:bg-[#0D0D12]/5 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
