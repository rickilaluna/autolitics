import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const EngagementsList = () => {
    const [engagements, setEngagements] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewModal, setShowNewModal] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const { data: eData } = await supabase
            .from('engagements')
            .select('*, clients(primary_contact_name)')
            .order('created_at', { ascending: false });
        if (eData) setEngagements(eData);

        const { data: cData } = await supabase.from('clients').select('id, primary_contact_name').order('primary_contact_name');
        if (cData) setClients(cData);

        setLoading(false);
    };

    const handleCreateNew = async () => {
        if (!selectedClientId) return;
        const { data, error } = await supabase
            .from('engagements')
            .insert([{ client_id: selectedClientId, status: 'intake' }])
            .select()
            .single();

        if (data) {
            navigate(`/admin/engagements/${data.id}`);
        } else {
            console.error('Error creating engagement:', error);
        }
    };

    return (
        <div className="font-['Space_Grotesk'] relative">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Engagements</h1>
                <button onClick={() => setShowNewModal(true)} className="flex items-center gap-2 bg-[#C9A84C] text-white px-4 py-2 rounded-xl hover:bg-[#D4B86A] transition-colors">
                    <Plus size={20} />
                    <span>New Engagement</span>
                </button>
            </div>

            <div className="bg-[#14141B] rounded-[2rem] shadow-sm border border-[#2A2A35] overflow-hidden">
                {loading ? (
                    <div className="p-8 flex justify-center text-[#FAF8F5]/40">
                        <Loader2 className="animate-spin" size={32} />
                    </div>
                ) : engagements.length === 0 ? (
                    <div className="p-8 text-center text-[#FAF8F5]/50">
                        <p>No engagements found. Click "New Engagement" to start.</p>
                    </div>
                ) : (
                    <table className="w-full text-left font-sans">
                        <thead className="bg-[#1A1A24] text-sm text-[#FAF8F5]/50 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Client</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Created</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2A2A35]">
                            {engagements.map((eng) => (
                                <tr key={eng.id} className="hover:bg-[#1A1A24]/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-[#FAF8F5]">
                                        {eng.clients?.primary_contact_name || 'Unknown Client'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${eng.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                            eng.status === 'strategy' ? 'bg-blue-100 text-blue-800' :
                                                'bg-[#1D1D26] text-[#FAF8F5]/90'
                                            }`}>
                                            {eng.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-[#FAF8F5]/50 text-sm">
                                        {new Date(eng.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link to={`/admin/engagements/${eng.id}`} className="text-[#C9A84C] hover:underline font-medium text-sm">
                                            Open Builder
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal for new engagement */}
            {showNewModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-[#14141B] p-8 rounded-[2rem] w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-bold mb-4">New Engagement</h2>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-[#FAF8F5]/80 mb-1 font-sans">Select Client</label>
                            <select
                                value={selectedClientId}
                                onChange={e => setSelectedClientId(e.target.value)}
                                className="studio-touch-input w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 transition-all font-sans"
                            >
                                <option value="">-- Choose a Client --</option>
                                {clients.map(c => (
                                    <option key={c.id} value={c.id}>{c.primary_contact_name}</option>
                                ))}
                            </select>
                            {clients.length === 0 && (
                                <div className="mt-3 text-sm text-[#C9A84C]">
                                    No clients found. <Link to="/admin/clients/new" className="underline font-semibold hover:text-[#D4B86A]">Create one first</Link>.
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowNewModal(false)} className="px-4 py-2 text-[#FAF8F5]/50 hover:text-[#FAF8F5] font-medium">Cancel</button>
                            <button onClick={handleCreateNew} disabled={!selectedClientId} className="bg-[#111111] text-white px-6 py-2 rounded-xl hover:bg-[#222222] transition-colors disabled:opacity-50">Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EngagementsList;
