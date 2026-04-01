import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const ClientDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        primary_contact_name: '',
        secondary_contact_name: '',
        primary_email: '',
        secondary_email: '',
        location: '',
        household_notes: '',
        current_vehicles: '',
        buying_timeline: '',
        primary_goal: '',
        advisory_intro_call_at: null,
        advisory_discovery_at: null,
        advisory_strategy_brief_at: null,
        advisory_negotiation_support_at: null,
        advisory_engagement_completed_at: null,
    });

    useEffect(() => {
        if (!isNew) {
            fetchClient();
        }
    }, [id]);

    const fetchClient = async () => {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('id', id)
            .single();

        if (data) {
            setFormData((prev) => ({ ...prev, ...data }));
        } else if (error) {
            console.error('Error fetching client:', error);
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    const formatDateInput = (iso) => {
        if (!iso) return '';
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return '';
        return d.toISOString().slice(0, 10);
    };

    const handleMilestoneDate = (name, dateStr) => {
        setFormData((prev) => ({
            ...prev,
            [name]: dateStr ? new Date(`${dateStr}T12:00:00`).toISOString() : null,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const payload = { ...formData };
        ['advisory_intro_call_at', 'advisory_discovery_at', 'advisory_strategy_brief_at', 'advisory_negotiation_support_at', 'advisory_engagement_completed_at'].forEach((k) => {
            if (payload[k] === '') payload[k] = null;
        });

        if (isNew) {
            const { error } = await supabase.from('clients').insert([payload]);
            if (!error) navigate('/admin/clients');
            else console.error(error);
        } else {
            const { error } = await supabase.from('clients').update(payload).eq('id', id);
            if (!error) navigate('/admin/clients');
            else console.error(error);
        }
        setSaving(false);
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-[#FAF8F5]/40" size={32} /></div>;



    return (
        <div className="font-['Space_Grotesk'] max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
                <Link to="/admin/clients" className="p-2 rounded-full hover:bg-[#2A2A35] transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-3xl font-bold">{isNew ? 'New Client' : 'Edit Client'}</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-[#14141B] rounded-[2rem] shadow-sm border border-[#2A2A35] p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1 font-sans">Primary Contact Name</label>
                        <input required type="text" name="primary_contact_name" value={formData.primary_contact_name || ''} onChange={handleChange} className="studio-touch-input w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 focus:border-[#C9A84C] transition-all font-sans" placeholder="Zachary Portin" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1 font-sans">Secondary Contact Name</label>
                        <input type="text" name="secondary_contact_name" value={formData.secondary_contact_name || ''} onChange={handleChange} className="studio-touch-input w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 focus:border-[#C9A84C] transition-all font-sans" placeholder="Elizabeth Portin" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1 font-sans">Primary Email</label>
                        <input type="email" name="primary_email" value={formData.primary_email || ''} onChange={handleChange} className="studio-touch-input w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 focus:border-[#C9A84C] transition-all font-sans" placeholder="email@example.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1 font-sans">Secondary Email</label>
                        <input type="email" name="secondary_email" value={formData.secondary_email || ''} onChange={handleChange} className="studio-touch-input w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 focus:border-[#C9A84C] transition-all font-sans" placeholder="email2@example.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1 font-sans">Location</label>
                        <input type="text" name="location" value={formData.location || ''} onChange={handleChange} className="studio-touch-input w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 focus:border-[#C9A84C] transition-all font-sans" placeholder="Austin, TX" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1 font-sans">Household Notes</label>
                    <textarea name="household_notes" value={formData.household_notes || ''} onChange={handleChange} rows="3" className="studio-touch-input w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 focus:border-[#C9A84C] transition-all font-sans resize-none" placeholder="Growing family needs (2 children + large dog)"></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1 font-sans">Current Vehicles (Garage)</label>
                    <input type="text" name="current_vehicles" value={formData.current_vehicles || ''} onChange={handleChange} className="studio-touch-input w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 transition-all font-sans" placeholder="2008 RAV4, 2017 GLC" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1 font-sans">Buying timeline</label>
                        <input type="text" name="buying_timeline" value={formData.buying_timeline || ''} onChange={handleChange} className="studio-touch-input w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 transition-all font-sans" placeholder="Within 1-3 months" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1 font-sans">Primary goal</label>
                        <input type="text" name="primary_goal" value={formData.primary_goal || ''} onChange={handleChange} className="studio-touch-input w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 transition-all font-sans" placeholder="Narrow segment, minimize total cost" />
                    </div>
                </div>

                <div className="border border-[#2A2A35] rounded-2xl p-6 space-y-4 bg-[#1A1A24]/40">
                    <h2 className="text-lg font-semibold text-[#FAF8F5]">Advisory milestones</h2>
                    <p className="text-sm text-[#FAF8F5]/50">Set the date when each 1:1 step is completed. Clear a field to unset. &quot;Engagement complete&quot; is when the vehicle purchase is done.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            ['advisory_intro_call_at', 'Free intro call'],
                            ['advisory_discovery_at', 'Advisory discovery session'],
                            ['advisory_strategy_brief_at', 'Strategy & recommendation brief'],
                            ['advisory_negotiation_support_at', 'Negotiation support (add-on)'],
                            ['advisory_engagement_completed_at', 'Engagement complete (vehicle purchased)'],
                        ].map(([key, label]) => (
                            <div key={key}>
                                <label className="block text-xs font-medium text-[#FAF8F5]/60 mb-1 font-sans">{label}</label>
                                <input
                                    type="date"
                                    value={formatDateInput(formData[key])}
                                    onChange={(e) => handleMilestoneDate(key, e.target.value)}
                                    className="studio-touch-input w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 font-sans"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={saving} className="flex items-center gap-2 bg-[#111111] text-white px-8 py-4 rounded-xl hover:bg-[#222222] transition-colors disabled:opacity-50">
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        <span className="font-semibold text-lg">Save Client File</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ClientDetail;
