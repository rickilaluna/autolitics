/* eslint-env browser */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Save, Plus, Loader2, Trash2, Eye, ChevronRight, ChevronLeft, Car, Calendar, ThumbsUp, ThumbsDown } from 'lucide-react';
import { generateSnapshot } from '../../lib/fitEngine';

const STEPS = [
    { id: 'intake', label: '1. Intake & Weights' },
    { id: 'shortlist', label: '2. Select Vehicles' },
    { id: 'rationale', label: '3. Write Rationale' },
    { id: 'preview', label: '4. Preview & Publish' }
];

const SIZES = ["Compact", "Midsize", "3-Row", "Truck-Based"];

const EngagementBuilder = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [currentStep, setCurrentStep] = useState('intake');

    const [engagement, setEngagement] = useState(null);
    const [client, setClient] = useState(null);
    const [shortlist, setShortlist] = useState([]);
    const [testDrives, setTestDrives] = useState([]);

    // For adding vehicles
    const [availableConfigs, setAvailableConfigs] = useState([]);
    const [selectedConfigId, setSelectedConfigId] = useState('');

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        // Fetch engagement
        const { data: eData } = await supabase.from('engagements').select('*').eq('id', id).single();
        if (eData) {
            setEngagement(eData);
            // Fetch client
            const { data: cData } = await supabase.from('clients').select('*').eq('id', eData.client_id).single();
            if (cData) setClient(cData);

            // Fetch test drives
            const { data: tdData } = await supabase.from('test_drive_feedback').select('*').eq('engagement_id', id).order('drive_date', { ascending: false });
            if (tdData) setTestDrives(tdData);
        }

        // Fetch shortlist items
        const { data: sData } = await supabase
            .from('shortlist_items')
            .select(`*`)
            .eq('engagement_id', id);

        // For each shortlist item, fetch the config profile detail to display name
        if (sData && sData.length > 0) {
            const configIds = sData.map(s => s.vehicle_config_id);
            const { data: cData } = await supabase.from('v_vehicle_config_profile').select('*').in('vehicle_config_id', configIds);

            const enrichedShortlist = await Promise.all(sData.map(async (item) => {
                const config = cData?.find(c => c.vehicle_config_id === item.vehicle_config_id);
                let powertrains = [];
                if (config) {
                    const { data: pts } = await supabase
                        .from('powertrain_specs')
                        .select('*, vehicle_models!inner(make, model)')
                        .eq('vehicle_models.make', config.make)
                        .eq('vehicle_models.model', config.model);
                    powertrains = pts || [];
                }
                return { ...item, _config: { ...config, powertrains } };
            }));
            setShortlist(enrichedShortlist);
        } else {
            setShortlist([]);
        }

        // Fetch all configs for dropdown
        const { data: configData } = await supabase.from('v_vehicle_config_profile').select('*').order('make');
        if (configData) setAvailableConfigs(configData);

        setLoading(false);
    };

    // Intake Handlers
    const handleEngagementChange = async (field, value) => {
        setEngagement(prev => ({ ...prev, [field]: value }));
        await supabase.from('engagements').update({ [field]: value }).eq('id', id);
    };

    // Shortlist Handlers
    const handleAddVehicle = async () => {
        if (!selectedConfigId) return;
        const config = availableConfigs.find(c => c.vehicle_config_id === selectedConfigId);
        const payload = {
            engagement_id: id,
            vehicle_config_id: selectedConfigId,
            status: 'recommended',
            best_for_tag: config?.default_best_for || null,
            why_it_fits_bullets: config?.default_why_it_fits || [],
            tradeoffs_bullets: config?.default_tradeoffs || [],
            trim_guidance_notes: config?.default_trim_guidance || null
        };
        const { data } = await supabase.from('shortlist_items').insert([payload]).select().single();
        if (data) {
            let powertrains = [];
            if (config) {
                const { data: pts } = await supabase
                    .from('powertrain_specs')
                    .select('*, vehicle_models!inner(make, model)')
                    .eq('vehicle_models.make', config.make)
                    .eq('vehicle_models.model', config.model);
                powertrains = pts || [];
            }
            setShortlist([...shortlist, { ...data, _config: { ...config, powertrains } }]);
            setSelectedConfigId('');
        }
    };

    const handleRemoveItem = async (itemId) => {
        await supabase.from('shortlist_items').delete().eq('id', itemId);
        setShortlist(shortlist.filter(s => s.id !== itemId));
    };

    const handleItemChange = async (itemId, field, value) => {
        setShortlist(shortlist.map(s => s.id === itemId ? { ...s, [field]: value } : s));
        await supabase.from('shortlist_items').update({ [field]: value }).eq('id', itemId);
    };

    const handleBulletsChange = async (itemId, field, valueStr) => {
        const arr = valueStr.split('\n').filter(s => s.trim() !== '');
        
        // Store raw string for typing, and the parsed array for data access
        setShortlist(shortlist.map(s => s.id === itemId ? { ...s, [`_${field}_raw`]: valueStr, [field]: arr } : s));

        // Push to db
        await supabase.from('shortlist_items').update({ [field]: arr }).eq('id', itemId);
    };

    const handlePublish = async () => {
        setSaving(true);

        const enrichedShortlist = shortlist.map(s => {
            return {
                ...s,
                powertrains: s._config?.powertrains || [],
                vehicle_specs: {
                    vehicles: { make: s._config?.make, model: s._config?.model },
                    trim: s._config?.config_label,
                    model_year: s._config?.model_year,
                    default_images: [
                        s._config?.default_image_url || '',
                        s._config?.photo_url_front_34 || '',
                        s._config?.photo_url_rear_34 || '',
                        s._config?.photo_url_side_profile || '',
                        s._config?.photo_url_interior_dash || '',
                        s._config?.photo_url_cargo_area || ''
                    ].filter(Boolean)
                },
                rationale_fit_bullets: s.why_it_fits_bullets,
                rationale_tradeoffs_bullets: s.tradeoffs_bullets
            };
        });

        const snapshot = generateSnapshot(engagement, client, enrichedShortlist);

        // Get max version number for this engagement to avoid unique constraint violations
        const { data: vData } = await supabase.from('deliverable_versions')
            .select('version_number')
            .eq('engagement_id', id)
            .order('version_number', { ascending: false })
            .limit(1);

        const nextVersion = (vData && vData.length > 0) ? vData[0].version_number + 1 : 1;

        // Save to deliverable_versions
        const { data: dData, error } = await supabase.from('deliverable_versions').insert([{
            engagement_id: id,
            snapshot: snapshot,
            visibility: 'published',
            version_number: nextVersion
        }]).select().single();

        if (dData) {
            await supabase.from('engagements').update({ status: 'delivered' }).eq('id', id);
            // Also update local state so if they go back it's up to date
            setEngagement(prev => ({ ...prev, status: 'delivered' }));
            navigate(`/deliverable/${dData.id}`);
        } else {
            console.error('Error creating deliverable version:', error);
            alert('Encountered an error publishing the deliverable. See console.');
        }
        setSaving(false);
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-[#FAF8F5]/40" size={32} /></div>;

    const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

    return (
        <div className="font-['Space_Grotesk'] max-w-5xl mx-auto pb-32">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link to="/admin/engagements" className="p-2 rounded-full hover:bg-[#2A2A35] transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Engagement: {client?.primary_contact_name}</h1>
                        <p className="text-[#FAF8F5]/50 font-sans">Status: {engagement?.status}</p>
                    </div>
                </div>

                {currentStep === 'preview' && (
                    <button onClick={handlePublish} disabled={saving || shortlist.length === 0} className="flex items-center gap-2 bg-[#C9A84C] text-white px-6 py-3 rounded-xl hover:bg-[#D4B86A] transition-colors disabled:opacity-50">
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Eye size={20} />}
                        <span className="font-semibold">Publish Deliverable</span>
                    </button>
                )}
            </div>

            {/* Stepper Navigation */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                {STEPS.map((step, idx) => (
                    <button
                        key={step.id}
                        onClick={() => setCurrentStep(step.id)}
                        className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${currentStep === step.id
                            ? 'bg-[#111111] text-white shadow-md'
                            : idx < currentStepIndex
                                ? 'bg-[#14141B] text-[#FAF8F5] border border-[#2A2A35] hover:bg-[#1A1A24]'
                                : 'bg-transparent text-[#FAF8F5]/40 border border-transparent hover:text-[#FAF8F5]/70'
                            }`}
                    >
                        {step.label}
                    </button>
                ))}
            </div>

            {/* Step Content */}
            <div className="bg-[#14141B] rounded-[2rem] shadow-sm border border-[#2A2A35] p-8 min-h-[500px]">

                {/* STEP 1: INTAKE */}
                {currentStep === 'intake' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <h2 className="text-2xl font-bold border-b pb-4 text-[#FAF8F5]">Client Intake & Priorities</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
                            <div className="space-y-4">
                                <h3 className="font-bold text-lg font-['Space_Grotesk']">Basic Parameters</h3>
                                <div>
                                    <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1">Budget Min</label>
                                    <input type="number" value={engagement?.budget_min || ''} onChange={e => handleEngagementChange('budget_min', Number(e.target.value))} className="w-full px-4 py-2 border rounded-xl text-[#FAF8F5] bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1">Budget Max</label>
                                    <input type="number" value={engagement?.budget_max || ''} onChange={e => handleEngagementChange('budget_max', Number(e.target.value))} className="w-full px-4 py-2 border rounded-xl text-[#FAF8F5] bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1">Purchase Type</label>
                                    <select value={engagement?.purchase_type || 'used'} onChange={e => handleEngagementChange('purchase_type', e.target.value)} className="w-full px-4 py-2 border rounded-xl text-[#FAF8F5] bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20">
                                        <option value="new">New</option>
                                        <option value="cpo">CPO</option>
                                        <option value="used">Used</option>
                                    </select>
                                </div>

                                <div className="pt-2">
                                    <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-2">Desired Segments</label>
                                    <div className="flex flex-wrap gap-2">
                                        {SIZES.map(sz => {
                                            const isSelected = (engagement?.desired_segments || []).includes(sz);
                                            return (
                                                <button
                                                    key={sz}
                                                    onClick={() => {
                                                        const curr = engagement?.desired_segments || [];
                                                        const next = isSelected ? curr.filter(s => s !== sz) : [...curr, sz];
                                                        handleEngagementChange('desired_segments', next);
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-colors ${isSelected ? 'bg-[#111111] text-white border-[#111111]' : 'bg-[#14141B] text-[#FAF8F5]/70 border-[#2A2A35] hover:border-gray-400'}`}
                                                >
                                                    {sz}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold text-lg font-['Space_Grotesk'] text-[#FAF8F5]">Algorithm Weights (1-5)</h3>
                                {[
                                    { key: 'priority_space', label: 'Space & Practicality' },
                                    { key: 'priority_efficiency', label: 'Efficiency & Upkeep' },
                                    { key: 'priority_durability', label: 'Durability / Reliability' },
                                    { key: 'priority_interior', label: 'Interior Quality' },
                                    { key: 'priority_risk', label: 'Risk Tolerance (Tech/New Models)' }
                                ].map(p => (
                                    <div key={p.key} className="flex items-center justify-between gap-4">
                                        <label className="text-sm font-medium text-[#FAF8F5]/80 min-w-[150px]">{p.label}</label>
                                        <input
                                            type="range" min="1" max="5"
                                            value={engagement?.[p.key] || 3}
                                            onChange={e => handleEngagementChange(p.key, Number(e.target.value))}
                                            className="flex-1 accent-[#E63B2E]"
                                        />
                                        <span className="w-8 text-center font-bold">{engagement?.[p.key] || 3}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Test Drive Feedback Section */}
                        {testDrives.length > 0 && (
                            <div className="mt-12 pt-8 border-t border-[#2A2A35] font-sans">
                                <h3 className="font-bold text-xl font-['Space_Grotesk'] text-[#FAF8F5] mb-6 flex items-center gap-2">
                                    <Car size={24} className="text-[#C9A84C]" />
                                    Client Test Drive Logs
                                </h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {testDrives.map((td) => (
                                        <div key={td.id} className="bg-[#1A1A24] rounded-2xl p-6 border border-[#2A2A35]">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="font-bold text-[#FAF8F5] text-lg">{td.vehicle_driven}</h4>
                                                    <div className="text-sm text-[#FAF8F5]/50 flex items-center gap-1 mt-1">
                                                        <Calendar size={14} /> {new Date(td.drive_date).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                                                    td.verdict === 'top_contender' ? 'bg-green-100 text-green-800' :
                                                    td.verdict === 'maybe' ? 'bg-amber-100 text-amber-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {td.verdict === 'top_contender' ? 'Top Choice' : td.verdict === 'maybe' ? 'Maybe' : 'Eliminate'}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 mb-4 bg-[#14141B] rounded-xl p-3 border border-[#2A2A35]">
                                                <div className="text-center">
                                                    <div className="text-xs text-[#FAF8F5]/50 uppercase tracking-wider mb-1">Comfort</div>
                                                    <div className="font-bold text-[#FAF8F5]">{td.rating_comfort}/5</div>
                                                </div>
                                                <div className="text-center border-l border-[#2A2A35]">
                                                    <div className="text-xs text-[#FAF8F5]/50 uppercase tracking-wider mb-1">Perf</div>
                                                    <div className="font-bold text-[#FAF8F5]">{td.rating_performance}/5</div>
                                                </div>
                                                <div className="text-center border-l border-[#2A2A35]">
                                                    <div className="text-xs text-[#FAF8F5]/50 uppercase tracking-wider mb-1">Tech</div>
                                                    <div className="font-bold text-[#FAF8F5]">{td.rating_tech}/5</div>
                                                </div>
                                            </div>

                                            {td.overall_impression && (
                                                <p className="text-sm text-[#FAF8F5]/80 italic mb-4">"{td.overall_impression}"</p>
                                            )}

                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                {td.likes && (
                                                    <div>
                                                        <div className="flex items-center gap-1 font-bold text-green-700 mb-1">
                                                            <ThumbsUp size={14} /> Pros
                                                        </div>
                                                        <p className="text-[#FAF8F5]/70">{td.likes}</p>
                                                    </div>
                                                )}
                                                {td.dislikes && (
                                                    <div>
                                                        <div className="flex items-center gap-1 font-bold text-red-700 mb-1">
                                                            <ThumbsDown size={14} /> Cons
                                                        </div>
                                                        <p className="text-[#FAF8F5]/70">{td.dislikes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                    </div>
                )}

                {/* STEP 2: SHORTLIST */}
                {currentStep === 'shortlist' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between border-b pb-4">
                            <h2 className="text-2xl font-bold text-[#FAF8F5]">Select Vehicles</h2>
                            <div className="flex gap-2">
                                <select value={selectedConfigId} onChange={e => setSelectedConfigId(e.target.value)} className="px-4 py-2 rounded-xl border border-[#2A2A35] bg-[#1A1A24] font-sans text-sm focus:bg-[#14141B] min-w-[300px] text-[#FAF8F5]">
                                    <option value="">-- Add Vehicle to Shortlist --</option>
                                    {availableConfigs.filter(c => {
                                        const desired = engagement?.desired_segments || [];
                                        if (desired.length === 0) return true;
                                        return desired.includes(c.segment);
                                    }).map(c => (
                                        <option key={c.vehicle_config_id} value={c.vehicle_config_id}>{c.make} {c.model} ({c.model_year} {c.config_label})</option>
                                    ))}
                                </select>
                                <button onClick={handleAddVehicle} disabled={!selectedConfigId} className="bg-[#111111] text-white p-2 px-4 rounded-xl hover:bg-[#222222] disabled:opacity-50 font-bold flex items-center gap-2">
                                    <Plus size={16} /> Add
                                </button>
                            </div>
                        </div>

                        {shortlist.length === 0 ? (
                            <div className="py-12 text-center text-[#FAF8F5]/40 bg-[#1A1A24] rounded-2xl border border-dashed border-[#2A2A35]">
                                Select a vehicle configuration above to build the shortlist.
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {shortlist.map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-4 bg-[#1A1A24] border border-[#2A2A35] rounded-xl group font-sans">
                                        <div>
                                            <div className="font-bold text-lg font-['Space_Grotesk']">{item._config?.make} {item._config?.model}</div>
                                            <div className="text-sm text-[#FAF8F5]/50">{item._config?.model_year} • {item._config?.config_label}</div>
                                            <div className="flex flex-wrap gap-2 text-xs mt-2">
                                                {item._config?.segment && <span className="bg-[#14141B] border border-[#2A2A35] text-[#FAF8F5]/70 px-2 py-0.5 rounded-md font-medium">{item._config.segment}</span>}
                                                {item._config?.base_msrp && <span className="bg-[#14141B] border border-[#2A2A35] text-[#FAF8F5]/70 px-2 py-0.5 rounded-md">From ${item._config.base_msrp.toLocaleString()}</span>}
                                                {item._config?.length_in && <span className="bg-[#14141B] border border-[#2A2A35] text-[#FAF8F5]/70 px-2 py-0.5 rounded-md">{item._config.length_in}" Long</span>}
                                                {item._config?.max_cargo_cu_ft && <span className="bg-[#14141B] border border-[#2A2A35] text-[#FAF8F5]/70 px-2 py-0.5 rounded-md">{item._config.max_cargo_cu_ft} cuft Cargo</span>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <select
                                                value={item.status}
                                                onChange={e => handleItemChange(item.id, 'status', e.target.value)}
                                                className="px-3 py-2 rounded-lg bg-[#14141B] border font-sans text-sm text-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20"
                                            >
                                                <option value="recommended">Recommended</option>
                                                <option value="benchmark">Benchmark</option>
                                                <option value="excluded">Excluded</option>
                                            </select>
                                            <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 3: RATIONALE */}
                {currentStep === 'rationale' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between border-b pb-4">
                            <h2 className="text-2xl font-bold text-[#FAF8F5]">Strategy & Rationale</h2>
                        </div>

                        <div className="bg-[#1A1A24] p-6 rounded-2xl border border-[#2A2A35] font-sans">
                            <label className="block text-sm font-bold text-[#FAF8F5] mb-2">Strategist's Advisory Perspective</label>
                            <p className="text-xs text-[#FAF8F5]/50 mb-4">This narrative will appear as the preamble on the final deliverable PDF.</p>
                            <textarea
                                value={engagement?.notes_internal || ''}
                                onChange={e => handleEngagementChange('notes_internal', e.target.value)}
                                className="w-full p-4 rounded-xl border border-[#2A2A35] bg-[#14141B] text-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 resize-y min-h-[120px]"
                                placeholder="Based on the requirement for long-term reliability and heavy focus on space..."
                            ></textarea>
                        </div>

                        {shortlist.length > 0 && (
                            <div className="overflow-x-auto pb-4">
                                <table className="w-full text-left font-sans min-w-[800px] border border-[#2A2A35] rounded-xl overflow-hidden">
                                    <thead>
                                        <tr className="border-b border-[#2A2A35] bg-[#1A1A24]">
                                            <th className="py-3 px-4 font-bold text-[#FAF8F5] w-1/4">Vehicle</th>
                                            <th className="py-3 px-4 font-bold text-[#FAF8F5]">Length</th>
                                            <th className="py-3 px-4 font-bold text-[#FAF8F5]">Cargo (Max)</th>
                                            <th className="py-3 px-4 font-bold text-[#FAF8F5]">2nd Row Leg</th>
                                            <th className="py-3 px-4 font-bold text-[#FAF8F5]">Powertrain</th>
                                            <th className="py-3 px-4 font-bold text-[#FAF8F5]">Price (Base)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#2A2A35] bg-[#14141B]">
                                        {shortlist.filter(item => item.status !== 'excluded').map(item => {
                                            const c = item._config;
                                            if (!c) return null;
                                            const pt = (c.powertrains && c.powertrains.length > 0) ? c.powertrains[0] : null;
                                            return (
                                                <tr key={`cmp-${item.id}`} className="hover:bg-[#1A1A24] transition-colors">
                                                    <td className="py-3 px-4">
                                                        <div className="font-bold text-[#FAF8F5]">{c.make} {c.model}</div>
                                                        <div className="text-xs text-[#FAF8F5]/50">{c.config_label}</div>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-[#FAF8F5]/70 font-medium">{c.length_in ? `${c.length_in}"` : '--'}</td>
                                                    <td className="py-3 px-4 text-sm text-[#FAF8F5]/70 font-medium">{c.max_cargo_cu_ft ? `${c.max_cargo_cu_ft} cu ft` : '--'}</td>
                                                    <td className="py-3 px-4 text-sm text-[#FAF8F5]/70 font-medium">{c.legroom_2nd_row_in ? `${c.legroom_2nd_row_in}"` : '--'}</td>
                                                    <td className="py-3 px-4 text-sm text-[#FAF8F5]/70">
                                                        {pt ? (
                                                            <div>
                                                                <div className="font-bold text-[#FAF8F5] whitespace-nowrap">{pt.name}</div>
                                                                <div className="text-xs text-[#FAF8F5]/50 whitespace-nowrap">{pt.horsepower_hp || '--'}hp • {pt.combined_mpg || '--'} MPG • {pt.zero_to_sixty_sec || '--'}s</div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[#FAF8F5]/40">--</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm font-bold text-[#FAF8F5]">
                                                        {c.base_msrp ? `$${c.base_msrp.toLocaleString()}` : '--'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {shortlist.length === 0 ? (
                            <div className="py-12 text-center text-[#FAF8F5]/40 bg-[#1A1A24] rounded-2xl border border-dashed border-[#2A2A35] font-sans">
                                Return to Step 2 and add vehicles to write rationale.
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {shortlist.map(item => (
                                    <div key={item.id} className="p-6 bg-[#1A1A24] border border-[#2A2A35] rounded-2xl font-sans">
                                        <div className="flex justify-between items-center mb-6">
                                            <div>
                                                <div className="flex items-center gap-4">
                                                    <div className="font-bold text-xl font-['Space_Grotesk'] text-[#FAF8F5]">
                                                        {item._config?.make} {item._config?.model}
                                                        <span className={`ml-3 text-xs px-2 py-1 rounded-full uppercase tracking-wider font-bold ${item.status === 'recommended' ? 'bg-[#C9A84C]/10 text-[#C9A84C]' : 'bg-[#2A2A35] text-[#FAF8F5]/70'}`}>
                                                            {item.status}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                // Update model-level defaults
                                                                if (item._config?.vehicle_model_id) {
                                                                    await supabase.from('vehicle_models').update({
                                                                        default_best_for: item.best_for_tag || null,
                                                                        default_why_it_fits: item.why_it_fits_bullets || [],
                                                                        default_tradeoffs: item.tradeoffs_bullets || []
                                                                    }).eq('id', item._config.vehicle_model_id);
                                                                }

                                                                // Update config-level defaults
                                                                await supabase.from('vehicle_configs').update({
                                                                    default_trim_guidance: item.trim_guidance_notes || null
                                                                }).eq('id', item.vehicle_config_id);
                                                                alert('Success! Default config rationale updated.');
                                                                
                                                                // Update local state config so it carries over
                                                                setAvailableConfigs(prev => prev.map(c => c.vehicle_config_id === item.vehicle_config_id ? {
                                                                    ...c,
                                                                    default_best_for: item.best_for_tag || null,
                                                                    default_why_it_fits: item.why_it_fits_bullets || [],
                                                                    default_tradeoffs: item.tradeoffs_bullets || [],
                                                                    default_trim_guidance: item.trim_guidance_notes || null
                                                                } : c));
                                                            } catch (err) {
                                                                console.error(err);
                                                                alert('Error saving defaults');
                                                            }
                                                        }}
                                                        className="flex items-center gap-1 text-xs font-bold text-[#C9A84C] border border-[#C9A84C]/20 bg-[#C9A84C]/5 px-3 py-1.5 rounded-lg hover:bg-[#C9A84C]/10 transition-colors"
                                                        title="Save these bullet points as the permanent default for this vehicle config"
                                                    >
                                                        <Save size={14} /> Update Defaults
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="w-1/3">
                                                <input
                                                    type="text"
                                                    value={item.best_for_tag || ''}
                                                    onChange={e => handleItemChange(item.id, 'best_for_tag', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-xl border border-[#2A2A35] text-sm font-bold bg-[#14141B] text-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20"
                                                    placeholder="Best For Tag (e.g. Best Overall Fit)"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-bold mb-2">Why It Fits (One per line)</label>
                                                <textarea
                                                    value={item[`_why_it_fits_bullets_raw`] !== undefined ? item[`_why_it_fits_bullets_raw`] : (item.why_it_fits_bullets?.join('\n') || '')}
                                                    onChange={e => handleBulletsChange(item.id, 'why_it_fits_bullets', e.target.value)}
                                                    className="w-full p-4 rounded-xl border border-[#2A2A35] bg-[#14141B] text-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 resize-none h-32 text-sm"
                                                    placeholder="• Incredible space packaging&#10;• Trusted reliability"
                                                ></textarea>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold mb-2">Tradeoffs (One per line)</label>
                                                <textarea
                                                    value={item[`_tradeoffs_bullets_raw`] !== undefined ? item[`_tradeoffs_bullets_raw`] : (item.tradeoffs_bullets?.join('\n') || '')}
                                                    onChange={e => handleBulletsChange(item.id, 'tradeoffs_bullets', e.target.value)}
                                                    className="w-full p-4 rounded-xl border border-[#2A2A35] bg-[#14141B] text-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 resize-none h-32 text-sm"
                                                    placeholder="• Cabin trails competitors&#10;• Engine note is coarse"
                                                ></textarea>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <label className="block text-sm font-bold mb-2">Trim Guidance Notes</label>
                                            <textarea
                                                value={item.trim_guidance_notes || ''}
                                                onChange={e => handleItemChange(item.id, 'trim_guidance_notes', e.target.value)}
                                                className="w-full p-3 rounded-xl border border-[#2A2A35] bg-[#14141B] text-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 resize-none h-20 text-sm"
                                                placeholder="Target the XLE Premium for the best value..."
                                            ></textarea>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 4: PREVIEW */}
                {currentStep === 'preview' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <h2 className="text-2xl font-bold border-b pb-4 text-[#FAF8F5]">Ready to Publish</h2>

                        <div className="bg-[#1A1A24] p-8 rounded-2xl text-center">
                            <h3 className="text-xl font-bold mb-2 text-[#FAF8F5]">Deliverable Status: <span className="text-[#C9A84C]">Draft</span></h3>
                            <p className="text-[#FAF8F5]/70 mb-6 font-sans max-w-lg mx-auto">
                                The snapshot generator will pull the current market data, specs, and safety ratings for your <strong>{shortlist.length} selected vehicles</strong> and compile them into an immutable deliverable for <strong>{client?.primary_contact_name}</strong>.
                            </p>

                            <button onClick={handlePublish} disabled={saving || shortlist.length === 0} className="inline-flex items-center gap-2 bg-[#111111] text-white px-8 py-4 rounded-xl hover:bg-[#222222] transition-colors disabled:opacity-50 text-lg font-bold">
                                {saving ? <Loader2 className="animate-spin" size={24} /> : <Eye size={24} />}
                                <span>Generate & View Snapshot</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Footer */}
            <div className="flex justify-between items-center mt-6">
                <button
                    onClick={() => setCurrentStep(STEPS[Math.max(0, currentStepIndex - 1)].id)}
                    disabled={currentStepIndex === 0}
                    className="flex items-center gap-2 px-6 py-3 font-bold text-[#FAF8F5]/50 hover:text-[#FAF8F5] transition-colors disabled:opacity-0"
                >
                    <ChevronLeft size={20} /> Back
                </button>

                {currentStep !== 'preview' && (
                    <button
                        onClick={() => setCurrentStep(STEPS[Math.min(STEPS.length - 1, currentStepIndex + 1)].id)}
                        className="flex items-center gap-2 px-6 py-3 font-bold bg-[#111111] text-white rounded-xl hover:bg-[#222222] transition-colors"
                    >
                        Next Step <ChevronRight size={20} />
                    </button>
                )}
            </div>

        </div>
    );
};

export default EngagementBuilder;
