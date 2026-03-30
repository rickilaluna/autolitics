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
        current_vehicles: ''
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
            setFormData(data);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const payload = { ...formData };

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
                        <input required type="text" name="primary_contact_name" value={formData.primary_contact_name || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 focus:border-[#C9A84C] transition-all font-sans" placeholder="Zachary Portin" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1 font-sans">Secondary Contact Name</label>
                        <input type="text" name="secondary_contact_name" value={formData.secondary_contact_name || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 focus:border-[#C9A84C] transition-all font-sans" placeholder="Elizabeth Portin" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1 font-sans">Primary Email</label>
                        <input type="email" name="primary_email" value={formData.primary_email || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 focus:border-[#C9A84C] transition-all font-sans" placeholder="email@example.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1 font-sans">Secondary Email</label>
                        <input type="email" name="secondary_email" value={formData.secondary_email || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 focus:border-[#C9A84C] transition-all font-sans" placeholder="email2@example.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1 font-sans">Location</label>
                        <input type="text" name="location" value={formData.location || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 focus:border-[#C9A84C] transition-all font-sans" placeholder="Austin, TX" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1 font-sans">Household Notes</label>
                    <textarea name="household_notes" value={formData.household_notes || ''} onChange={handleChange} rows="3" className="w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 focus:border-[#C9A84C] transition-all font-sans resize-none" placeholder="Growing family needs (2 children + large dog)"></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1 font-sans">Current Vehicles (Garage)</label>
                    <input type="text" name="current_vehicles" value={formData.current_vehicles || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 transition-all font-sans" placeholder="2008 RAV4, 2017 GLC" />
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
