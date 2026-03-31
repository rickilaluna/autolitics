import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

/** One row per email (survivor = most recently updated). Shows duplicate count when DB still has copies. */
function buildDedupedRows(clients) {
    const byKey = new Map();
    for (const c of clients) {
        const key = (c.primary_email || '').trim().toLowerCase() || `__id_${c.id}`;
        const prev = byKey.get(key);
        if (!prev) {
            byKey.set(key, { client: c, duplicateCount: 1 });
            continue;
        }
        prev.duplicateCount += 1;
        const prevTs = new Date(prev.client.updated_at || prev.client.created_at || 0).getTime();
        const curTs = new Date(c.updated_at || c.created_at || 0).getTime();
        if (curTs >= prevTs) prev.client = c;
    }
    return [...byKey.values()].sort(
        (a, b) =>
            new Date(b.client.updated_at || b.client.created_at || 0) -
            new Date(a.client.updated_at || a.client.created_at || 0)
    );
}

/** Map user_id -> distinct product_type values from purchases (requires RLS admin read). */
function buildPurchaseLabelsByUserId(rows) {
    const map = {};
    (rows || []).forEach((r) => {
        const uid = r.user_id;
        if (!uid) return;
        if (!map[uid]) map[uid] = new Set();
        if (r.product_type) map[uid].add(String(r.product_type).toLowerCase());
    });
    return Object.fromEntries(
        Object.entries(map).map(([uid, set]) => [uid, [...set].sort()])
    );
}

function formatProductTypes(types) {
    if (!types?.length) return '—';
    return types
        .map((t) => (t === 'advisory' ? 'Advisory' : t === 'guide' ? 'Guide' : t))
        .join(' · ');
}

const ClientsList = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [purchasesByUserId, setPurchasesByUserId] = useState({});

    const displayRows = useMemo(() => buildDedupedRows(clients), [clients]);

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

    useEffect(() => {
        const loadPurchases = async () => {
            const { data, error } = await supabase
                .from('purchases')
                .select('user_id, product_type');
            if (error) {
                console.warn('Admin purchases fetch:', error.message);
                return;
            }
            setPurchasesByUserId(buildPurchaseLabelsByUserId(data));
        };
        loadPurchases();
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
                                <th className="px-6 py-4 hidden md:table-cell">Products</th>
                                <th className="px-6 py-4 hidden lg:table-cell">Advisory pipeline</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2A2A35]">
                            {displayRows.map(({ client, duplicateCount }) => (
                                <tr key={client.id} className="hover:bg-[#1A1A24]/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-[#FAF8F5]">
                                        {client.primary_contact_name} {client.secondary_contact_name ? `& ${client.secondary_contact_name}` : ''}
                                        {duplicateCount > 1 && (
                                            <span
                                                className="ml-2 text-xs font-normal text-amber-400/90 font-['JetBrains_Mono']"
                                                title="Multiple client rows in DB for this email — run dedupe migration or merge in Supabase"
                                            >
                                                ×{duplicateCount}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-[#FAF8F5]/50">
                                        {client.primary_email || '—'}
                                    </td>
                                    <td className="px-6 py-4 text-[#FAF8F5]/40 text-xs font-['JetBrains_Mono'] hidden md:table-cell">
                                        {client.auth_user_id
                                            ? formatProductTypes(purchasesByUserId[client.auth_user_id])
                                            : '—'}
                                    </td>
                                    <td className="px-6 py-4 text-[#FAF8F5]/40 text-xs font-['JetBrains_Mono'] hidden lg:table-cell max-w-md">
                                        {client.advisory_engagement_completed_at ? (
                                            <span className="text-emerald-400/90">Complete</span>
                                        ) : (
                                            <span className="space-x-1">
                                                <span title="Intro call">{client.advisory_intro_call_at ? 'I' : '·'}</span>
                                                <span title="Discovery">{client.advisory_discovery_at ? 'D' : '·'}</span>
                                                <span title="Brief">{client.advisory_strategy_brief_at ? 'B' : '·'}</span>
                                                <span title="Negotiation">{client.advisory_negotiation_support_at ? 'N' : '·'}</span>
                                            </span>
                                        )}
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
