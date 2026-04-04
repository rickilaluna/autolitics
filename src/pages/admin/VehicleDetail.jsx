import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Save, Loader2, Plus, Trash2, LayoutDashboard, Settings2, Lightbulb, MessageSquare, BarChart3, ListChecks } from 'lucide-react';
import ImageUploader from '../../components/admin/ImageUploader';
import {
    vPage,
    vTitle,
    vSubtitle,
    vLabel,
    vSectionTitle,
    vSubsectionTitle,
    vPanel,
    vInset,
    vPrimaryBtn,
    vSecondaryBtn,
    vGhostLink,
    vDestructiveBtn,
    vTabBtn,
    vInput,
    vSelect,
    vTextarea,
} from '../../components/admin/adminVehicleUi';

const TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'specs', label: 'Packaging & Specs', icon: Settings2 },
    { id: 'evaluations', label: 'Evaluation', icon: BarChart3 },
    { id: 'intelligence', label: 'Advisory Intelligence', icon: Lightbulb },
    { id: 'guidance', label: 'Features & Trim', icon: ListChecks }
];

const VehicleDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        make: '',
        model: '',
        segment: '',
        use_case: '',
        msrp_tier: '',
        positioning: '',
        powertrain_summary: '',
        origin: '',
        generation_label: '',
        generation_notes: '',
        default_image_url: '',
        interior_image_url: '',
        photo_url_front_34: '',
        photo_url_rear_34: '',
        photo_url_side_profile: '',
        photo_url_interior_dash: '',
        photo_url_cargo_area: '',
        default_best_for: '',
        default_why_it_fits: [],
        default_tradeoffs: [],
        default_trim_guidance: '',
        vehicle_summary: '',
        strategic_role_tags: []
    });

    const [dimensions, setDimensions] = useState({ length_in: '', width_in: '', height_in: '', wheelbase_in: '', curb_weight_lbs: '', legroom_2nd_row_in: '', legroom_3rd_row_in: '', cargo_behind_3rd_cu_ft: '', max_cargo_cu_ft: '', towing_capacity_lbs: '', ground_clearance_in: '' });
    const [safety, setSafety] = useState({ nhtsa_overall_stars: '', iihs_tsp_status: 'Not Rated', standard_safety_notes: '' });
    const [reliability, setReliability] = useState({ source_name: 'Consumer Reports', score_value: '', score_scale: '', summary_label: '', known_issues_notes: '' });
    const [evaluations, setEvaluations] = useState({ space_score: '', usability_score: '', efficiency_score: '', durability_score: '', comfort_score: '', software_technology_score: '', value_score: '', autolitics_design_index: '', overall_profile_notes: '' });

    const [specIds, setSpecIds] = useState({ dimensions: null, safety: null, reliability: null, evaluations: null });

    const [configs, setConfigs] = useState([]);
    const [powertrains, setPowertrains] = useState([]);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (!isNew) {
            fetchVehicle();
        }
    }, [id]);

    const fetchVehicle = async () => {
        const { data: vData } = await supabase.from('vehicle_models').select('*').eq('id', id).single();
        if (vData) {
            setFormData(vData);
        }

        const { data: cData } = await supabase.from('vehicle_configs').select('*').eq('vehicle_model_id', id);
        if (cData) setConfigs(cData);

        const { data: pData } = await supabase.from('powertrain_specs').select('*').eq('vehicle_model_id', id);
        if (pData) setPowertrains(pData);

        const { data: dim } = await supabase.from('dimension_specs').select('*').eq('vehicle_model_id', id).single();
        if (dim) { setDimensions(dim); setSpecIds(prev => ({ ...prev, dimensions: dim.id })); }

        const { data: sft } = await supabase.from('safety_specs').select('*').eq('vehicle_model_id', id).single();
        if (sft) { setSafety(sft); setSpecIds(prev => ({ ...prev, safety: sft.id })); }

        const { data: rel } = await supabase.from('reliability_signals').select('*').eq('vehicle_model_id', id).single();
        if (rel) { setReliability(rel); setSpecIds(prev => ({ ...prev, reliability: rel.id })); }

        const { data: evals } = await supabase.from('vehicle_evaluations').select('*').eq('vehicle_model_id', id).single();
        if (evals) { setEvaluations(evals); setSpecIds(prev => ({ ...prev, evaluations: evals.id })); }

        // Fetch historical intelligence for this model
        const { data: hist } = await supabase.from('v_engagement_shortlist')
            .select('*')
            .eq('vehicle_model_id', id)
            .order('engagement_id', { ascending: false });
        if (hist) setHistory(hist);

        setLoading(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleArrayChange = (field, valueStr) => {
        const arr = valueStr.split('\n').filter(s => s.trim() !== '');
        setFormData(prev => ({ ...prev, [`_${field}_raw`]: valueStr, [field]: arr }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Clean up UI-only state before sending to Supabase
            const vehiclePayload = { ...formData };
            Object.keys(vehiclePayload).forEach(key => {
                if (key.startsWith('_')) {
                    delete vehiclePayload[key];
                }
            });

            let savedModelId = id;
            if (isNew) {
                const { data, error: vehicleError } = await supabase.from('vehicle_models').insert([vehiclePayload]).select().single();
                if (vehicleError) throw vehicleError;
                savedModelId = data.id;
            } else {
                const { error: vehicleError } = await supabase.from('vehicle_models').update(vehiclePayload).eq('id', id);
                if (vehicleError) throw vehicleError;
            }

            // Helper to save related specs
            const saveSpec = async (table, data, specId) => {
                const payload = { ...data, vehicle_model_id: savedModelId };
                Object.keys(payload).forEach(key => {
                    if (payload[key] === '') payload[key] = null;
                });

                if (specId) {
                    await supabase.from(table).update(payload).eq('id', specId);
                } else if (Object.keys(data).some(k => data[k] !== '' && data[k] !== null && k !== 'source_name' && k !== 'iihs_tsp_status')) {
                    await supabase.from(table).insert([payload]);
                }
            };

            await Promise.all([
                saveSpec('dimension_specs', dimensions, specIds.dimensions),
                saveSpec('safety_specs', safety, specIds.safety),
                saveSpec('reliability_signals', reliability, specIds.reliability),
                saveSpec('vehicle_evaluations', evaluations, specIds.evaluations)
            ]);

            window.alert('Vehicle saved successfully');
            navigate('/admin/vehicles');
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error(err);
            window.alert('Failed to save vehicle details');
        } finally {
            setSaving(false);
        }
    };

    const handleAddConfig = async () => {
        if (isNew) return window.alert('Save vehicle first before adding specs');
        // create config logic now redirects to the config builder
        navigate(`/admin/vehicles/${id}/configs/new`);
    };

    const handleDeleteConfig = async (configId) => {
        if (!window.confirm("Are you sure you want to delete this configuration?")) return;
        setConfigs(configs.filter(s => s.id !== configId));
        await supabase.from('vehicle_configs').delete().eq('id', configId);
    };

    const handleAddPowertrain = async () => {
        if (isNew) return window.alert('Save vehicle first before adding powertrains');
        navigate(`/admin/vehicles/${id}/powertrains/new`);
    };

    const handleDeletePowertrain = async (ptId) => {
        if (!window.confirm("Are you sure you want to delete this powertrain?")) return;
        setPowertrains(powertrains.filter(p => p.id !== ptId));
        await supabase.from('powertrain_specs').delete().eq('id', ptId);
    };

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

    const calculateCompleteness = () => {
        const fields = [
            formData.make, formData.model, formData.segment, formData.vehicle_summary,
            dimensions?.length_in, dimensions?.max_cargo_cu_ft,
            evaluations?.space_score, evaluations?.value_score,
            formData.default_best_for
        ];
        const filled = fields.filter(f => f && String(f).trim() !== '').length;
        return Math.round((filled / fields.length) * 100);
    };

    if (loading) {
        return (
            <div className={`${vPage} flex justify-center py-24`}>
                <Loader2 className="animate-spin text-[#C9A84C]/60" size={32} />
            </div>
        );
    }

    return (
        <div className={vPage}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
                <div className="flex items-start gap-4">
                    <Link
                        to="/admin/vehicles"
                        className="p-2.5 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5]/80 hover:border-[#C9A84C]/40 hover:text-[#C9A84C] transition-colors shrink-0"
                    >
                        <ArrowLeft size={22} />
                    </Link>
                    <div>
                        <p className="text-xs font-['JetBrains_Mono'] text-[#FAF8F5]/40 uppercase tracking-widest mb-1">Vehicle library</p>
                        <h1 className={vTitle}>{isNew ? 'New vehicle & specs' : 'Edit vehicle & specs'}</h1>
                        {formData.make ? (
                            <p className={vSubtitle}>
                                {formData.make} {formData.model}
                            </p>
                        ) : (
                            <p className={vSubtitle}>Define identity, specs, and advisory defaults.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-8 mb-10">
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
                <form onSubmit={handleSubmit} className={`flex-1 ${vPanel} p-6 sm:p-8 min-h-[560px]`}>
                    
                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-6">
                                <h2 className={vSectionTitle}>Core identity</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={vLabel}>Make</label>
                            <input required type="text" name="make" value={formData.make} onChange={handleChange} className={vInput} placeholder="Toyota" />
                        </div>
                        <div>
                            <label className={vLabel}>Model</label>
                            <input required type="text" name="model" value={formData.model} onChange={handleChange} className={vInput} placeholder="Grand Highlander Hybrid" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <label className={vLabel}>Segment</label>
                            <select name="segment" value={formData.segment || ''} onChange={handleChange} className={vSelect}>
                                <option value="">Select Segment</option>
                                {["Compact", "Midsize", "3-Row", "Truck-Based"].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={vLabel}>Use Case</label>
                            <select name="use_case" value={formData.use_case || ''} onChange={handleChange} className={vSelect}>
                                <option value="">Select Use Case</option>
                                {["Daily Driver", "Adventure", "Performance"].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={vLabel}>MSRP Tier</label>
                            <select name="msrp_tier" value={formData.msrp_tier || ''} onChange={handleChange} className={vSelect}>
                                <option value="">Select Tier</option>
                                {["Under $35k", "$35–50k", "$50–65k", "$60–85k", "$85k+"].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={vLabel}>Positioning</label>
                            <select name="positioning" value={formData.positioning || ''} onChange={handleChange} className={vSelect}>
                                <option value="">Select Positioning</option>
                                {["Mainstream", "Near-Luxury", "Luxury", "Ultra-Premium"].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={vLabel}>Powertrain Summary</label>
                            <select name="powertrain_summary" value={formData.powertrain_summary || ''} onChange={handleChange} className={vSelect}>
                                <option value="">Select Powertrain</option>
                                {["Gas", "Hybrid", "Gas/Hybrid", "Electric", "Gas/Hybrid/Electric", "Gas/Electric"].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={vLabel}>Origin</label>
                            <select name="origin" value={formData.origin || ''} onChange={handleChange} className={vSelect}>
                                <option value="">Select Origin</option>
                                {["American", "Japanese", "Korean", "European"].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 mt-4">
                        <div>
                            <label className={vLabel}>Generation Label</label>
                            <input type="text" name="generation_label" value={formData.generation_label || ''} onChange={handleChange} className={vInput} placeholder="1st Gen" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className={vLabel}>Generation Notes</label>
                            <input type="text" name="generation_notes" value={formData.generation_notes || ''} onChange={handleChange} className={vInput} placeholder="Introduced in 2024" />
                        </div>
                        <div className="md:col-span-2 border-t border-[#2A2A35] pt-6 mt-2">
                            <label className={vLabel}>Vehicle Summary</label>
                            <input type="text" name="vehicle_summary" value={formData.vehicle_summary || ''} onChange={handleChange} className={vInput} placeholder="A basic one-sentence summary for deliverables..." />
                        </div>
                        <div className="md:col-span-2">
                            <label className={vLabel}>Strategic Role Tags (One per line)</label>
                            <textarea
                                value={formData._strategic_role_tags_raw !== undefined ? formData._strategic_role_tags_raw : (formData.strategic_role_tags?.join('\n') || '')}
                                onChange={e => handleArrayChange('strategic_role_tags', e.target.value)}
                                className={`${vTextarea} h-20`}
                                placeholder="Family flagship&#10;Hybrid efficiency leader"
                            ></textarea>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={vLabel}>Exterior Image</label>
                            <ImageUploader
                                currentUrl={formData.default_image_url}
                                onUploadComplete={(url) => setFormData(prev => ({ ...prev, default_image_url: url }))}
                                onClear={() => setFormData(prev => ({ ...prev, default_image_url: '' }))}
                            />
                        </div>
                        <div>
                            <label className={vLabel}>Interior Image</label>
                            <ImageUploader
                                currentUrl={formData.interior_image_url}
                                onUploadComplete={(url) => setFormData(prev => ({ ...prev, interior_image_url: url }))}
                                onClear={() => setFormData(prev => ({ ...prev, interior_image_url: '' }))}
                            />
                        </div>
                    </div>

                    <h3 className={`${vSubsectionTitle} mt-10`}>Standard image set (auto-ingested)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className={vLabel}>Front 3/4</label>
                            <ImageUploader
                                currentUrl={formData.photo_url_front_34}
                                onUploadComplete={(url) => setFormData(prev => ({ ...prev, photo_url_front_34: url }))}
                                onClear={() => setFormData(prev => ({ ...prev, photo_url_front_34: '' }))}
                            />
                        </div>
                        <div>
                            <label className={vLabel}>Rear 3/4</label>
                            <ImageUploader
                                currentUrl={formData.photo_url_rear_34}
                                onUploadComplete={(url) => setFormData(prev => ({ ...prev, photo_url_rear_34: url }))}
                                onClear={() => setFormData(prev => ({ ...prev, photo_url_rear_34: '' }))}
                            />
                        </div>
                        <div>
                            <label className={vLabel}>Side Profile</label>
                            <ImageUploader
                                currentUrl={formData.photo_url_side_profile}
                                onUploadComplete={(url) => setFormData(prev => ({ ...prev, photo_url_side_profile: url }))}
                                onClear={() => setFormData(prev => ({ ...prev, photo_url_side_profile: '' }))}
                            />
                        </div>
                        <div>
                            <label className={vLabel}>Interior Dash</label>
                            <ImageUploader
                                currentUrl={formData.photo_url_interior_dash}
                                onUploadComplete={(url) => setFormData(prev => ({ ...prev, photo_url_interior_dash: url }))}
                                onClear={() => setFormData(prev => ({ ...prev, photo_url_interior_dash: '' }))}
                            />
                        </div>
                        <div>
                            <label className={vLabel}>Cargo Area</label>
                            <ImageUploader
                                currentUrl={formData.photo_url_cargo_area}
                                onUploadComplete={(url) => setFormData(prev => ({ ...prev, photo_url_cargo_area: url }))}
                                onClear={() => setFormData(prev => ({ ...prev, photo_url_cargo_area: '' }))}
                            />
                        </div>
                    </div>
                        </div>
                    </div>
                )}

                {/* SPECS TAB */}
                {activeTab === 'specs' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-6">
                            <h2 className={vSectionTitle}>Dimensions & packaging</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {renderInput(dimensions, setDimensions, 'length_in', 'Length (in)', 'number')}
                        {renderInput(dimensions, setDimensions, 'width_in', 'Width (in)', 'number')}
                        {renderInput(dimensions, setDimensions, 'height_in', 'Height (in)', 'number')}
                        {renderInput(dimensions, setDimensions, 'wheelbase_in', 'Wheelbase (in)', 'number')}
                        {renderInput(dimensions, setDimensions, 'curb_weight_lbs', 'Curb Weight (lbs)', 'number')}
                        {renderInput(dimensions, setDimensions, 'towing_capacity_lbs', 'Towing Capacity (lbs)', 'number')}
                        {renderInput(dimensions, setDimensions, 'ground_clearance_in', 'Ground Clearance (in)', 'number')}
                    </div>
                    <h3 className={`${vSubsectionTitle} mt-6`}>Interior space</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {renderInput(dimensions, setDimensions, 'legroom_2nd_row_in', '2nd Row Legroom (in)', 'number')}
                        {renderInput(dimensions, setDimensions, 'legroom_3rd_row_in', '3rd Row Legroom (in)', 'number')}
                        {renderInput(dimensions, setDimensions, 'cargo_behind_3rd_cu_ft', 'Cargo behind 3rd row (cuft)', 'number')}
                        {renderInput(dimensions, setDimensions, 'max_cargo_cu_ft', 'Max Cargo Volume (cuft)', 'number')}
                        </div>
                    </div>
                        
                    {/* SAFETY & RELIABILITY */}
                        <div className="space-y-6">
                            <h2 className={vSectionTitle}>Safety & reliability</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className={`${vInset} p-6 space-y-5`}>
                                    <h3 className={vSubsectionTitle}>Safety ratings</h3>
                                    {renderInput(safety, setSafety, 'nhtsa_overall_stars', 'NHTSA overall stars (0–5)', 'number')}
                                    <div>
                                        <label className={vLabel}>IIHS top safety pick</label>
                                        <select value={safety.iihs_tsp_status || 'Not Rated'} onChange={e => setSafety({ ...safety, iihs_tsp_status: e.target.value })} className={vSelect}>
                                            <option value="Not Rated">Not Rated</option>
                                            <option value="TSP+">Top Safety Pick +</option>
                                            <option value="TSP">Top Safety Pick</option>
                                            <option value="None">None</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={vLabel}>Standard safety notes</label>
                                        <textarea value={safety.standard_safety_notes || ''} onChange={e => setSafety({ ...safety, standard_safety_notes: e.target.value })} rows={2} className={`${vTextarea} min-h-[4.5rem]`} />
                                    </div>
                                </div>
                                <div className={`${vInset} p-6 space-y-5`}>
                                    <h3 className={vSubsectionTitle}>Reliability signals</h3>
                                    {renderInput(reliability, setReliability, 'source_name', 'Source name')}
                                    {renderInput(reliability, setReliability, 'score_value', 'Score value')}
                                    {renderInput(reliability, setReliability, 'score_scale', 'Score scale')}
                                    {renderInput(reliability, setReliability, 'summary_label', 'Summary label')}
                                    <div>
                                        <label className={vLabel}>Known issues notes</label>
                                        <textarea value={reliability.known_issues_notes || ''} onChange={e => setReliability({ ...reliability, known_issues_notes: e.target.value })} rows={3} className={`${vTextarea} min-h-[5rem]`} />
                                    </div>
                                </div>
                            </div>
                        </div>
                </div>
                )}
                
                {/* EVALUATIONS TAB */}
                {activeTab === 'evaluations' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h2 className={`${vSectionTitle} border-0 pb-0 mb-2`}>Autolitics evaluation model</h2>
                            <p className="text-sm text-[#FAF8F5]/50 font-sans mb-6">Rate this model on a 1–5 scale across core dimensions.</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {renderInput(evaluations, setEvaluations, 'space_score', 'Space & Packaging (1-5)', 'number')}
                                {renderInput(evaluations, setEvaluations, 'usability_score', 'Usability & HMI (1-5)', 'number')}
                                {renderInput(evaluations, setEvaluations, 'efficiency_score', 'Efficiency & Upkeep (1-5)', 'number')}
                                {renderInput(evaluations, setEvaluations, 'durability_score', 'Durability Confidence (1-5)', 'number')}
                                {renderInput(evaluations, setEvaluations, 'comfort_score', 'Ride Comfort & NVH (1-5)', 'number')}
                                {renderInput(evaluations, setEvaluations, 'software_technology_score', 'Software & Tech (1-5)', 'number')}
                                {renderInput(evaluations, setEvaluations, 'value_score', 'Value Index (1-5)', 'number')}
                                {renderInput(evaluations, setEvaluations, 'autolitics_design_index', 'Autolitics Design Index (1-5)', 'number')}
                            </div>

                            <div className="mt-8">
                                <label className={vLabel}>Overall Analyst Profile Note</label>
                                <textarea
                                    value={evaluations.overall_profile_notes || ''}
                                    onChange={e => setEvaluations({ ...evaluations, overall_profile_notes: e.target.value })}
                                    className={`${vTextarea} min-h-[8rem]`}
                                    placeholder="A synthesized paragraph defining this vehicle's true competence and character..."
                                />
                            </div>
                        </div>
                    </div>
                )}
                
                {/* INTELLIGENCE TAB */}
                {activeTab === 'intelligence' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h2 className={`${vSectionTitle} border-0 pb-0 mb-2`}>Base rationale defaults</h2>
                            <p className="text-sm text-[#FAF8F5]/50 font-sans mb-6">These points auto-populate when adding this model to a new engagement.</p>
                            
                            <div className="space-y-6">
                                {renderInput(formData, setFormData, 'default_best_for', 'Best For Tag (e.g. Best Overall Fit)')}
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={vLabel}>Why It Fits (One per line)</label>
                                        <textarea
                                            value={formData._default_why_it_fits_raw !== undefined ? formData._default_why_it_fits_raw : (formData.default_why_it_fits?.join('\n') || '')}
                                            onChange={e => handleArrayChange('default_why_it_fits', e.target.value)}
                                            className={`${vTextarea} min-h-[8rem]`}
                                            placeholder="• Incredible space packaging&#10;• Trusted reliability"
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label className={vLabel}>Tradeoffs (One per line)</label>
                                        <textarea
                                            value={formData._default_tradeoffs_raw !== undefined ? formData._default_tradeoffs_raw : (formData.default_tradeoffs?.join('\n') || '')}
                                            onChange={e => handleArrayChange('default_tradeoffs', e.target.value)}
                                            className={`${vTextarea} min-h-[8rem]`}
                                            placeholder="• Cabin trails competitors&#10;• Engine note is coarse"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="border-t border-[#2A2A35] pt-8">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <MessageSquare size={20} className="text-[#C9A84C]" />
                                Historical Rationale Log
                            </h3>
                            
                            {history.length === 0 ? (
                                <div className="py-8 text-center text-[#FAF8F5]/40 bg-[#1A1A24] rounded-2xl border border-dashed border-[#2A2A35] font-sans text-sm">
                                    No historical rationales crafted for this model yet.
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {history.map(item => (
                                        <div key={item.engagement_id} className="bg-[#1A1A24] border border-[#2A2A35] rounded-2xl p-6">
                                            <div className="flex justify-between items-start mb-4 pb-4 border-b border-[#2A2A35]">
                                                <div>
                                                    <div className="font-bold text-[#FAF8F5]">{item.primary_contact_name}</div>
                                                    <div className="text-sm text-[#FAF8F5]/50 font-sans">{item.location} • Budget: ${item.budget_max?.toLocaleString()}</div>
                                                </div>
                                                <span className="text-xs font-bold text-[#FAF8F5]/50 bg-[#14141B] px-3 py-1 border rounded-lg uppercase tracking-wide">
                                                    {item.engagement_status}
                                                </span>
                                            </div>
                                            
                                            {item.best_for_tag && (
                                                <div className="mb-4">
                                                    <span className="text-xs font-bold text-[#C9A84C] uppercase tracking-wider">Best For</span>
                                                    <div className="font-medium text-[#FAF8F5]">{item.best_for_tag}</div>
                                                </div>
                                            )}
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-sans text-sm mb-4">
                                                <div>
                                                    <strong className="block mb-1 text-[#FAF8F5]/80">Why It Fits:</strong>
                                                    <ul className="list-disc pl-4 space-y-1 text-[#FAF8F5]/70">
                                                        {item.why_it_fits_bullets?.map((bull, i) => <li key={i}>{bull}</li>)}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <strong className="block mb-1 text-[#FAF8F5]/80">Tradeoffs:</strong>
                                                    <ul className="list-disc pl-4 space-y-1 text-[#FAF8F5]/70">
                                                        {item.tradeoffs_bullets?.map((bull, i) => <li key={i}>{bull}</li>)}
                                                    </ul>
                                                </div>
                                            </div>
                                            
                                            {item.trim_guidance_notes && (
                                                <div className="bg-[#14141B] p-3 rounded-xl border border-[#2A2A35] font-sans text-sm text-[#FAF8F5]/80">
                                                    <strong>Trim Notes:</strong> {item.trim_guidance_notes}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* GUIDANCE TAB */}
                {activeTab === 'guidance' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h2 className={`${vSectionTitle} border-0 pb-0 mb-2`}>Features & trim guidance</h2>
                            <p className="text-sm text-[#FAF8F5]/50 font-sans mb-6">Advice on features, trim levels, and configurations to seek or avoid.</p>
                            
                            <div>
                                <label className={vLabel}>Trim guidance notes</label>
                                <textarea
                                    value={formData.default_trim_guidance || ''}
                                    onChange={e => setFormData({ ...formData, default_trim_guidance: e.target.value })}
                                    className={`${vTextarea} min-h-[12rem]`}
                                    placeholder="Target the XLE Premium for the best value..."
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-8 mt-8 border-t border-[#2A2A35]">
                    <button type="submit" disabled={saving} className={`${vPrimaryBtn} px-8 py-3.5 text-base w-full sm:w-auto`}>
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        <span>Save vehicle document</span>
                    </button>
                </div>
            </form>

            {/* Right Sidebar - Health Metrics */}
            {!isNew && (
                <div className="w-full xl:w-64 shrink-0 space-y-6">
                    <div className={`${vPanel} rounded-2xl p-6`}>
                        <div className="text-xs font-['JetBrains_Mono'] text-[#FAF8F5]/40 mb-4 uppercase tracking-wider">Intelligence health</div>
                        <div className="mb-6">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-medium text-[#FAF8F5]/80 font-sans">Data Completeness</span>
                                <span className="text-lg font-bold text-[#C9A84C]">{calculateCompleteness()}%</span>
                            </div>
                            <div className="h-2 bg-[#1A1A24] rounded-full overflow-hidden border border-[#2A2A35]">
                                <div className="h-full bg-[#C9A84C] transition-all duration-500" style={{ width: `${calculateCompleteness()}%` }}></div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {!evaluations?.space_score && (
                                <div className="flex items-start gap-2 text-xs font-sans text-orange-400/80 bg-orange-400/5 p-3 rounded-lg border border-orange-400/10">
                                    <span className="shrink-0 mt-0.5">⚠️</span>
                                    <span>Missing Autolitics evaluation scores.</span>
                                </div>
                            )}
                            {!formData.vehicle_summary && (
                                <div className="flex items-start gap-2 text-xs font-sans text-[#FAF8F5]/60 bg-[#1A1A24] p-3 rounded-lg border border-[#2A2A35]">
                                    <span className="shrink-0 mt-0.5">ℹ️</span>
                                    <span>Missing vehicle summary text.</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={`${vPanel} rounded-2xl p-6`}>
                        <div className="text-xs font-['JetBrains_Mono'] text-[#FAF8F5]/40 mb-4 uppercase tracking-wider">Engagement usage</div>
                        <div className="text-3xl font-bold text-[#FAF8F5] mb-1">{history.length}</div>
                        <div className="text-sm font-sans text-[#FAF8F5]/50">Times Shortlisted</div>
                    </div>
                </div>
            )}
            </div>

            {!isNew && (
                <div className={`${vPanel} p-6 sm:p-8`}>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                        <h2 className={vSectionTitle + ' border-0 pb-0 mb-0'}>Vehicle configurations</h2>
                        <button type="button" onClick={handleAddConfig} className={vSecondaryBtn}>
                            <Plus size={16} />
                            <span>Add config</span>
                        </button>
                    </div>

                    <div className="space-y-3">
                        {configs.length === 0 ? (
                            <div className={`${vInset} p-10 text-center text-sm text-[#FAF8F5]/45 font-sans`}>
                                No configurations yet. Add a model year / variant spine.
                            </div>
                        ) : configs.map(config => (
                            <div key={config.id} className={`${vInset} p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4`}>
                                <div>
                                    <h3 className="font-semibold text-lg text-[#FAF8F5]">{config.model_year} · {config.config_label}</h3>
                                    <p className="text-sm text-[#FAF8F5]/50 font-sans mt-0.5">{config.powertrain_category || '—'}</p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <Link to={`/admin/vehicles/${id}/configs/${config.id}`} className={vGhostLink}>
                                        Edit details
                                    </Link>
                                    <button type="button" onClick={() => handleDeleteConfig(config.id)} className={vDestructiveBtn} aria-label="Delete configuration">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mt-12 mb-6">
                        <h2 className={vSectionTitle + ' border-0 pb-0 mb-0'}>Powertrain variations</h2>
                        <button type="button" onClick={handleAddPowertrain} className={vSecondaryBtn}>
                            <Plus size={16} />
                            <span>Add powertrain</span>
                        </button>
                    </div>

                    <div className="space-y-3">
                        {powertrains.length === 0 ? (
                            <div className={`${vInset} p-10 text-center text-sm text-[#FAF8F5]/45 font-sans`}>
                                No powertrains yet. Add motor options for this model row.
                            </div>
                        ) : powertrains.map(pt => (
                            <div key={pt.id} className={`${vInset} p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4`}>
                                <div>
                                    <h3 className="font-semibold text-lg text-[#FAF8F5]">{pt.name}</h3>
                                    <p className="text-sm text-[#FAF8F5]/50 font-sans mt-0.5">
                                        {[pt.engine_description, pt.horsepower_hp ? `${pt.horsepower_hp} hp` : null].filter(Boolean).join(' · ') || '—'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <Link to={`/admin/vehicles/${id}/powertrains/${pt.id}`} className={vGhostLink}>
                                        Edit details
                                    </Link>
                                    <button type="button" onClick={() => handleDeletePowertrain(pt.id)} className={vDestructiveBtn} aria-label="Delete powertrain">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VehicleDetail;
