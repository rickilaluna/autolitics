import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const ClientsList = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClients = async () => {
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching clients:', error);
            } else {
                setClients(data || []);
            }
            setLoading(false);
        };
        fetchClients();
    }, []);

    return (
        <div className="font-['Space_Grotesk']">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Clients</h1>
                <Link to="/admin/clients/new" className="flex items-center gap-2 bg-[#C9A84C] text-white px-4 py-2 rounded-xl hover:bg-[#D4B86A] transition-colors">
                    <Plus size={20} />
                    <span>New Client</span>
                </Link>
            </div>

            <div className="bg-[#14141B] rounded-[2rem] shadow-sm border border-[#2A2A35] overflow-hidden">
                {loading ? (
                    <div className="p-8 flex justify-center text-[#FAF8F5]/40">
                        <Loader2 className="animate-spin" size={32} />
                    </div>
                ) : clients.length === 0 ? (
                    <div className="p-8 text-center text-[#FAF8F5]/50">
                        <p>No clients found. Click "New Client" to get started.</p>
                    </div>
                ) : (
                    <table className="w-full text-left font-sans">
                        <thead className="bg-[#1A1A24] text-sm text-[#FAF8F5]/50 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2A2A35]">
                            {clients.map((client) => (
                                <tr key={client.id} className="hover:bg-[#1A1A24]/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-[#FAF8F5]">
                                        {client.primary_contact_name} {client.secondary_contact_name ? `& ${client.secondary_contact_name}` : ''}
                                    </td>
                                    <td className="px-6 py-4 text-[#FAF8F5]/50">
                                        {client.primary_email}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link to={`/admin/clients/${client.id}`} className="text-[#C9A84C] hover:underline font-medium text-sm">
                                            Manage
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ClientsList;
