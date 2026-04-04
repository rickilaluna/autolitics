import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import {
    vPageNarrow,
    vTitle,
    vSubtitle,
    vLabel,
    vSectionTitle,
    vPanel,
    vPrimaryBtn,
    vInput,
} from '../../components/admin/adminVehicleUi';

const PowertrainDetail = () => {
    const { modelId, ptId } = useParams();
    const navigate = useNavigate();
    const isNew = ptId === 'new';

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    const [vehicleModel, setVehicleModel] = useState(null);
    const [powertrain, setPowertrain] = useState({
        name: '',
        engine_description: '',
        horsepower_hp: '',
        torque_lb_ft: '',
        transmission: '',
        city_mpg: '',
        highway_mpg: '',
        combined_mpg: '',
        ev_range_miles: '',
        zero_to_sixty_sec: '',
        towing_capacity_lbs: ''
    });

    useEffect(() => {
        fetchModelInfo();
        if (!isNew) {
            fetchPowertrainData();
        }
    }, [modelId, ptId]);

    const fetchModelInfo = async () => {
        const { data } = await supabase.from('vehicle_models').select('*').eq('id', modelId).single();
        if (data) setVehicleModel(data);
    };

    const fetchPowertrainData = async () => {
        const { data: pt } = await supabase.from('powertrain_specs').select('*').eq('id', ptId).single();
        if (pt) setPowertrain(pt);
        setLoading(false);
    };

    const handleSave = async () => {
        if (!powertrain.name) return alert("Validation Error: Please enter a Powertrain Name.");
        setSaving(true);
        try {
            const payload = { ...powertrain, vehicle_model_id: modelId };
            // Filter out empty string numbers to NULL
            Object.keys(payload).forEach(key => {
                if (payload[key] === '') payload[key] = null;
            });

            if (isNew) {
                const { error } = await supabase.from('powertrain_specs').insert([payload]);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('powertrain_specs').update(payload).eq('id', ptId);
                if (error) throw error;
            }

            navigate(`/admin/vehicles/${modelId}`);
        } catch (error) {
            console.error(error);
            alert("Error saving powertrain");
        }
        setSaving(false);
    };

    const renderInput = (state, setState, field, label, type = 'text', placeholder = '', required = false) => (
        <div>
            <label className={vLabel}>{label}</label>
            <input
                required={required}
                type={type}
                value={state[field] || ''}
                onChange={e => setState({ ...state, [field]: e.target.value })}
                className={vInput}
                placeholder={placeholder}
            />
        </div>
    );

    if (loading) {
        return (
            <div className={`${vPageNarrow} flex justify-center py-24`}>
                <Loader2 className="animate-spin text-[#C9A84C]/60" size={32} />
            </div>
        );
    }

    return (
        <div className={vPageNarrow}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-8">
                <div className="flex items-start gap-4">
                    <Link
                        to={`/admin/vehicles/${modelId}`}
                        className="p-2.5 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5]/80 hover:border-[#C9A84C]/40 hover:text-[#C9A84C] transition-colors shrink-0"
                    >
                        <ArrowLeft size={22} />
                    </Link>
                    <div>
                        <p className="text-xs font-['JetBrains_Mono'] text-[#FAF8F5]/40 uppercase tracking-widest mb-1">Powertrain</p>
                        <h1 className={vTitle}>{isNew ? 'New powertrain' : 'Edit powertrain'}</h1>
                        {vehicleModel && <p className={vSubtitle}>{vehicleModel.make} {vehicleModel.model}</p>}
                    </div>
                </div>
                <button type="button" onClick={handleSave} disabled={saving} className={`${vPrimaryBtn} shrink-0`}>
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    <span>Save powertrain</span>
                </button>
            </div>

            <div className={`${vPanel} p-6 sm:p-8 space-y-10`}>
                <div>
                    <h2 className={vSectionTitle}>Core identity</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {renderInput(powertrain, setPowertrain, 'name', 'Powertrain Name', 'text', 'e.g., Hybrid MAX', true)}
                        {renderInput(powertrain, setPowertrain, 'engine_description', 'Engine Description', 'text', '2.4L Turbo Hybrid')}
                        {renderInput(powertrain, setPowertrain, 'transmission', 'Transmission')}
                    </div>
                </div>

                <div className="border-t border-[#2A2A35] pt-8">
                    <h2 className={vSectionTitle}>Output</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {renderInput(powertrain, setPowertrain, 'horsepower_hp', 'Horsepower (HP)', 'number')}
                        {renderInput(powertrain, setPowertrain, 'torque_lb_ft', 'Torque (lb-ft)', 'number')}
                        {renderInput(powertrain, setPowertrain, 'zero_to_sixty_sec', '0-60 Time (s)', 'number')}
                    </div>
                </div>

                <div className="border-t border-[#2A2A35] pt-8">
                    <h2 className={vSectionTitle}>Efficiency</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {renderInput(powertrain, setPowertrain, 'city_mpg', 'City MPG', 'number')}
                        {renderInput(powertrain, setPowertrain, 'highway_mpg', 'Highway MPG', 'number')}
                        {renderInput(powertrain, setPowertrain, 'combined_mpg', 'Combined MPG', 'number')}
                        {renderInput(powertrain, setPowertrain, 'ev_range_miles', 'EV Range (Miles)', 'number')}
                        {renderInput(powertrain, setPowertrain, 'towing_capacity_lbs', 'Towing (lbs)', 'number')}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PowertrainDetail;
