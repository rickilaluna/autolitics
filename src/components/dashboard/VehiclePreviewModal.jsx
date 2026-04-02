import React, { useEffect, useState } from 'react';
import { X, CarFront, Loader2, Fuel, DollarSign, Tag, Layers } from 'lucide-react';
import { supabase } from '../../lib/supabase';

/**
 * Attempt to match a free-text vehicle name (e.g. "2025 Toyota RAV4 Prime")
 * to a vehicle_models row. Strategy: ilike search on make || model.
 */
async function lookupVehicle(vehicleName) {
    const cleaned = vehicleName.trim();
    // Strip a leading 4-digit year if present
    const yearMatch = cleaned.match(/^(20\d{2})\s+/);
    const hintYear = yearMatch ? parseInt(yearMatch[1], 10) : null;
    const nameWithoutYear = yearMatch ? cleaned.slice(yearMatch[0].length) : cleaned;

    // Try to find a model where make + ' ' + model is contained in the search string (or vice-versa)
    const { data: models } = await supabase
        .from('vehicle_models')
        .select('id, make, model, segment, vehicle_summary, default_image_url, powertrain_summary, default_trim_guidance')
        .or(`model.ilike.%${nameWithoutYear}%`)
        .limit(10);

    if (!models || models.length === 0) return null;

    // Rank: prefer exact "make model" match
    const best = models.find(m =>
        nameWithoutYear.toLowerCase().includes(`${m.make} ${m.model}`.toLowerCase())
    ) || models.find(m =>
        nameWithoutYear.toLowerCase().includes(m.model.toLowerCase())
    ) || models[0];

    // Fetch configs with MSRP
    const { data: configs } = await supabase
        .from('vehicle_configs')
        .select('id, model_year, config_label, powertrain_category, drivetrain')
        .eq('vehicle_model_id', best.id)
        .order('model_year', { ascending: false });

    // If we have a year hint, prefer configs from that year
    const relevantConfigs = configs || [];
    const targetYear = hintYear || relevantConfigs[0]?.model_year;

    // Fetch MSRP specs for all configs
    const configIds = relevantConfigs.map(c => c.id);
    let msrpSpecs = [];
    if (configIds.length > 0) {
        const { data } = await supabase
            .from('msrp_specs')
            .select('vehicle_config_id, base_msrp, top_trim_msrp, trim_levels_json')
            .in('vehicle_config_id', configIds);
        msrpSpecs = data || [];
    }

    // Fetch powertrains
    const { data: powertrains } = await supabase
        .from('powertrain_specs')
        .select('name, engine_description, horsepower_hp, combined_mpg, ev_range_miles, transmission')
        .eq('vehicle_model_id', best.id);

    return {
        model: best,
        configs: relevantConfigs,
        targetYear,
        msrpSpecs,
        powertrains: powertrains || [],
    };
}

export default function VehiclePreviewModal({ vehicleName, onClose }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    useEffect(() => {
        if (!vehicleName) return;
        setLoading(true);
        lookupVehicle(vehicleName).then(result => {
            setData(result);
            setLoading(false);
        });
    }, [vehicleName]);

    if (!vehicleName) return null;

    const formatPrice = (n) => n ? `$${n.toLocaleString()}` : null;

    // Build trim list from the target-year config's msrp data
    const targetConfig = data?.configs?.find(c => c.model_year === data.targetYear);
    const msrp = targetConfig ? data?.msrpSpecs?.find(m => m.vehicle_config_id === targetConfig.id) : null;
    const trimList = msrp?.trim_levels_json; // JSONB array of {name, msrp} objects (may be null)

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl animate-fade-in overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-4 border-b border-[#0D0D12]/10 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 bg-[#C9A84C]/10 rounded-xl flex items-center justify-center shrink-0">
                            <CarFront size={20} className="text-[#C9A84C]" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-lg font-semibold tracking-tight text-[#0D0D12] truncate">
                                {data?.model ? `${data.model.make} ${data.model.model}` : vehicleName}
                            </h2>
                            {data?.targetYear && (
                                <p className="text-xs text-[#0D0D12]/50 font-['JetBrains_Mono']">{data.targetYear} Model Year</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-[#0D0D12]/5 transition-colors text-[#0D0D12]/40 hover:text-[#0D0D12]"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-[#0D0D12]/40 gap-3">
                            <Loader2 className="animate-spin text-[#C9A84C]" size={28} />
                            <span className="text-xs font-['JetBrains_Mono']">Looking up vehicle...</span>
                        </div>
                    ) : !data ? (
                        <div className="text-center py-8">
                            <p className="text-sm text-[#0D0D12]/50 mb-1">No match found in the vehicle database.</p>
                            <p className="text-xs text-[#0D0D12]/35 font-['JetBrains_Mono']">"{vehicleName}" may not be indexed yet.</p>
                        </div>
                    ) : (
                        <>
                            {/* Segment Badge */}
                            {data.model.segment && (
                                <div className="flex items-center gap-2">
                                    <Tag size={14} className="text-[#0D0D12]/30" />
                                    <span className="text-xs font-['JetBrains_Mono'] text-[#0D0D12]/50 uppercase tracking-wider">Segment</span>
                                    <span className="ml-auto bg-[#0D0D12]/5 text-[#0D0D12] text-xs font-semibold px-3 py-1 rounded-full">{data.model.segment}</span>
                                </div>
                            )}

                            {/* Vehicle Summary */}
                            {data.model.vehicle_summary && (
                                <div>
                                    <h4 className="text-xs font-['JetBrains_Mono'] text-[#0D0D12]/40 uppercase tracking-widest mb-2">Summary</h4>
                                    <p className="text-sm text-[#0D0D12]/70 leading-relaxed">{data.model.vehicle_summary}</p>
                                </div>
                            )}

                            {/* Trims & MSRPs */}
                            <div>
                                <h4 className="text-xs font-['JetBrains_Mono'] text-[#0D0D12]/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <DollarSign size={12} /> Trims & Pricing
                                </h4>
                                {trimList && trimList.length > 0 ? (
                                    <div className="space-y-1.5">
                                        {trimList.map((trim, i) => (
                                            <div key={i} className="flex items-center justify-between bg-[#FAF8F5] border border-[#0D0D12]/5 rounded-xl px-4 py-2.5">
                                                <span className="text-sm font-medium text-[#0D0D12]">{trim.name || trim.trim || trim.label}</span>
                                                <span className="text-sm font-semibold text-[#0D0D12] font-['JetBrains_Mono']">
                                                    {formatPrice(trim.msrp || trim.price) || '—'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : msrp ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-[#FAF8F5] border border-[#0D0D12]/5 rounded-xl p-3">
                                            <p className="text-[10px] font-['JetBrains_Mono'] text-[#0D0D12]/40 uppercase tracking-wider mb-1">Base MSRP</p>
                                            <p className="text-sm font-semibold text-[#0D0D12]">{formatPrice(msrp.base_msrp) || '—'}</p>
                                        </div>
                                        <div className="bg-[#FAF8F5] border border-[#0D0D12]/5 rounded-xl p-3">
                                            <p className="text-[10px] font-['JetBrains_Mono'] text-[#0D0D12]/40 uppercase tracking-wider mb-1">Top Trim MSRP</p>
                                            <p className="text-sm font-semibold text-[#0D0D12]">{formatPrice(msrp.top_trim_msrp) || '—'}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-[#0D0D12]/40">No pricing data available yet.</p>
                                )}
                            </div>

                            {/* Powertrains */}
                            {data.powertrains.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-['JetBrains_Mono'] text-[#0D0D12]/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Fuel size={12} /> Powertrains
                                    </h4>
                                    <div className="space-y-2">
                                        {data.powertrains.map((pt, i) => (
                                            <div key={i} className="bg-[#FAF8F5] border border-[#0D0D12]/5 rounded-xl p-4">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-semibold text-[#0D0D12]">{pt.name}</span>
                                                    {pt.horsepower_hp && (
                                                        <span className="text-xs font-['JetBrains_Mono'] text-[#0D0D12]/50">{pt.horsepower_hp} hp</span>
                                                    )}
                                                </div>
                                                {pt.engine_description && (
                                                    <p className="text-xs text-[#0D0D12]/50 mb-1">{pt.engine_description}</p>
                                                )}
                                                <div className="flex gap-4 mt-2">
                                                    {pt.combined_mpg && (
                                                        <span className="text-xs text-[#0D0D12]/60">
                                                            <span className="font-semibold">{pt.combined_mpg}</span> MPG combined
                                                        </span>
                                                    )}
                                                    {pt.ev_range_miles && (
                                                        <span className="text-xs text-[#0D0D12]/60">
                                                            <span className="font-semibold">{pt.ev_range_miles}</span> mi EV range
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

                            {/* Powertrain Summary fallback (if no detailed specs) */}
                            {data.powertrains.length === 0 && data.model.powertrain_summary && (
                                <div>
                                    <h4 className="text-xs font-['JetBrains_Mono'] text-[#0D0D12]/40 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Fuel size={12} /> Powertrain
                                    </h4>
                                    <p className="text-sm text-[#0D0D12]/60">{data.model.powertrain_summary}</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
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
