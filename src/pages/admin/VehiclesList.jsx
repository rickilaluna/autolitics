import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Loader2, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const SIZES = ["Compact", "Midsize", "3-Row", "Truck-Based"];
const USE_CASES = ["Daily Driver", "Adventure", "Performance"];
const MSRP_TIERS = ["Under $35k", "$35–50k", "$50–65k", "$60–85k", "$85k+"];
const POSITIONING = ["Mainstream", "Near-Luxury", "Luxury", "Ultra-Premium"];
const POWERTRAINS = ["Gas", "Hybrid", "Gas/Hybrid", "Electric", "Gas/Hybrid/Electric", "Gas/Electric"];
const ORIGINS = ["American", "Japanese", "Korean", "European"];

const msrpColors = {
    "Under $35k": { bg: "#14532d", text: "#bbf7d0" },
    "$35–50k": { bg: "#0c4a6e", text: "#bae6fd" },
    "$50–65k": { bg: "#312e81", text: "#c7d2fe" },
    "$60–85k": { bg: "#451a03", text: "#fed7aa" },
    "$85k+": { bg: "#4c0519", text: "#fecdd3" },
};

const posColors = {
    "Mainstream": { bg: "#1a2e3a", text: "#7dd3fc" },
    "Near-Luxury": { bg: "#2a1a4a", text: "#d8b4fe" },
    "Luxury": { bg: "#3a2800", text: "#fde68a" },
    "Ultra-Premium": { bg: "#3b0764", text: "#f0abfc" },
};

const sizeColors = {
    "Compact": { bg: "#1a3a2a", text: "#6ee7b7" },
    "Midsize": { bg: "#1a2e4a", text: "#7dd3fc" },
    "3-Row": { bg: "#2d1a4a", text: "#c4b5fd" },
    "Truck-Based": { bg: "#3a2010", text: "#fdba74" },
};

const useCaseIcons = { "Daily Driver": "🏙️", "Adventure": "🏔️", "Performance": "⚡" };

const ptColors = {
    "Electric": "#34d399", "Hybrid": "#2dd4bf",
    "Gas/Hybrid": "#fbbf24", "Gas/Hybrid/Electric": "#5eead4",
    "Gas/Electric": "#a3e635", "Gas": "#64748b",
};

function Tag({ label, colors }) {
    if (!label) return <span className="text-[#FAF8F5]/50">—</span>;
    return (
        <span style={{
            display: "inline-block", fontSize: "11px", fontWeight: "600",
            padding: "2px 8px", borderRadius: "3px",
            background: colors?.bg || '#333', color: colors?.text || '#fff', fontFamily: "system-ui",
            whiteSpace: "nowrap"
        }}>{label}</span>
    );
}

const msrpOrder = ["Under $35k", "$35–50k", "$50–65k", "$60–85k", "$85k+"];
const posOrder = ["Mainstream", "Near-Luxury", "Luxury", "Ultra-Premium"];

export default function VehiclesList() {
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ size: [], useCase: [], msrp: [], positioning: [], powertrain: [], origin: [] });
    const [sortBy, setSortBy] = useState("name");
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchVehicles = async () => {
            const { data, error } = await supabase
                .from('vehicle_models')
                .select('*');
            if (!error && data) {
                setVehicles(data);
            }
            setLoading(false);
        };
        fetchVehicles();
    }, []);

    const toggle = (key, val) =>
        setFilters(f => ({ ...f, [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val] }));

    const activeCount = Object.values(filters).flat().length;
    const clearAll = () => setFilters({ size: [], useCase: [], msrp: [], positioning: [], powertrain: [], origin: [] });

    const filtered = useMemo(() => {
        return vehicles
            .filter(v => {
                if (search && !(v.make + " " + v.model).toLowerCase().includes(search.toLowerCase())) return false;
                if (filters.size.length && !filters.size.includes(v.segment)) return false;
                if (filters.useCase.length && !filters.useCase.includes(v.use_case)) return false;
                if (filters.msrp.length && !filters.msrp.includes(v.msrp_tier)) return false;
                if (filters.positioning.length && !filters.positioning.includes(v.positioning)) return false;
                if (filters.powertrain.length && !filters.powertrain.includes(v.powertrain_summary)) return false;
                if (filters.origin.length && !filters.origin.includes(v.origin)) return false;
                return true;
            })
            .sort((a, b) => {
                if (sortBy === "msrp") return msrpOrder.indexOf(a.msrp_tier) - msrpOrder.indexOf(b.msrp_tier);
                if (sortBy === "positioning") return posOrder.indexOf(a.positioning) - posOrder.indexOf(b.positioning);
                const aName = a.make + " " + a.model;
                const bName = b.make + " " + b.model;
                return aName.localeCompare(bName);
            });
    }, [vehicles, filters, search, sortBy]);

    if (loading) {
        return <div className="p-8 flex justify-center text-[#FAF8F5]/50"><Loader2 className="animate-spin" size={32} /></div>;
    }

    return (
        <div className="font-['Space_Grotesk'] flex-1 flex flex-col w-full h-full text-[#e2e8f0]">
            {/* Header */}
            <div style={{ borderBottom: "1px solid #1e2533", padding: "20px 24px" }} className="flex justify-between items-center bg-[#0d1018]">
                <div className="flex items-baseline gap-4 flex-wrap">
                    <h1 className="text-xl font-bold tracking-tight text-white mb-0">Vehicle Library Explorer</h1>
                    <span className="text-xs font-mono text-slate-500">{filtered.length} / {vehicles.length} vehicles</span>
                </div>
                <Link to="/admin/vehicles/new" className="flex items-center gap-2 bg-[#C9A84C] text-white px-3 py-1.5 rounded-lg hover:bg-[#D4B86A] transition-colors text-sm font-semibold">
                    <Plus size={16} />
                    <span>New</span>
                </Link>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div style={{ width: "220px", borderRight: "1px solid #1e2533", padding: "16px", background: "#0d1018", overflowY: "auto" }}>
                    <input
                        type="text" placeholder="Search make or model..." value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ width: "100%", background: "#1a2030", border: "1px solid #2a3348", borderRadius: "6px", padding: "8px 12px", fontSize: "12px", color: "#e2e8f0", marginBottom: "20px", boxSizing: "border-box" }}
                        className="studio-touch-input focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
                    />

                    {[
                        { key: "size", label: "SEGMENT", values: SIZES, accent: "#0f5132" },
                        { key: "useCase", label: "USE CASE", values: USE_CASES, accent: "#1e3a5f", icons: useCaseIcons },
                        { key: "msrp", label: "MSRP TIER", values: MSRP_TIERS, accent: "#0369a1" },
                        { key: "positioning", label: "POSITIONING", values: POSITIONING, accent: "#7c3aed" },
                        { key: "powertrain", label: "POWERTRAIN", values: POWERTRAINS, accent: "#065f46" },
                        { key: "origin", label: "ORIGIN", values: ORIGINS, accent: "#92400e" },
                    ].map(({ key, label, values, accent, icons }) => (
                        <div key={key} style={{ marginBottom: "20px" }}>
                            <div style={{ fontSize: "10px", letterSpacing: "1px", color: "#64748b", fontFamily: "system-ui", fontWeight: "800", mb: "8px" }} className="mb-2">{label}</div>
                            <div className="flex flex-col gap-1">
                                {values.map(v => (
                                    <button key={v} onClick={() => toggle(key, v)} style={{
                                        textAlign: "left", background: filters[key].includes(v) ? accent : "#1a2030",
                                        border: `1px solid ${filters[key].includes(v) ? accent : "#2a3348"}`,
                                        borderRadius: "4px", padding: "4px 8px", fontSize: "11px",
                                        color: filters[key].includes(v) ? "#fff" : "#94a3b8", cursor: "pointer",
                                        transition: "all 0.1s", fontFamily: "system-ui"
                                    }} className="hover:opacity-80">
                                        {icons ? `${icons[v]} ` : ""}{v}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}

                    {activeCount > 0 && (
                        <button onClick={clearAll} style={{ width: "100%", background: "transparent", border: "1px dashed #374151", borderRadius: "4px", padding: "6px", fontSize: "11px", color: "#94a3b8", cursor: "pointer", fontFamily: "system-ui" }} className="hover:text-white hover:border-gray-400 transition-colors">
                            Clear active filters ({activeCount})
                        </button>
                    )}
                </div>

                {/* Table Area */}
                <div style={{ flex: 1, overflow: "auto" }} className="flex flex-col relative">
                    <div style={{ gap: "8px", padding: "12px 16px", borderBottom: "1px solid #1e2533", alignItems: "center", flexWrap: "wrap", background: "#0d1018" }} className="flex sticky top-0 z-20">
                        <span style={{ fontSize: "10px", color: "#64748b", fontFamily: "system-ui", letterSpacing: "1px", fontWeight: "700" }}>SORT BY:</span>
                        {[["name", "Name"], ["msrp", "MSRP ↑"], ["positioning", "Positioning"]].map(([val, label]) => (
                            <button key={val} onClick={() => setSortBy(val)} style={{
                                background: sortBy === val ? "#1e3a5f" : "transparent",
                                border: `1px solid ${sortBy === val ? "#3b82f6" : "#2a3348"}`,
                                borderRadius: "4px", padding: "4px 10px", fontSize: "11px",
                                color: sortBy === val ? "#e0f2fe" : "#94a3b8", cursor: "pointer", fontFamily: "system-ui"
                            }} className="hover:border-[#3b82f6] transition-colors">{label}</button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-auto">
                        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: "13px" }}>
                            <thead className="sticky top-0 z-10">
                                <tr style={{ background: "#0d1018" }}>
                                    {[
                                        { label: "Vehicle" },
                                        { label: "Segment" },
                                        { label: "Use Case" },
                                        { label: "Starting MSRP" },
                                        { label: "Brand Positioning" },
                                        { label: "Powertrain" },
                                        { label: "Origin" },
                                        { label: "" }
                                    ].map(h => (
                                        <th key={h.label} style={{ padding: "10px 14px", textAlign: "left", fontFamily: "system-ui", whiteSpace: "nowrap", borderBottom: "2px solid #1e2533" }}>
                                            <div style={{ fontSize: "10px", letterSpacing: "1px", color: "#64748b", fontWeight: "800" }}>{h.label.toUpperCase()}</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((v, i) => (
                                    <tr key={v.id}
                                        style={{ background: i % 2 === 0 ? "#0f1117" : "#0d1018" }}
                                        className="hover:bg-[#1a2234] transition-colors group cursor-pointer"
                                        onClick={() => navigate(`/admin/vehicles/${v.id}`)}
                                    >
                                        <td style={{ padding: "6px 14px", fontWeight: "600", color: "#f8fafc", whiteSpace: "nowrap", borderBottom: "1px solid #141a26" }}>{v.make} {v.model}</td>
                                        <td style={{ padding: "6px 14px", borderBottom: "1px solid #141a26" }}><Tag label={v.segment} colors={sizeColors[v.segment]} /></td>
                                        <td style={{ padding: "6px 14px", fontSize: "12px", fontFamily: "system-ui", color: "#94a3b8", whiteSpace: "nowrap", borderBottom: "1px solid #141a26" }}>
                                            {v.use_case ? <>{useCaseIcons[v.use_case]} {v.use_case}</> : <span className="text-[#FAF8F5]/70">—</span>}
                                        </td>
                                        <td style={{ padding: "6px 14px", borderBottom: "1px solid #141a26" }}><Tag label={v.msrp_tier} colors={msrpColors[v.msrp_tier]} /></td>
                                        <td style={{ padding: "6px 14px", borderBottom: "1px solid #141a26" }}><Tag label={v.positioning} colors={posColors[v.positioning]} /></td>
                                        <td style={{ padding: "6px 14px", fontSize: "12px", fontFamily: "system-ui", color: ptColors[v.powertrain_summary] || "#94a3b8", whiteSpace: "nowrap", borderBottom: "1px solid #141a26" }}>
                                            {v.powertrain_summary || <span className="text-[#FAF8F5]/70">—</span>}
                                        </td>
                                        <td style={{ padding: "6px 14px", fontSize: "12px", fontFamily: "system-ui", color: "#94a3b8", borderBottom: "1px solid #141a26" }}>{v.origin || <span className="text-[#FAF8F5]/70">—</span>}</td>
                                        <td style={{ padding: "6px 14px", textAlign: "right", borderBottom: "1px solid #141a26" }}>
                                            <Link to={`/admin/vehicles/${v.id}`} className="inline-flex items-center justify-center p-1.5 rounded bg-[#14141B]/5 hover:bg-[#C9A84C] text-white transition-colors opacity-0 group-hover:opacity-100" title="Manage Vehicle">
                                                <ArrowRight size={14} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr><td colSpan="8" style={{ padding: "48px", textAlign: "center", color: "#475569", fontFamily: "system-ui" }}>No vehicles match your current filters.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
