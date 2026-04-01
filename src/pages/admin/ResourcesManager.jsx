import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Plus, Edit2, Trash2, Check, ExternalLink } from 'lucide-react';

const ICONS = ['file-text', 'book-open', 'file-spreadsheet', 'shield-check', 'calculator', 'link'];

const ResourcesManager = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    // Form stuff
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        document_url: '',
        icon_type: 'file-text',
        sort_order: 0,
        is_active: true
    });

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        const { data, error } = await supabase
            .from('advisory_resources')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) {
            // eslint-disable-next-line no-undef
            console.error('Error fetching resources:', error);
        } else {
            setResources(data || []);
        }
        setLoading(false);
    };

    const handleEditClick = (resource) => {
        setFormData({
            title: resource.title,
            description: resource.description || '',
            document_url: resource.document_url,
            icon_type: resource.icon_type,
            sort_order: resource.sort_order,
            is_active: resource.is_active
        });
        setEditingId(resource.id);
        setIsCreating(false);
    };

    const handleCreateClick = () => {
        setFormData({
            title: '',
            description: '',
            document_url: '',
            icon_type: 'file-text',
            sort_order: resources.length + 1,
            is_active: true
        });
        setEditingId(null);
        setIsCreating(true);
    };

    const handleCancel = () => {
        setEditingId(null);
        setIsCreating(false);
    };

    const handleSave = async () => {
        if (!formData.title || !formData.document_url) return;
        
        setLoading(true);
        if (isCreating) {
            const { error } = await supabase
                .from('advisory_resources')
                .insert([formData]);
            if (!error) await fetchResources();
        } else {
            const { error } = await supabase
                .from('advisory_resources')
                .update(formData)
                .eq('id', editingId);
            if (!error) await fetchResources();
        }
        setEditingId(null);
        setIsCreating(false);
        setLoading(false);
    };

    const handleDelete = async (id) => {
        // eslint-disable-next-line no-undef
        if (!window.confirm("Are you sure you want to delete this resource?")) return;
        setLoading(true);
        const { error } = await supabase.from('advisory_resources').delete().eq('id', id);
        if (!error) await fetchResources();
        setLoading(false);
    };

    const FormTemplate = () => (
        <div className="bg-[#14141B] rounded-[2rem] shadow-lg border border-[#C9A84C]/20 p-8 space-y-6 mb-8 font-sans">
            <h2 className="text-xl font-bold font-['Space_Grotesk'] text-[#FAF8F5] border-b pb-4">
                {isCreating ? 'Add New Resource' : 'Edit Resource'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1 font-sans">Title</label>
                    <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="studio-touch-input w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 focus:border-[#C9A84C] transition-all" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1 font-sans">Document URL / PDF Link</label>
                    <input type="url" value={formData.document_url} onChange={e => setFormData({...formData, document_url: e.target.value})} className="studio-touch-input w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 focus:border-[#C9A84C] transition-all" />
                </div>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1 font-sans">Description (1-2 sentences)</label>
                <textarea rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="studio-touch-input w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 focus:border-[#C9A84C] transition-all resize-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1 font-sans">Icon Type</label>
                    <select value={formData.icon_type} onChange={e => setFormData({...formData, icon_type: e.target.value})} className="studio-touch-input w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 focus:border-[#C9A84C] transition-all">
                        {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1 font-sans">Sort Order</label>
                    <input type="number" value={formData.sort_order} onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})} className="studio-touch-input w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 transition-all" />
                </div>
                <div className="flex items-center pt-8">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="w-5 h-5 rounded border-[#2A2A35] text-[#C9A84C] focus:ring-[#C9A84C]" />
                        <span className="text-sm font-medium text-[#FAF8F5]/80">Active (Visible to Clients)</span>
                    </label>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#2A2A35]">
                <button onClick={handleCancel} className="px-6 py-2 text-[#FAF8F5]/50 hover:text-[#FAF8F5] font-medium transition-colors">Cancel</button>
                <button onClick={handleSave} className="flex items-center gap-2 bg-[#111111] text-white px-8 py-2 rounded-xl hover:bg-[#222222] transition-colors">
                    <Check size={18} /> Save Resource
                </button>
            </div>
        </div>
    );

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-[#FAF8F5]/40" size={32} /></div>;

    return (
        <div className="font-['Space_Grotesk'] max-w-5xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Resources Library</h1>
                    <p className="text-[#FAF8F5]/50 mt-2 font-sans text-sm">Manage the PDFs and playbooks visible to advisory clients.</p>
                </div>
                <button 
                    onClick={handleCreateClick}
                    disabled={isCreating || editingId}
                    className="flex items-center gap-2 bg-[#C9A84C] text-white px-5 py-2.5 rounded-xl hover:bg-[#D4B86A] transition-colors disabled:opacity-50 font-medium"
                >
                    <Plus size={20} /> Add Resource
                </button>
            </div>

            {/* Built-in Resources */}
            <div className="bg-[#14141B] rounded-[2rem] border border-[#C9A84C]/20 p-6 mb-6">
                <p className="text-xs font-medium text-[#C9A84C]/60 uppercase tracking-widest font-['JetBrains_Mono'] mb-4">Built-in Resources</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <a
                        href="/resources/buying-framework"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between bg-[#0D0D12] rounded-xl border border-[#2A2A35] px-5 py-4 hover:border-[#C9A84C]/30 transition-colors group"
                    >
                        <div>
                            <div className="text-sm font-semibold text-[#FAF8F5]">
                                The Autolitics Car Buying Framework
                            </div>
                            <div className="text-xs text-[#FAF8F5]/40 mt-0.5 font-['JetBrains_Mono']">/resources/buying-framework</div>
                        </div>
                        <ExternalLink size={16} className="text-[#FAF8F5]/30 group-hover:text-[#C9A84C] transition-colors shrink-0 ml-4" />
                    </a>
                    <a
                        href="/resources/playbook"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between bg-[#0D0D12] rounded-xl border border-[#2A2A35] px-5 py-4 hover:border-[#C9A84C]/30 transition-colors group"
                    >
                        <div>
                            <div className="text-sm font-semibold text-[#FAF8F5]">
                                The Autolitics Playbook
                            </div>
                            <div className="text-xs text-[#FAF8F5]/40 mt-0.5 font-['JetBrains_Mono']">/resources/playbook</div>
                        </div>
                        <ExternalLink size={16} className="text-[#FAF8F5]/30 group-hover:text-[#C9A84C] transition-colors shrink-0 ml-4" />
                    </a>
                    <a
                        href="/resources/scorecard"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between bg-[#0D0D12] rounded-xl border border-[#2A2A35] px-5 py-4 hover:border-[#C9A84C]/30 transition-colors group"
                    >
                        <div>
                            <div className="text-sm font-semibold text-[#FAF8F5]">
                                Vehicle Evaluation Scorecard
                            </div>
                            <div className="text-xs text-[#FAF8F5]/40 mt-0.5 font-['JetBrains_Mono']">/resources/scorecard</div>
                        </div>
                        <ExternalLink size={16} className="text-[#FAF8F5]/30 group-hover:text-[#C9A84C] transition-colors shrink-0 ml-4" />
                    </a>
                    <a
                        href="/resources/dealer-offer-comparison"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between bg-[#0D0D12] rounded-xl border border-[#2A2A35] px-5 py-4 hover:border-[#C9A84C]/30 transition-colors group"
                    >
                        <div>
                            <div className="text-sm font-semibold text-[#FAF8F5]">
                                Dealer Offer Comparison Template
                            </div>
                            <div className="text-xs text-[#FAF8F5]/40 mt-0.5 font-['JetBrains_Mono']">/resources/dealer-offer-comparison</div>
                        </div>
                        <ExternalLink size={16} className="text-[#FAF8F5]/30 group-hover:text-[#C9A84C] transition-colors shrink-0 ml-4" />
                    </a>
                    <a
                        href="/resources/vehicle-comparison-matrix"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between bg-[#0D0D12] rounded-xl border border-[#2A2A35] px-5 py-4 hover:border-[#C9A84C]/30 transition-colors group"
                    >
                        <div>
                            <div className="text-sm font-semibold text-[#FAF8F5]">
                                Vehicle Decision Engine
                            </div>
                            <div className="text-xs text-[#FAF8F5]/40 mt-0.5 font-['JetBrains_Mono']">/resources/vehicle-comparison-matrix</div>
                        </div>
                        <ExternalLink size={16} className="text-[#FAF8F5]/30 group-hover:text-[#C9A84C] transition-colors shrink-0 ml-4" />
                    </a>
                </div>
            </div>

            {(isCreating || editingId) && <FormTemplate />}

            <div className="bg-[#14141B] rounded-[2rem] shadow-sm border border-[#2A2A35] overflow-hidden">
                <table className="w-full text-left font-sans">
                    <thead className="bg-[#1A1A24] text-sm text-[#FAF8F5]/50 uppercase font-medium">
                        <tr>
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4">URL</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Order</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2A2A35]">
                        {resources.map((res) => (
                            <tr key={res.id} className="hover:bg-[#1A1A24]/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-[#FAF8F5]">
                                    {res.title}
                                </td>
                                <td className="px-6 py-4 text-[#FAF8F5]/50 text-sm truncate max-w-[200px]">
                                    <a href={res.document_url} target="_blank" rel="noopener noreferrer" className="hover:text-[#C9A84C] underline">
                                        {res.document_url}
                                    </a>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${res.is_active ? 'bg-green-100 text-green-800' : 'bg-[#1D1D26] text-[#FAF8F5]/90'}`}>
                                        {res.is_active ? 'Active' : 'Hidden'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-[#FAF8F5]/50">
                                    {res.sort_order}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-3 text-[#FAF8F5]/40">
                                        <a href={res.document_url} target="_blank" rel="noopener noreferrer" className="hover:text-[#C9A84C] transition-colors" title="Open">
                                            <ExternalLink size={18} />
                                        </a>
                                        <button onClick={() => handleEditClick(res)} className="hover:text-blue-400 transition-colors" title="Edit">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(res.id)} className="hover:text-red-500 transition-colors" title="Delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {resources.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-[#FAF8F5]/50">
                                    No resources found. Click "Add Resource" to upload one.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ResourcesManager;
