import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Save, Loader2, Plus, Trash2, LayoutDashboard, Settings2, Lightbulb, MessageSquare, BarChart3, ListChecks } from 'lucide-react';
import ImageUploader from '../../components/admin/ImageUploader';

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
            <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1 font-sans">{label}</label>
            <input
                type={type}
                value={state[field] || ''}
                onChange={e => setState({ ...state, [field]: e.target.value })}
                className="studio-touch-input w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 focus:border-[#C9A84C] transition-all font-sans"
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

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-[#FAF8F5]/40" size={32} /></div>;

    return (
        <div className="font-['Space_Grotesk'] w-full max-w-[1600px] px-4 md:px-8 mx-auto pb-20 pt-6">
            <div className="flex items-center gap-4 mb-6">
                <Link to="/admin/vehicles" className="p-2 rounded-full hover:bg-[#2A2A35] transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">{isNew ? 'New Vehicle & Specs' : 'Edit Vehicle & Specs'}</h1>
                    {formData.make && <p className="text-[#FAF8F5]/50 font-sans mt-1">{formData.make} {formData.model}</p>}
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 mb-8">
                {/* Tabs Sidebar */}
                <div className="w-full lg:w-64 shrink-0 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors whitespace-nowrap ${isActive ? 'bg-[#14141B] text-[#C9A84C] shadow-sm font-bold border border-[#2A2A35]' : 'text-[#FAF8F5]/50 hover:bg-[#14141B]/50'}`}
                            >
                                <Icon size={20} className={isActive ? 'text-[#C9A84C]' : 'text-[#FAF8F5]/40'} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Main Content Area */}
                <form onSubmit={handleSubmit} className="flex-1 bg-[#14141B] rounded-[2rem] shadow-sm border border-[#2A2A35] p-8 min-h-[600px]">
                    
                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold border-b border-[#2A2A35] pb-2">Core Identity</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1 font-sans">Make</label>
                            <input required type="text" name="make" value={formData.make} onChange={handleChange} className="studio-touch-input w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 focus:border-[#C9A84C] transition-all font-sans" placeholder="Toyota" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1 font-sans">Model</label>
                            <input required type="text" name="model" value={formData.model} onChange={handleChange} className="studio-touch-input w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 focus:border-[#C9A84C] transition-all font-sans" placeholder="Grand Highlander Hybrid" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1 font-sans">Segment</label>
                            <select name="segment" value={formData.segment || ''} onChange={handleChange} className="studio-touch-input w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 transition-all font-sans">
                                <option value="">Select Segment</option>
                                {["Compact", "Midsize", "3-Row", "Truck-Based"].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1 font-sans">Use Case</label>
                            <select name="use_case" value={formData.use_case || ''} onChange={handleChange} className="studio-touch-input w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 transition-all font-sans">
                                <option value="">Select Use Case</option>
                                {["Daily Driver", "Adventure", "Performance"].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1 font-sans">MSRP Tier</label>
                            <select name="msrp_tier" value={formData.msrp_tier || ''} onChange={handleChange} className="studio-touch-input w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 transition-all font-sans">
                                <option value="">Select Tier</option>
                                {["Under $35k", "$35–50k", "$50–65k", "$60–85k", "$85k+"].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1 font-sans">Positioning</label>
                            <select name="positioning" value={formData.positioning || ''} onChange={handleChange} className="studio-touch-input w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 transition-all font-sans">
                                <option value="">Select Positioning</option>
                                {["Mainstream", "Near-Luxury", "Luxury", "Ultra-Premium"].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1 font-sans">Powertrain Summary</label>
                            <select name="powertrain_summary" value={formData.powertrain_summary || ''} onChange={handleChange} className="studio-touch-input w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 transition-all font-sans">
                                <option value="">Select Powertrain</option>
                                {["Gas", "Hybrid", "Gas/Hybrid", "Electric", "Gas/Hybrid/Electric", "Gas/Electric"].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1 font-sans">Origin</label>
                            <select name="origin" value={formData.origin || ''} onChange={handleChange} className="studio-touch-input w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 transition-all font-sans">
                                <option value="">Select Origin</option>
                                {["American", "Japanese", "Korean", "European"].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1 font-sans">Generation Label</label>
                            <input type="text" name="generation_label" value={formData.generation_label || ''} onChange={handleChange} className="studio-touch-input w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 transition-all font-sans" placeholder="1st Gen" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1 font-sans">Generation Notes</label>
                            <input type="text" name="generation_notes" value={formData.generation_notes || ''} onChange={handleChange} className="studio-touch-input w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 transition-all font-sans" placeholder="Introduced in 2024" />
                        </div>
                        <div className="md:col-span-2 border-t border-[#2A2A35] pt-6 mt-2">
                            <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1 font-sans">Vehicle Summary</label>
                            <input type="text" name="vehicle_summary" value={formData.vehicle_summary || ''} onChange={handleChange} className="studio-touch-input w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 transition-all font-sans" placeholder="A basic one-sentence summary for deliverables..." />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1 font-sans">Strategic Role Tags (One per line)</label>
                            <textarea
                                value={formData._strategic_role_tags_raw !== undefined ? formData._strategic_role_tags_raw : (formData.strategic_role_tags?.join('\n') || '')}
                                onChange={e => handleArrayChange('strategic_role_tags', e.target.value)}
                                className="studio-touch-input w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 transition-all font-sans resize-none h-20"
                                placeholder="Family flagship&#10;Hybrid efficiency leader"
                            ></textarea>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-2 font-sans">Exterior Image</label>
                            <ImageUploader
                                currentUrl={formData.default_image_url}
                                onUploadComplete={(url) => setFormData(prev => ({ ...prev, default_image_url: url }))}
                                onClear={() => setFormData(prev => ({ ...prev, default_image_url: '' }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-2 font-sans">Interior Image</label>
                            <ImageUploader
                                currentUrl={formData.interior_image_url}
                                onUploadComplete={(url) => setFormData(prev => ({ ...prev, interior_image_url: url }))}
                                onClear={() => setFormData(prev => ({ ...prev, interior_image_url: '' }))}
                            />
                        </div>
                    </div>

                    <h3 className="text-xl font-bold mt-8 mb-4">Standard Image Set (Auto-Ingested)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-2 font-sans">Front 3/4</label>
                            <ImageUploader
                                currentUrl={formData.photo_url_front_34}
                                onUploadComplete={(url) => setFormData(prev => ({ ...prev, photo_url_front_34: url }))}
                                onClear={() => setFormData(prev => ({ ...prev, photo_url_front_34: '' }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-2 font-sans">Rear 3/4</label>
                            <ImageUploader
                                currentUrl={formData.photo_url_rear_34}
                                onUploadComplete={(url) => setFormData(prev => ({ ...prev, photo_url_rear_34: url }))}
                                onClear={() => setFormData(prev => ({ ...prev, photo_url_rear_34: '' }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-2 font-sans">Side Profile</label>
                            <ImageUploader
                                currentUrl={formData.photo_url_side_profile}
                                onUploadComplete={(url) => setFormData(prev => ({ ...prev, photo_url_side_profile: url }))}
                                onClear={() => setFormData(prev => ({ ...prev, photo_url_side_profile: '' }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-2 font-sans">Interior Dash</label>
                            <ImageUploader
                                currentUrl={formData.photo_url_interior_dash}
                                onUploadComplete={(url) => setFormData(prev => ({ ...prev, photo_url_interior_dash: url }))}
                                onClear={() => setFormData(prev => ({ ...prev, photo_url_interior_dash: '' }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-2 font-sans">Cargo Area</label>
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
                            <h2 className="text-2xl font-bold border-b border-[#2A2A35] pb-2">Dimensions & Packaging</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {renderInput(dimensions, setDimensions, 'length_in', 'Length (in)', 'number')}
                        {renderInput(dimensions, setDimensions, 'width_in', 'Width (in)', 'number')}
                        {renderInput(dimensions, setDimensions, 'height_in', 'Height (in)', 'number')}
                        {renderInput(dimensions, setDimensions, 'wheelbase_in', 'Wheelbase (in)', 'number')}
                        {renderInput(dimensions, setDimensions, 'curb_weight_lbs', 'Curb Weight (lbs)', 'number')}
                        {renderInput(dimensions, setDimensions, 'towing_capacity_lbs', 'Towing Capacity (lbs)', 'number')}
                        {renderInput(dimensions, setDimensions, 'ground_clearance_in', 'Ground Clearance (in)', 'number')}
                    </div>
                    <h3 className="text-lg font-bold mt-4">Interior Space</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {renderInput(dimensions, setDimensions, 'legroom_2nd_row_in', '2nd Row Legroom (in)', 'number')}
                        {renderInput(dimensions, setDimensions, 'legroom_3rd_row_in', '3rd Row Legroom (in)', 'number')}
                        {renderInput(dimensions, setDimensions, 'cargo_behind_3rd_cu_ft', 'Cargo behind 3rd row (cuft)', 'number')}
                        {renderInput(dimensions, setDimensions, 'max_cargo_cu_ft', 'Max Cargo Volume (cuft)', 'number')}
                        </div>
                    </div>
                        
                    {/* SAFETY & RELIABILITY */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold border-b border-[#2A2A35] pb-2">Safety & Reliability</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Safety */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold">Safety Ratings</h3>
                            {renderInput(safety, setSafety, 'nhtsa_overall_stars', 'NHTSA Overall Stars (0-5)', 'number')}
                            <div>
                                <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1 font-sans">IIHS Top Safety Pick</label>
                                <select value={safety.iihs_tsp_status || 'Not Rated'} onChange={e => setSafety({ ...safety, iihs_tsp_status: e.target.value })} className="studio-touch-input w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 font-sans">
                                    <option value="Not Rated">Not Rated</option>
                                    <option value="TSP+">Top Safety Pick +</option>
                                    <option value="TSP">Top Safety Pick</option>
                                    <option value="None">None</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1 font-sans">Standard Safety Notes</label>
                                <textarea value={safety.standard_safety_notes || ''} onChange={e => setSafety({ ...safety, standard_safety_notes: e.target.value })} rows="2" className="studio-touch-input w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 font-sans resize-none"></textarea>
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
                            <h2 className="text-2xl font-bold mb-2">Autolitics Evaluation Model</h2>
                            <p className="text-sm text-[#FAF8F5]/50 font-sans mb-6">Rate this model on a 1-5 scale across core dimensions.</p>
                            
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
                                <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-2 font-sans">Overall Analyst Profile Note</label>
                                <textarea
                                    value={evaluations.overall_profile_notes || ''}
                                    onChange={e => setEvaluations({ ...evaluations, overall_profile_notes: e.target.value })}
                                    className="studio-touch-input w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 transition-all font-sans resize-none h-32"
                                    placeholder="A synthesized paragraph defining this vehicle's true competence and character..."
                                ></textarea>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* INTELLIGENCE TAB */}
                {activeTab === 'intelligence' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Base Rationale Defaults</h2>
                            <p className="text-sm text-[#FAF8F5]/50 font-sans mb-6">These points will auto-populate when adding this model to a new engagement.</p>
                            
                            <div className="space-y-6">
                                {renderInput(formData, setFormData, 'default_best_for', 'Best For Tag (e.g. Best Overall Fit)')}
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-2 font-sans">Why It Fits (One per line)</label>
                                        <textarea
                                            value={formData._default_why_it_fits_raw !== undefined ? formData._default_why_it_fits_raw : (formData.default_why_it_fits?.join('\n') || '')}
                                            onChange={e => handleArrayChange('default_why_it_fits', e.target.value)}
                                            className="studio-touch-input w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 transition-all font-sans resize-none h-32"
                                            placeholder="• Incredible space packaging&#10;• Trusted reliability"
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-2 font-sans">Tradeoffs (One per line)</label>
                                        <textarea
                                            value={formData._default_tradeoffs_raw !== undefined ? formData._default_tradeoffs_raw : (formData.default_tradeoffs?.join('\n') || '')}
                                            onChange={e => handleArrayChange('default_tradeoffs', e.target.value)}
                                            className="studio-touch-input w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 transition-all font-sans resize-none h-32"
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
                            <h2 className="text-2xl font-bold mb-2">Features & Trim Guidance</h2>
                            <p className="text-sm text-[#FAF8F5]/50 font-sans mb-6">Advice on features, trim levels, and configurations to seek or avoid.</p>
                            
                            <div>
                                <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-2 font-sans">Trim Guidance Notes</label>
                                <textarea
                                    value={formData.default_trim_guidance || ''}
                                    onChange={e => setFormData({ ...formData, default_trim_guidance: e.target.value })}
                                    className="studio-touch-input w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 transition-all font-sans resize-none h-48"
                                    placeholder="Target the XLE Premium for the best value..."
                                ></textarea>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-8 mt-8 border-t border-[#2A2A35]">
                    <button type="submit" disabled={saving} className="flex items-center gap-2 bg-[#111111] text-white px-8 py-4 rounded-xl hover:bg-[#222222] transition-colors disabled:opacity-50 w-full justify-center">
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        <span className="font-semibold text-lg">Save Vehicle Document</span>
                    </button>
                </div>
            </form>

            {/* Right Sidebar - Health Metrics */}
            {!isNew && (
                <div className="w-full lg:w-64 shrink-0 space-y-6">
                    <div className="bg-[#14141B] rounded-2xl shadow-sm border border-[#2A2A35] p-6">
                        <div className="text-xs font-['Space_Mono'] text-[#FAF8F5]/40 mb-4 uppercase tracking-wider">Intelligence Health</div>
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

                    <div className="bg-[#14141B] rounded-2xl shadow-sm border border-[#2A2A35] p-6">
                        <div className="text-xs font-['Space_Mono'] text-[#FAF8F5]/40 mb-4 uppercase tracking-wider">Engagement Usage</div>
                        <div className="text-3xl font-bold text-[#FAF8F5] mb-1">{history.length}</div>
                        <div className="text-sm font-sans text-[#FAF8F5]/50">Times Shortlisted</div>
                    </div>
                </div>
            )}
            </div>

            {!isNew && (
                <div className="bg-[#14141B] rounded-[2rem] shadow-sm border border-[#2A2A35] p-8">
                <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Vehicle Configurations</h2>
                        <button onClick={handleAddConfig} className="flex items-center gap-2 bg-[#2A2A35] text-[#FAF8F5] px-4 py-2 rounded-xl hover:bg-gray-300 transition-colors">
                            <Plus size={16} />
                            <span>Add Config</span>
                        </button>
                    </div>

                    <div className="space-y-4">
                        {configs.length === 0 ? (
                            <div className="bg-[#14141B] p-8 rounded-[2rem] text-center text-[#FAF8F5]/50 border border-[#2A2A35]">
                                No configs added yet.
                            </div>
                        ) : configs.map(config => (
                            <div key={config.id} className="bg-[#14141B] rounded-2xl shadow-sm border border-[#2A2A35] p-6 relative group flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg">{config.model_year} {config.config_label}</h3>
                                    <p className="text-sm text-[#FAF8F5]/50 font-sans">{config.powertrain_category}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Link to={`/admin/vehicles/${id}/configs/${config.id}`} className="px-4 py-2 border rounded-lg hover:bg-[#1A1A24] font-medium text-sm transition-colors">
                                        Edit Details
                                    </Link>
                                    <button onClick={() => handleDeleteConfig(config.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center mb-4 mt-12">
                        <h2 className="text-2xl font-bold">Powertrain Variations</h2>
                        <button onClick={handleAddPowertrain} className="flex items-center gap-2 bg-[#2A2A35] text-[#FAF8F5] px-4 py-2 rounded-xl hover:bg-gray-300 transition-colors">
                            <Plus size={16} />
                            <span>Add Powertrain</span>
                        </button>
                    </div>

                    <div className="space-y-4">
                        {powertrains.length === 0 ? (
                            <div className="bg-[#14141B] p-8 rounded-[2rem] text-center text-[#FAF8F5]/50 border border-[#2A2A35]">
                                No powertrains added yet.
                            </div>
                        ) : powertrains.map(pt => (
                            <div key={pt.id} className="bg-[#14141B] rounded-2xl shadow-sm border border-[#2A2A35] p-6 relative group flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg">{pt.name}</h3>
                                    <p className="text-sm text-[#FAF8F5]/50 font-sans">{pt.engine_description} • {pt.horsepower_hp} HP</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Link to={`/admin/vehicles/${id}/powertrains/${pt.id}`} className="px-4 py-2 border rounded-lg hover:bg-[#1A1A24] font-medium text-sm transition-colors">
                                        Edit Details
                                    </Link>
                                    <button onClick={() => handleDeletePowertrain(pt.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors">
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
