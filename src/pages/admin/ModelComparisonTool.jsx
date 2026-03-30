import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Car } from 'lucide-react';
import SpecComparisonTable from '../../components/SpecComparisonTable';

export default function ModelComparisonTool() {
    const [makes, setMakes] = useState([]);
    const [modelsByMake, setModelsByMake] = useState({});
    const [loadingMeta, setLoadingMeta] = useState(true);

    const [selections, setSelections] = useState([
        { makeId: '', modelId: '' },
        { makeId: '', modelId: '' },
        { makeId: '', modelId: '' },
    ]);
    const [profileRows, setProfileRows] = useState([]);
    const [powertrainRows, setPowertrainRows] = useState([]);
    const [loadingCompare, setLoadingCompare] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            const { data: models, error } = await supabase
                .from('vehicle_models')
                .select('id, make, model')
                .order('make')
                .order('model');
            if (error) {
                setLoadingMeta(false);
                return;
            }
            const makeSet = new Set((models || []).map((m) => m.make));
            const makeList = Array.from(makeSet).sort();
            setMakes(makeList);
            const byMake = {};
            (models || []).forEach((m) => {
                if (!byMake[m.make]) byMake[m.make] = [];
                byMake[m.make].push(m);
            });
            setModelsByMake(byMake);
            setLoadingMeta(false);
        };
        fetch();
    }, []);

    const selectedModelIds = useMemo(
        () => selections.map((s) => s.modelId).filter(Boolean),
        [selections]
    );

    useEffect(() => {
        if (selectedModelIds.length === 0) {
            setProfileRows([]);
            setPowertrainRows([]);
            return;
        }
        setLoadingCompare(true);
        const run = async () => {
            const { data: profileData, error: profileError } = await supabase
                .from('v_vehicle_config_profile')
                .select('*')
                .in('vehicle_model_id', selectedModelIds)
                .order('model_year', { ascending: false });

            if (profileError) {
                setLoadingCompare(false);
                return;
            }

            const byModel = {};
            (profileData || []).forEach((row) => {
                const id = row.vehicle_model_id;
                if (!byModel[id] || row.model_year > (byModel[id].model_year || 0)) {
                    byModel[id] = row;
                }
            });
            const onePerModel = selectedModelIds
                .map((id) => byModel[id])
                .filter(Boolean);

            setProfileRows(onePerModel);

            const configIds = onePerModel.map((r) => r.vehicle_config_id).filter(Boolean);
            if (configIds.length === 0) {
                setPowertrainRows([]);
                setLoadingCompare(false);
                return;
            }

            const { data: ptData } = await supabase
                .from('powertrain_specs')
                .select('*')
                .in('vehicle_config_id', configIds);

            const ptByConfig = {};
            (ptData || []).forEach((row) => {
                ptByConfig[row.vehicle_config_id] = row;
            });
            setPowertrainRows(
                onePerModel.map((row) => ptByConfig[row.vehicle_config_id] || {})
            );
            setLoadingCompare(false);
        };
        run();
    }, [selectedModelIds.join(',')]);

    const vehicles = useMemo(() => {
        if (profileRows.length === 0) return [];
        return profileRows.map((row, i) => {
            const pt = powertrainRows[i] || {};
            const label = `${row.make} ${row.model}`;
            const data = {
                ...row,
                ...pt,
            };
            return { label, data };
        });
    }, [profileRows, powertrainRows]);

    const setSelection = (slotIndex, key, value) => {
        setSelections((prev) => {
            const next = prev.map((s, i) =>
                i === slotIndex ? { ...s, [key]: value } : s
            );
            if (key === 'make') {
                next[slotIndex].modelId = '';
            }
            return next;
        });
    };

    return (
        <div className="p-6 max-w-6xl">
            <div className="flex items-center gap-3 mb-8">
                <Car className="text-[#C9A84C]" size={28} />
                <div>
                    <h1 className="text-2xl font-bold text-[#FAF8F5]">Model Comparison Tool</h1>
                    <p className="text-sm text-[#FAF8F5]/60">
                        Compare key specs for up to 3 models. Select make, then model.
                    </p>
                </div>
            </div>

            {loadingMeta ? (
                <div className="flex items-center gap-2 text-[#FAF8F5]/60 py-8">
                    <Loader2 className="animate-spin" size={20} />
                    Loading makes and models…
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
                                <div className="space-y-3">
                                    <label className="block text-sm text-[#FAF8F5]/70">Make</label>
                                    <select
                                        value={selections[slot].make}
                                        onChange={(e) =>
                                            setSelection(slot, 'make', e.target.value)
                                        }
                                        className="w-full px-4 py-2.5 rounded-lg border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]"
                                    >
                                        <option value="">Select make</option>
                                        {makes.map((make) => (
                                            <option key={make} value={make}>
                                                {make}
                                            </option>
                                        ))}
                                    </select>
                                    <label className="block text-sm text-[#FAF8F5]/70">Model</label>
                                    <select
                                        value={selections[slot].modelId}
                                        onChange={(e) =>
                                            setSelection(slot, 'modelId', e.target.value)
                                        }
                                        disabled={!selections[slot].make}
                                        className="w-full px-4 py-2.5 rounded-lg border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:ring-2 focus:ring-[#C9A84C]/30 disabled:opacity-50"
                                    >
                                        <option value="">Select model</option>
                                        {(modelsByMake[selections[slot].make] || []).map((m) => (
                                            <option key={m.id} value={m.id}>
                                                {m.model}
                                            </option>
                                        ))}
                                    </select>
                                </div>
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