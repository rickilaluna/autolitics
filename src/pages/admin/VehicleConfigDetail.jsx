/* eslint-env browser */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Save, Loader2, LayoutDashboard, TrendingUp, Star } from 'lucide-react';
import {
    vPage,
    vTitle,
    vSubtitle,
    vLabel,
    vSectionTitle,
    vPanel,
    vPrimaryBtn,
    vTabBtn,
    vInput,
    vSelect,
} from '../../components/admin/adminVehicleUi';

const TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'market', label: 'Market Context', icon: TrendingUp },
    { id: 'evaluations', label: 'Evaluation Scores', icon: Star }
];

const VehicleConfigDetail = () => {
    const { modelId, configId } = useParams();
    const navigate = useNavigate();
    const isNew = configId === 'new';

    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    const [vehicleModel, setVehicleModel] = useState(null);

    // Form data states for each DB table
    const [overview, setOverview] = useState({ model_year: new Date().getFullYear(), config_label: 'Representative', powertrain_category: '', drivetrain: '', seating_standard: '', seating_max: '', config_notes: '' });
    const [market, setMarket] = useState({ type: 'used', region: '', mileage_band: '', price_low: '', price_mid: '', price_high: '', notes: '' });
    const [evaluations, setEvaluations] = useState({ space_score: '', usability_score: '', efficiency_score: '', durability_score: '', comfort_score: '', software_technology_score: '', value_score: '', autolitics_design_index: '', overall_profile_notes: '' });

    // Spec IDs for updating existing records
    const [specIds, setSpecIds] = useState({ market: null, evaluations: null });

    useEffect(() => {
        fetchModelInfo();
        if (!isNew) {
            fetchConfigData();
        }
    }, [modelId, configId]);

    const fetchModelInfo = async () => {
        const { data } = await supabase.from('vehicle_models').select('*').eq('id', modelId).single();
        if (data) setVehicleModel(data);
    };

    const fetchConfigData = async () => {
        const { data: config } = await supabase.from('vehicle_configs').select('*').eq('id', configId).single();
        if (config) setOverview(config);

        const { data: mkt } = await supabase.from('market_snapshots').select('*').eq('vehicle_config_id', configId).order('snapshot_date', { ascending: false }).limit(1).single();
        if (mkt) { setMarket(mkt); setSpecIds(prev => ({ ...prev, market: mkt.id })); }

        const { data: evals } = await supabase.from('vehicle_evaluations').select('*').eq('vehicle_config_id', configId).single();
        if (evals) { setEvaluations(evals); setSpecIds(prev => ({ ...prev, evaluations: evals.id })); }

        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            let savedConfigId = configId;

            // 1. Save Config (Overview)
            if (isNew) {
                const { data, error } = await supabase.from('vehicle_configs').insert([{ ...overview, vehicle_model_id: modelId }]).select().single();
                if (error) throw error;
                savedConfigId = data.id;
            } else {
                await supabase.from('vehicle_configs').update(overview).eq('id', savedConfigId);
            }

            // Helper to save related specs
            const saveSpec = async (table, data, specId) => {
                const payload = { ...data, vehicle_config_id: savedConfigId };
                // Filter out empty string numbers to NULL
                Object.keys(payload).forEach(key => {
                    if (payload[key] === '') payload[key] = null;
                });

                if (specId) {
                    await supabase.from(table).update(payload).eq('id', specId);
                } else if (Object.keys(data).some(k => data[k] !== '' && data[k] !== null && k !== 'source_name' && k !== 'iihs_tsp_status' && k !== 'type')) {
                    // Only insert if there's actual data
                    await supabase.from(table).insert([payload]);
                }
            };

            await Promise.all([
                saveSpec('market_snapshots', market, specIds.market),
                saveSpec('vehicle_evaluations', evaluations, specIds.evaluations)
            ]);

            navigate(`/admin/vehicles/${modelId}`);
        } catch (error) {
            console.error(error);
            alert("Error saving configuration");
        }
        setSaving(false);
    };

    // Render helpers
    const renderInput = (state, setState, field, label, type = 'text', placeholder = '') => (
        <div>
            <label className={vLabel}>{label}</label>
            <input
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
            <div className={`${vPage} flex justify-center py-24`}>
                <Loader2 className="animate-spin text-[#C9A84C]/60" size={32} />
            </div>
        );
    }

    return (
        <div className={vPage}>
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
                <div className="flex items-start gap-4">
                    <Link
                        to={`/admin/vehicles/${modelId}`}
                        className="p-2.5 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5]/80 hover:border-[#C9A84C]/40 hover:text-[#C9A84C] transition-colors shrink-0"
                    >
                        <ArrowLeft size={22} />
                    </Link>
                    <div>
                        <p className="text-xs font-['JetBrains_Mono'] text-[#FAF8F5]/40 uppercase tracking-widest mb-1">Configuration</p>
                        <h1 className={vTitle}>{isNew ? 'New configuration' : 'Edit configuration'}</h1>
                        {vehicleModel && <p className={vSubtitle}>{vehicleModel.make} {vehicleModel.model}</p>}
                    </div>
                </div>
                <button type="button" onClick={handleSave} disabled={saving} className={`${vPrimaryBtn} self-start`}>
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    <span>Save configuration</span>
                </button>
            </div>

            <div className="flex flex-col xl:flex-row gap-8">
                {/* Tabs Sidebar */}
                <div className="w-full xl:w-56 shrink-0 flex flex-row xl:flex-col gap-2 overflow-x-auto pb-2 xl:pb-0 -mx-1 px-1">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={vTabBtn(isActive)}
                            >
                                <Icon size={20} className={isActive ? 'text-[#C9A84C]' : 'text-[#FAF8F5]/35'} />
                                <span className="font-medium">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Main Content Area */}
                <div className={`flex-1 ${vPanel} p-6 sm:p-8 min-h-[560px]`}>

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className={vSectionTitle}>Core identity</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {renderInput(overview, setOverview, 'model_year', 'Model Year', 'number')}
                                {renderInput(overview, setOverview, 'config_label', 'Config Label (e.g. Representative, Performance)')}
                                {renderInput(overview, setOverview, 'powertrain_category', 'Powertrain Category', 'text', 'Gas, Hybrid, PHEV, EV')}
                                {renderInput(overview, setOverview, 'drivetrain', 'Drivetrain', 'text', 'FWD, RWD, AWD, 4WD')}
                                {renderInput(overview, setOverview, 'seating_standard', 'Standard Seating', 'number')}
                                {renderInput(overview, setOverview, 'seating_max', 'Max Seating', 'number')}
                            </div>
                            <div>
                                <label className={vLabel}>Config notes</label>
                                <textarea value={overview.config_notes || ''} onChange={e => setOverview({ ...overview, config_notes: e.target.value })} rows={3} className={`${vInput} resize-none min-h-[5rem]`} placeholder="Internal notes about this config..." />
                            </div>
                        </div>
                    )}

                    {/* MARKET TAB */}
                    {activeTab === 'market' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-2xl font-bold mb-6">Market Snapshot</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1 font-sans">Market Type</label>
                                    <select value={market.type || 'used'} onChange={e => setMarket({ ...market, type: e.target.value })} className="studio-touch-input w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 font-sans">
                                        <option value="new">New</option>
                                        <option value="cpo">CPO</option>
                                        <option value="used">Used</option>
                                    </select>
                                </div>
                                {renderInput(market, setMarket, 'mileage_band', 'Mileage Band', 'text', '10k - 30k')}
                                {renderInput(market, setMarket, 'region', 'Region', 'text', 'National')}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {renderInput(market, setMarket, 'price_low', 'Price Low ($)', 'number')}
                                {renderInput(market, setMarket, 'price_mid', 'Price Mid ($)', 'number')}
                                {renderInput(market, setMarket, 'price_high', 'Price High ($)', 'number')}
                            </div>
                            <div>
                                <label className={vLabel}>Market notes</label>
                                <textarea value={market.notes || ''} onChange={e => setMarket({ ...market, notes: e.target.value })} rows={2} className={`${vInput} resize-none min-h-[4.5rem]`} placeholder="Supply constraints pushing used prices up..." />
                            </div>
                        </div>
                    )}

                    {/* EVALUATIONS TAB */}
                    {activeTab === 'evaluations' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className={vSectionTitle}>Evaluation scores (1–5)</h2>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {renderInput(evaluations, setEvaluations, 'space_score', 'Space', 'number')}
                                {renderInput(evaluations, setEvaluations, 'usability_score', 'Usability', 'number')}
                                {renderInput(evaluations, setEvaluations, 'efficiency_score', 'Efficiency', 'number')}
                                {renderInput(evaluations, setEvaluations, 'durability_score', 'Durability', 'number')}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {renderInput(evaluations, setEvaluations, 'comfort_score', 'Comfort', 'number')}
                                {renderInput(evaluations, setEvaluations, 'software_technology_score', 'Software & Tech', 'number')}
                                {renderInput(evaluations, setEvaluations, 'value_score', 'Value', 'number')}
                                {renderInput(evaluations, setEvaluations, 'autolitics_design_index', 'ADI (Design)', 'number')}
                            </div>
                            <div>
                                <label className={vLabel}>Overall profile notes</label>
                                <textarea value={evaluations.overall_profile_notes || ''} onChange={e => setEvaluations({ ...evaluations, overall_profile_notes: e.target.value })} rows={4} className={`${vInput} resize-none min-h-[8rem]`} placeholder="Narrative summary describing the vehicle's unique profile..." />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VehicleConfigDetail;
