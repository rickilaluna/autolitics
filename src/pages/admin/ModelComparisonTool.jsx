import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Car } from 'lucide-react';
import SpecComparisonTable from '../../components/SpecComparisonTable';
import { useVehicleConfigCatalog } from '../../hooks/useVehicleConfigCatalog';
import { VehicleConfigCombobox } from '../../components/vehicles';

export default function ModelComparisonTool() {
    const { profiles: allConfigs, loading: loadingMeta } = useVehicleConfigCatalog(supabase);

    const [configIds, setConfigIds] = useState(['', '', '']);
    const [profileRows, setProfileRows] = useState([]);
    const [powertrainRows, setPowertrainRows] = useState([]);
    const [loadingCompare, setLoadingCompare] = useState(false);

    const selectedConfigIds = useMemo(
        () => configIds.filter(Boolean),
        [configIds]
    );

    useEffect(() => {
        if (selectedConfigIds.length === 0) {
            setProfileRows([]);
            setPowertrainRows([]);
            return;
        }
        setLoadingCompare(true);
        const run = async () => {
            const { data: profileData, error: profileError } = await supabase
                .from('v_vehicle_config_profile')
                .select('*')
                .in('vehicle_config_id', selectedConfigIds);

            if (profileError) {
                setLoadingCompare(false);
                return;
            }

            const byId = {};
            (profileData || []).forEach((row) => {
                byId[row.vehicle_config_id] = row;
            });
            const ordered = selectedConfigIds.map((id) => byId[id]).filter(Boolean);
            setProfileRows(ordered);

            const modelIds = [...new Set(ordered.map((r) => r.vehicle_model_id).filter(Boolean))];
            if (modelIds.length === 0) {
                setPowertrainRows([]);
                setLoadingCompare(false);
                return;
            }

            const { data: ptData } = await supabase
                .from('powertrain_specs')
                .select('*')
                .in('vehicle_model_id', modelIds);

            const sorted = [...(ptData || [])].sort((a, b) =>
                (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' })
            );
            const firstByModel = {};
            sorted.forEach((row) => {
                const mid = row.vehicle_model_id;
                if (mid && !firstByModel[mid]) firstByModel[mid] = row;
            });

            setPowertrainRows(
                ordered.map((row) => firstByModel[row.vehicle_model_id] || {})
            );
            setLoadingCompare(false);
        };
        run();
    }, [selectedConfigIds.join(',')]);

    const vehicles = useMemo(() => {
        if (profileRows.length === 0) return [];
        return profileRows.map((row, i) => {
            const pt = powertrainRows[i] || {};
            const yr = row.model_year != null ? row.model_year : '';
            const lbl = row.config_label || 'Representative';
            const label = `${row.make} ${row.model} (${yr} · ${lbl})`;
            const data = {
                ...row,
                ...pt,
            };
            return { label, data };
        });
    }, [profileRows, powertrainRows]);

    const setSlotConfig = (slotIndex, id) => {
        setConfigIds((prev) => prev.map((v, i) => (i === slotIndex ? id : v)));
    };

    return (
        <div className="p-6 max-w-6xl">
            <div className="flex items-center gap-3 mb-8">
                <Car className="text-[#C9A84C]" size={28} />
                <div>
                    <h1 className="text-2xl font-bold text-[#FAF8F5]">Model Comparison Tool</h1>
                    <p className="text-sm text-[#FAF8F5]/60">
                        Search by make, model, model year, and config label (same catalog as engagement
                        shortlists). Trim-level MSRP lives on each config&apos;s pricing record.
                    </p>
                </div>
            </div>

            {loadingMeta ? (
                <div className="flex items-center gap-2 text-[#FAF8F5]/60 py-8">
                    <Loader2 className="animate-spin" size={20} />
                    Loading vehicle configurations…
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        {[0, 1, 2].map((slot) => (
                            <div
                                key={slot}
                                className="rounded-xl border border-[#2A2A35] bg-[#14141B] p-5"
                            >
                                <div className="text-xs font-semibold text-[#C9A84C]/80 uppercase tracking-wider mb-3">
                                    Vehicle {slot + 1}
                                </div>
                                <label className="block text-sm text-[#FAF8F5]/70 mb-2">
                                    Configuration
                                </label>
                                <VehicleConfigCombobox
                                    configs={allConfigs}
                                    value={configIds[slot]}
                                    onChange={(id) => setSlotConfig(slot, id)}
                                    placeholder="Search make, model, year, config…"
                                />
                            </div>
                        ))}
                    </div>

                    {loadingCompare ? (
                        <div className="flex items-center gap-2 text-[#FAF8F5]/60 py-6">
                            <Loader2 className="animate-spin" size={20} />
                            Loading comparison…
                        </div>
                    ) : (
                        <SpecComparisonTable vehicles={vehicles} />
                    )}
                </>
            )}
        </div>
    );
}
