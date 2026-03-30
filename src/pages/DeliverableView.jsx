import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, Printer, X } from 'lucide-react';

const DeliverableView = () => {
    const { id } = useParams();
    const [deliverable, setDeliverable] = useState(null);
    const [lightboxImage, setLightboxImage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDoc = async () => {
            const { data, error } = await supabase
                .from('deliverable_versions')
                .select('*')
                .eq('id', id)
                .single();

            if (data && data.snapshot) {
                setDeliverable(data.snapshot);
            } else {
                console.error(error);
            }
            setLoading(false);
        };
        fetchDoc();
    }, [id]);

    if (loading) return <div className="min-h-screen bg-[#0D0D12] text-[#C9A84C] flex items-center justify-center"><Loader2 className="animate-spin" size={40} /></div>;

    if (!deliverable) return <div className="min-h-screen bg-[#0D0D12] text-white flex items-center justify-center">Document not found or not published.</div>;

    const { client, recommendations, benchmarks, excluded } = deliverable;
    const allVehicles = [...recommendations, ...benchmarks, ...excluded];

    // Helper for rendering fit dots
    const renderFitDot = (fitString) => {
        if (fitString === 'Strong') return <span className="inline-block w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" title="Strong"></span>;
        if (fitString === 'Good') return <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]" title="Acceptable Tradeoff"></span>;
        return <span className="inline-block w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]" title="Moderate Risk"></span>;
    };

    return (
        <div className="bg-[#0D0D12] text-[#FAF8F5] font-sans antialiased min-h-screen">

            {/* Context/Background Filter overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-50 print:hidden" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

            {/* Lightbox Modal */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out print:hidden"
                    onClick={() => setLightboxImage(null)}
                >
                    <button
                        className="absolute top-6 right-6 p-2 text-white/50 hover:text-white bg-black/50 rounded-full transition-colors"
                        onClick={(e) => { e.stopPropagation(); setLightboxImage(null); }}
                    >
                        <X size={24} />
                    </button>
                    <img
                        src={lightboxImage}
                        alt="Enlarged view"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* Sticky Action Bar */}
            <div className="fixed top-8 right-8 z-40 print:hidden">
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-[#C9A84C] text-[#0D0D12] px-4 md:px-6 py-3 rounded-full hover:bg-[#D4B86A] transition-all shadow-lg hover:shadow-[#C9A84C]/20 hover:-translate-y-0.5 group"
                >
                    <Printer size={18} />
                    <span className="font-semibold text-sm hidden md:inline">Print / Save PDF</span>
                </button>
            </div>

            {/* 1. Cover */}
            <section className="min-h-screen flex flex-col items-center justify-center p-12 text-center relative">
                <div className="absolute top-12 left-1/2 -translate-x-1/2 border-b border-[#C9A84C] pb-2">
                    <span className="font-playfair italic text-[#C9A84C] text-xl tracking-wider">Autolitics Studio</span>
                </div>

                <div className="max-w-2xl mt-20">
                    <h2 className="font-inter text-[#C9A84C] tracking-[0.2em] uppercase text-sm mb-6">Confidential Advisory</h2>
                    <h1 className="font-playfair text-6xl md:text-7xl lg:text-8xl mb-6 leading-tight">Vehicle Strategy <br /><span className="italic text-[#C9A84C]">Brief</span></h1>
                    <p className="font-inter text-xl text-[#FAF8F5]/70 mb-16 tracking-wide">Shortlist & Recommendation</p>

                    <div className="border-t border-[#2A2A35] pt-12 flex flex-col items-center gap-2">
                        <span className="font-mono text-sm uppercase tracking-widest text-[#FAF8F5]/50">Prepared For</span>
                        <span className="font-inter text-2xl font-semibold tracking-wide">{client.names}</span>
                        <span className="font-mono text-xs text-[#FAF8F5]/40 mt-4">{new Date(deliverable.generatedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>
                </div>

                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[#FAF8F5]/30 font-mono text-[10px] tracking-widest uppercase">
                    Autolitics Studio — Internal Decision Intelligence V1
                </div>
            </section>

            <div className="page-break"></div>

            {/* 2. Strategic Overview */}
            <section className="min-h-screen p-12 md:p-24 max-w-5xl mx-auto flex flex-col">
                <header className="border-b border-[#2A2A35] pb-8 mb-12">
                    <h2 className="font-playfair italic text-4xl text-[#C9A84C]">Strategic Overview</h2>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 flex-1">
                    <div className="col-span-1 border-r border-[#2A2A35] pr-12">
                        <h3 className="font-inter tracking-widest text-xs uppercase text-[#FAF8F5]/50 mb-6">Decision Context</h3>
                        <div className="font-inter text-[#FAF8F5]/80 text-sm leading-relaxed space-y-4">
                            {client.current_vehicles && (
                                <p><strong>Current:</strong> {client.current_vehicles}</p>
                            )}
                            <p><strong>Primary Focus:</strong> Space ({client.priorities?.space}/5), Reliability ({client.priorities?.durability}/5), Efficiency ({client.priorities?.efficiency}/5)</p>
                            <p><strong>Budget:</strong> {client.budget}</p>
                            {client.notes && <p className="italic text-[#C9A84C] mt-6 leading-relaxed">"{client.notes}"</p>}
                        </div>
                    </div>

                    <div className="col-span-2 space-y-12">
                        <div>
                            <h3 className="font-inter tracking-widest text-xs uppercase text-[#FAF8F5]/50 mb-8">Ranked Recommendations</h3>
                            <div className="space-y-6">
                                {recommendations.map((rec, i) => (
                                    <div key={i} className="flex gap-6 items-start">
                                        <span className="font-playfair italic text-[#C9A84C] text-2xl mt-[-4px]">{i + 1}.</span>
                                        <div>
                                            <h4 className="font-inter font-semibold text-xl tracking-wide">
                                                {rec.vehicle_specs?.vehicles?.make || rec._config?.make} {rec.vehicle_specs?.vehicles?.model || rec._config?.model}
                                                <span className="ml-3 text-xs font-mono bg-[#1A1A24] px-2 py-1 rounded text-[#C9A84C] border border-[#C9A84C]/20">{rec.best_for_tag}</span>
                                            </h4>
                                            <p className="font-inter text-sm text-[#FAF8F5]/60 mt-2 leading-relaxed">
                                                {rec.rationale_fit_bullets?.[0] || 'Strong alignment across core priorities.'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {benchmarks.length > 0 && (
                            <div className="pt-12 border-t border-[#2A2A35]">
                                <h3 className="font-inter tracking-widest text-xs uppercase text-[#FAF8F5]/50 mb-6">Additional Alternatives</h3>
                                <ul className="list-disc list-inside font-inter text-[#FAF8F5]/70 space-y-2 text-sm">
                                    {benchmarks.map((b, i) => (
                                        <li key={i}>{b.vehicle_specs?.vehicles?.make || b._config?.make} {b.vehicle_specs?.vehicles?.model || b._config?.model} — {b.best_for_tag || 'Alternative Option'}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {deliverable.strategic_rationale && (
                            <div className="bg-[#1A1A24] p-8 rounded-2xl border border-[#2A2A35] mt-12">
                                <h3 className="font-inter tracking-widest text-xs uppercase text-[#FAF8F5]/50 mb-4">Strategist's Advisory Perspective</h3>
                                <p className="font-playfair italic text-xl leading-relaxed text-[#FAF8F5]">
                                    {deliverable.strategic_rationale}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <div className="page-break"></div>

            {/* 3. At-a-Glance Comparison */}
            <section className="min-h-screen p-12 md:p-24 max-w-6xl mx-auto flex flex-col">
                <header className="border-b border-[#2A2A35] pb-8 mb-16 text-center">
                    <h2 className="font-playfair italic text-4xl text-[#C9A84C] mb-4">At-a-Glance Comparison</h2>
                    <p className="font-inter text-[#FAF8F5]/50 text-sm tracking-wide">Internal Fit Matrix based on client priorities</p>
                </header>

                <div className="bg-[#14141B] rounded-[2rem] border border-[#2A2A35] overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left border-collapse min-w-[700px] md:min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-[#2A2A35]">
                                    <th className="p-3 md:p-4 font-inter text-[10px] md:text-xs tracking-widest uppercase text-[#FAF8F5]/40 w-1/4">Capability Area</th>
                                    {allVehicles.map((v, i) => (
                                        <th key={i} className="p-3 md:p-4 font-inter font-semibold text-xs md:text-sm text-center border-l border-[#2A2A35]/50 leading-tight">
                                            <div className="text-[#C9A84C] mb-1">{v.vehicle_specs?.vehicles?.make || v._config?.make}</div>
                                            <div>{v.vehicle_specs?.vehicles?.model || v._config?.model}</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2A2A35]/50 font-inter text-sm">
                                {[
                                    ['Space & Practicality', 'space'],
                                    ['Efficiency', 'efficiency'],
                                    ['Durability Confidence', 'durability'],
                                    ['Ownership Risk', 'risk'],
                                    ['Budget Alignment', 'budget'],
                                    ['Interior Feel', 'interior']
                                ].map(([label, key]) => (
                                    <tr key={key} className="hover:bg-[#1A1A24]/50 transition-colors">
                                        <td className="p-3 md:p-4 font-medium text-[#FAF8F5]/80 min-w-[140px] text-xs md:text-sm">{label}</td>
                                        {allVehicles.map((v, i) => (
                                            <td key={i} className="p-3 md:p-4 text-center border-l border-[#2A2A35]/50">
                                                <div className="flex flex-col items-center gap-1 md:gap-2">
                                                    {renderFitDot(v.fit[key])}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                {/* Key Specifications Data */}
                                <tr className="bg-[#1A1A24]/50">
                                    <td colSpan={allVehicles.length + 1} className="p-4 font-mono text-xs text-[#C9A84C] tracking-widest uppercase border-y border-[#2A2A35]/50 border-t-2">Key Specifications</td>
                                </tr>
                                {(() => {
                                    const specRows = [
                                        {
                                            label: 'Est. Price Range (Base)',
                                            getValue: (v) => {
                                                const marketStr = v._config?.market_price_low && v._config?.market_price_high
                                                    ? "$" + v._config.market_price_low.toLocaleString() + " - $" + v._config.market_price_high.toLocaleString()
                                                    : null;
                                                const msrpStr = v._config?.base_msrp
                                                    ? "MSRP From $" + v._config.base_msrp.toLocaleString()
                                                    : v._config?.msrp_tier;
                                                return marketStr || msrpStr || '—';
                                            },
                                            getRaw: (v) => v._config?.base_msrp || v._config?.market_price_low || null,
                                            type: 'lowest_best'
                                        },
                                        {
                                            label: 'Powertrain Availability',
                                            getValue: (v) => {
                                                const pts = v.powertrains || v.vehicle_specs?.powertrains;
                                                if (pts && pts.length > 0) {
                                                    const types = Array.from(new Set(pts.map(p => {
                                                        if (p.name.includes('Hybrid MAX') || p.engine_description?.includes('MAX')) return 'Hybrid MAX';
                                                        if (p.engine_description?.includes('Hybrid')) return 'Hybrid';
                                                        if (p.engine_description?.includes('Electric')) return 'EV';
                                                        if (p.engine_description?.includes('PHEV') || p.name.includes('PHEV') || p.type?.includes('PHEV')) return 'PHEV';
                                                        return 'Gas';
                                                    }))).filter(Boolean);
                                                    return types.join(', ');
                                                }
                                                return v._config?.powertrain_summary || '—';
                                            },
                                            getRaw: () => null,
                                            type: 'neutral'
                                        },
                                        {
                                            label: 'Combined MPG (Base Engine)',
                                            getValue: (v) => {
                                                const pts = v.powertrains?.[0] || v.vehicle_specs?.powertrains?.[0];
                                                if (!pts) return '—';
                                                return pts.combined_mpg ? pts.combined_mpg + ' MPG' : '—';
                                            },
                                            getRaw: (v) => (v.powertrains?.[0] || v.vehicle_specs?.powertrains?.[0])?.combined_mpg || null,
                                            type: 'highest_best'
                                        },
                                        {
                                            label: 'Overall Length',
                                            getValue: (v) => v.vehicle_specs?.length_in || v._config?.length_in ? (v.vehicle_specs?.length_in || v._config?.length_in) + '"' : '—',
                                            getRaw: (v) => v.vehicle_specs?.length_in || v._config?.length_in || null,
                                            type: 'neutral_compare'
                                        },
                                        {
                                            label: '2nd Row Legroom',
                                            getValue: (v) => v.vehicle_specs?.legroom_2nd_in || v._config?.legroom_2nd_row_in ? (v.vehicle_specs?.legroom_2nd_in || v._config?.legroom_2nd_row_in) + '"' : '—',
                                            getRaw: (v) => v.vehicle_specs?.legroom_2nd_in || v._config?.legroom_2nd_row_in || null,
                                            type: 'highest_best'
                                        },
                                        {
                                            label: 'Max Cargo Space',
                                            getValue: (v) => {
                                                const max = v.vehicle_specs?.cargo_max_cuft || v._config?.max_cargo_cu_ft || null;
                                                return max ? max + ' cu ft' : '—';
                                            },
                                            getRaw: (v) => v.vehicle_specs?.cargo_max_cuft || v._config?.max_cargo_cu_ft || null,
                                            type: 'highest_best'
                                        }
                                    ];

                                    return specRows.map((row) => {
                                        const rawVals = allVehicles.map(v => row.getRaw(v)).filter(v => v !== null);
                                        const maxVal = rawVals.length > 0 ? Math.max(...rawVals) : null;
                                        const minVal = rawVals.length > 0 ? Math.min(...rawVals) : null;

                                        return (
                                            <tr key={row.label} className="hover:bg-[#1A1A24]/50 transition-colors">
                                                <td className="p-2 md:p-3 font-medium text-[#FAF8F5]/80 min-w-[140px] text-[10px] md:text-sm">{row.label}</td>
                                                {allVehicles.map((v, i) => {
                                                    const raw = row.getRaw(v);
                                                    const formatted = row.getValue(v);
                                                    let colorClass = "text-[#C9A84C]"; // default

                                                    if (raw !== null && maxVal !== null && minVal !== null && maxVal !== minVal) {
                                                        if (row.type === 'highest_best') {
                                                            if (raw === maxVal) colorClass = "text-green-400 font-bold";
                                                            if (raw === minVal) colorClass = "text-orange-400 opacity-80";
                                                        } else if (row.type === 'lowest_best') {
                                                            if (raw === minVal) colorClass = "text-green-400 font-bold";
                                                            if (raw === maxVal) colorClass = "text-orange-400 opacity-80";
                                                        } else if (row.type === 'neutral_compare') {
                                                            if (raw === maxVal) colorClass = "text-[#8888AA]"; // largest
                                                            if (raw === minVal) colorClass = "text-[#8888AA]"; // smallest
                                                        }
                                                    }

                                                    return (
                                                        <td key={i} className={"p-2 md:p-3 text-center border-l border-[#2A2A35]/50 font-mono text-[10px] md:text-xs max-w-[200px] break-words " + colorClass}>
                                                            {formatted}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    });
                                })()}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-6 flex justify-between items-start">
                    <div className="flex justify-start gap-8 font-inter text-xs text-[#FAF8F5]/50 tracking-wider">
                        <div className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-green-500"></span> Strong Alignment</div>
                        <div className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Acceptable Tradeoff</div>
                        <div className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Moderate Risk</div>
                    </div>

                    <div className="font-inter text-xs text-[#FAF8F5]/40 max-w-sm text-right leading-relaxed border-l border-[#2A2A35] pl-6">
                        <strong>* Durability Confidence:</strong> Based on historical platform data, expected maintenance costs over 5 years, and brand track record.
                    </div>
                </div>
            </section>

            {/* 4. Vehicle Deep Dive Pages */}
            {
                allVehicles.map((v, idx) => (
                    <div key={idx}>
                        <div className="page-break"></div>
                        <section className="min-h-screen p-8 md:p-12 max-w-6xl mx-auto flex flex-col no-break">
                            <header className="mb-8 border-b border-[#2A2A35] pb-4 flex justify-between items-end">
                                <div>
                                    <h4 className="font-mono text-[#C9A84C] text-[10px] tracking-widest mb-2">0{idx + 1} // {v.status.toUpperCase()}</h4>
                                    <h2 className="font-playfair text-3xl md:text-4xl mb-1">{v.vehicle_specs?.vehicles?.make || v._config?.make} {v.vehicle_specs?.vehicles?.model || v._config?.model}</h2>
                                    <h3 className="font-inter text-xl text-[#FAF8F5]/50 tracking-wide mt-1">
                                        {v.vehicle_specs?.model_year || v._config?.model_year} • {v.vehicle_specs?.trim || v._config?.config_label}
                                        <span className="mx-4 text-[#FAF8F5]/20">|</span>
                                        <span className="text-[#C9A84C]/80">
                                            {v._config?.market_price_low && v._config?.market_price_high
                                                ? "$" + v._config.market_price_low.toLocaleString() + " - $" + v._config.market_price_high.toLocaleString() + " (" + (v._config.market_type || 'Used') + ")"
                                                : v._config?.base_msrp ? "MSRP From $" + v._config.base_msrp.toLocaleString() : (v._config?.msrp_tier || 'MSRP TBD')}
                                        </span>
                                    </h3>
                                </div>
                            </header>

                            {/* Vehicle Imagery */}
                            <div className="flex flex-col gap-3 mb-8">
                                <div className="grid grid-cols-2 gap-3">
                                    <div
                                        className="w-full h-48 md:h-64 bg-[#14141B] rounded-[1.5rem] border border-[#2A2A35] overflow-hidden relative group cursor-zoom-in"
                                        onClick={() => {
                                            const img = v.vehicle_specs?.default_images?.[0] || v.vehicle_specs?.vehicles?.default_images?.[0] || v._config?.default_image_url;
                                            if (img) setLightboxImage(img);
                                        }}
                                    >
                                        {(v.vehicle_specs?.default_images?.[0] || v.vehicle_specs?.vehicles?.default_images?.[0] || v._config?.default_image_url) ? (
                                            <img src={v.vehicle_specs?.default_images?.[0] || v.vehicle_specs?.vehicles?.default_images?.[0] || v._config?.default_image_url} alt="Exterior" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center font-mono text-[#FAF8F5]/20 tracking-widest text-sm">
                                                [ EXTERIOR IMAGERY UNAVAILABLE ]
                                            </div>
                                        )}
                                        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0D0D12] to-transparent pointer-events-none"></div>
                                        <div className="absolute bottom-3 left-4 font-mono text-[10px] tracking-widest text-[#C9A84C] uppercase drop-shadow-md pointer-events-none">Exterior</div>
                                    </div>

                                    <div
                                        className="w-full h-48 md:h-64 bg-[#14141B] rounded-[1.5rem] border border-[#2A2A35] overflow-hidden relative group cursor-zoom-in"
                                        onClick={() => {
                                            const img = v._config?.interior_image_url;
                                            if (img) setLightboxImage(img);
                                        }}
                                    >
                                        {v._config?.interior_image_url ? (
                                            <img src={v._config?.interior_image_url} alt="Interior" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center font-mono text-[#FAF8F5]/20 tracking-widest text-sm text-center px-4">
                                                [ INTERIOR IMAGERY UNAVAILABLE ]
                                            </div>
                                        )}
                                        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0D0D12] to-transparent pointer-events-none"></div>
                                        <div className="absolute bottom-3 left-4 font-mono text-[10px] tracking-widest text-[#C9A84C] uppercase drop-shadow-md pointer-events-none">Interior</div>
                                    </div>
                                </div>

                                {/* 5-Image Gallery Filmstrip */}
                                {(() => {
                                    const allImages = v.vehicle_specs?.default_images || v.vehicle_specs?.vehicles?.default_images || [];
                                    const extraImages = allImages.slice(1, 5).filter(Boolean); // Up to 4 extra images
                                    
                                    if (extraImages.length > 0) {
                                        return (
                                            <div className={`grid gap-3 ${extraImages.length === 4 ? 'grid-cols-4' : extraImages.length === 3 ? 'grid-cols-3' : extraImages.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                                {extraImages.map((img, i) => (
                                                    <div 
                                                        key={i}
                                                        className="w-full h-16 md:h-24 bg-[#14141B] rounded-xl border border-[#2A2A35] overflow-hidden relative group cursor-zoom-in"
                                                        onClick={() => setLightboxImage(img)}
                                                    >
                                                        <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#0D0D12] to-transparent pointer-events-none opacity-50"></div>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>

                            {/* Overall Profile Note */}
                            { (v.vehicle_specs?.eval_overall_notes || v._config?.eval_overall_notes) && (
                                <div className="mb-8 border-l-2 border-[#C9A84C] pl-6 py-2 pb-6 border-b border-[#2A2A35]">
                                    <h3 className="font-inter tracking-widest text-[10px] uppercase text-[#FAF8F5]/50 mb-3">Analyst Profile Note</h3>
                                    <p className="font-playfair italic text-xl md:text-2xl text-[#FAF8F5]/90 leading-relaxed">
                                        "{v.vehicle_specs?.eval_overall_notes || v._config?.eval_overall_notes}"
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 flex-1">
                                <div className="lg:col-span-3 space-y-8 pr-4">
                                    <div>
                                        <h3 className="font-inter tracking-widest text-[10px] uppercase text-[#C9A84C] mb-4">Why It Fits You</h3>
                                        <ul className="space-y-3 font-inter text-[#FAF8F5]/90 text-sm leading-relaxed">
                                            {(v.rationale_fit_bullets || v.why_it_fits_bullets)?.length > 0 ? (v.rationale_fit_bullets || v.why_it_fits_bullets).map((b, i) => (
                                                <li key={i} className="flex gap-4"><span className="text-[#C9A84C] mt-1">✦</span><span>{b}</span></li>
                                            )) : <li className="text-[#FAF8F5]/40 italic">Analysis pending.</li>}
                                        </ul>
                                    </div>
                                    <div className="border-t border-[#2A2A35] pt-6">
                                        <h3 className="font-inter tracking-widest text-[10px] uppercase text-[#FAF8F5]/40 mb-4">What To Consider</h3>
                                        <ul className="space-y-3 font-inter text-[#FAF8F5]/70 text-sm leading-relaxed">
                                            {(v.rationale_tradeoffs_bullets || v.tradeoffs_bullets)?.length > 0 ? (v.rationale_tradeoffs_bullets || v.tradeoffs_bullets).map((b, i) => (
                                                <li key={i} className="flex gap-4"><span className="text-[#FAF8F5]/30 mt-1">✦</span><span>{b}</span></li>
                                            )) : <li className="text-[#FAF8F5]/40 italic">None noted.</li>}
                                        </ul>
                                    </div>
                                </div>

                                <div className="lg:col-span-2">
                                    <div className="bg-[#14141B] rounded-[1.5rem] border border-[#2A2A35] p-6">
                                        <h3 className="font-inter tracking-widest text-[10px] uppercase text-[#FAF8F5]/50 mb-6 text-center border-b border-[#2A2A35]/50 pb-3">Key Specifications</h3>

                                        <div className="space-y-4 font-mono text-xs">
                                            <div className="flex justify-between border-b border-[#2A2A35]/40 pb-3">
                                                <span className="text-[#FAF8F5]/40">Length</span>
                                                <span className="text-[#C9A84C]">{v.vehicle_specs?.length_in || v._config?.length_in || '—'}"</span>
                                            </div>
                                            <div className="flex justify-between border-b border-[#2A2A35]/40 pb-3">
                                                <span className="text-[#FAF8F5]/40">3rd Row Legroom</span>
                                                <span className="text-[#C9A84C]">{v.vehicle_specs?.legroom_3rd_in || v._config?.legroom_3rd_row_in || '—'}"</span>
                                            </div>
                                            <div className="flex justify-between border-b border-[#2A2A35]/40 pb-3">
                                                <span className="text-[#FAF8F5]/40">Cargo Behind 3rd</span>
                                                <span className="text-[#C9A84C]">{v.vehicle_specs?.cargo_behind_3rd_cuft || v._config?.cargo_behind_3rd_cu_ft || '—'} cuft</span>
                                            </div>
                                            <div className="flex justify-between border-b border-[#2A2A35]/40 pb-3">
                                                <span className="text-[#FAF8F5]/40">Max Cargo</span>
                                                <span className="text-[#C9A84C]">{v.vehicle_specs?.cargo_max_cuft || v._config?.max_cargo_cu_ft || '—'} cuft</span>
                                            </div>
                                            <div className="flex justify-between pt-2">
                                                <span className="text-[#FAF8F5]/40">Reliability Profile</span>
                                                <span className="text-[#C9A84C]">{v.vehicle_specs?.reliability_score || v._config?.summary_label || v._config?.edmunds_rating || '—'}</span>
                                            </div>
                                        </div>

                                        {v.powertrains && v.powertrains.length > 0 && (
                                            <div className="mt-8 pt-8 border-t border-[#2A2A35]/50">
                                                <h3 className="font-inter tracking-widest text-xs uppercase text-[#FAF8F5]/50 mb-6 text-center leading-relaxed">Available Powertrains</h3>
                                                <div className="space-y-4">
                                                    {v.powertrains.map((pt, i) => (
                                                        <div key={i} className="bg-[#1D1D26] p-4 rounded-xl border border-[#2A2A35]/50 text-sm font-inter">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <span className="text-[#C9A84C] font-semibold">{pt.name}</span>
                                                                {pt.transmission && <span className="text-[#FAF8F5]/60 text-xs">{pt.transmission}</span>}
                                                            </div>
                                                            <div className="text-[#FAF8F5]/80 text-xs leading-relaxed">
                                                                <div>{pt.engine_description}</div>
                                                                <div className="mt-2 flex gap-4 text-[#FAF8F5]/50">
                                                                    {pt.horsepower_hp && <span>{pt.horsepower_hp} HP</span>}
                                                                    {pt.combined_mpg && <span>{pt.combined_mpg} MPG Comb</span>}
                                                                    {pt.ev_range_miles && <span>{pt.ev_range_miles} mi EV</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                ))
            }

            {/* 5. Reference Data: Evaluation Analytics */}
            <div className="page-break"></div>
            <section className="min-h-screen p-12 md:p-24 max-w-6xl mx-auto flex flex-col">
                <header className="border-b border-[#2A2A35] pb-8 mb-16 text-center">
                    <h2 className="font-playfair italic text-4xl text-[#C9A84C] mb-4">Evaluation Analytics</h2>
                    <p className="font-inter text-[#FAF8F5]/50 text-sm tracking-wide">Standardized Dimensional Scoring (1-5)</p>
                </header>

                <div className="bg-[#14141B] rounded-[2rem] border border-[#2A2A35] overflow-hidden shadow-2xl pb-4">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left border-collapse min-w-[700px] md:min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-[#2A2A35]">
                                    <th className="p-3 md:p-4 font-inter text-[10px] md:text-xs tracking-widest uppercase text-[#FAF8F5]/40 w-1/4">Evaluation Dimension</th>
                                    {allVehicles.map((v, i) => (
                                        <th key={i} className="p-3 md:p-4 font-inter font-semibold text-xs md:text-sm text-center border-l border-[#2A2A35]/50 leading-tight">
                                            <div className="text-[#C9A84C] mb-1">{v.vehicle_specs?.vehicles?.make || v._config?.make}</div>
                                            <div>{v.vehicle_specs?.vehicles?.model || v._config?.model}</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2A2A35]/50 font-inter text-sm">
                                {[
                                    ['Space & Packaging', 'eval_space_score'],
                                    ['Usability & Ergonomics', 'eval_usability_score'],
                                    ['Efficiency & Upkeep', 'eval_efficiency_score'],
                                    ['Durability Confidence', 'eval_durability_score'],
                                    ['Ride Comfort & NVH', 'eval_comfort_score'],
                                    ['Software & Technology', 'eval_software_technology_score'],
                                    ['Value Index', 'eval_value_score'],
                                    ['Autolitics Design Index', 'eval_adi_score'],
                                ].map(([label, key]) => (
                                    <tr key={key} className="hover:bg-[#1A1A24]/50 transition-colors">
                                        <td className="p-3 md:p-4 font-medium text-[#FAF8F5]/80 min-w-[140px] text-xs md:text-sm">{label}</td>
                                        {allVehicles.map((v, i) => {
                                            const score = v.vehicle_specs?.[key] || v._config?.[key];
                                            let colorClass = "text-[#FAF8F5]/40"; // No data
                                            if (score >= 4) colorClass = "text-green-400 font-bold";
                                            else if (score === 3) colorClass = "text-yellow-400";
                                            else if (score && score < 3) colorClass = "text-orange-400 opacity-80";

                                            return (
                                                <td key={i} className={`p-3 md:p-4 text-center border-l border-[#2A2A35]/50 font-mono text-base ${colorClass}`}>
                                                    {score ? `${score}.0` : '—'}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <div className="page-break"></div>

            {/* 6. CPO Strategy & 7. Next Steps */}
            <section className="min-h-screen p-12 md:p-24 max-w-5xl mx-auto flex flex-col justify-between">
                <div>
                    <header className="border-b border-[#2A2A35] pb-8 mb-12">
                        <h2 className="font-playfair italic text-4xl text-[#C9A84C]">Certified Pre-Owned Strategy</h2>
                    </header>
                    <div className="grid grid-cols-2 gap-12 font-inter text-sm text-[#FAF8F5]/80 leading-relaxed">
                        <div className="bg-[#14141B] p-8 rounded-[2rem] border border-[#2A2A35]">
                            <h4 className="text-[#C9A84C] font-semibold mb-4 tracking-wide">When CPO is Valuable</h4>
                            <ul className="space-y-3">
                                <li>• Complex European platforms minimizing out-of-warranty risk.</li>
                                <li>• High trim levels with dense electronic/infotainment systems.</li>
                                <li>• Brand structures offering unlimited mileage CPO warranties.</li>
                            </ul>
                        </div>
                        <div className="bg-[#14141B] p-8 rounded-[2rem] border border-[#2A2A35]">
                            <h4 className="text-[#FAF8F5]/60 font-semibold mb-4 tracking-wide">When CPO is Less Critical</h4>
                            <ul className="space-y-3">
                                <li>• Proven Toyota/Lexus naturally aspirated or hybrid platforms with full service history.</li>
                                <li>• Instances where the CPO premium exceeds the likely repair cost over ownership horizon.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="page-break"></div>

                {/* Optional Process Slide (Always shown for full advisory) */}
                <div className="mt-24 w-full">
                    <header className="border-b border-[#2A2A35] pb-8 mb-12">
                        <h2 className="font-playfair italic text-4xl text-[#C9A84C]">How the Advisory Process Works</h2>
                    </header>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 font-inter">
                        <div className="bg-[#14141B] p-8 rounded-[2rem] border border-[#2A2A35]">
                            <h3 className="text-[#C9A84C] font-mono text-sm tracking-widest uppercase mb-4">Phase 1</h3>
                            <h4 className="font-semibold text-lg text-[#FAF8F5] mb-4">Strategy & Alignment (We Are Here)</h4>
                            <p className="text-[#FAF8F5]/70 text-sm leading-relaxed mb-4">
                                Analyzing your priorities against market data to build a resilient, unbiased vehicle shortlist.
                            </p>
                            <ul className="text-[#FAF8F5]/50 text-xs space-y-2">
                                <li>• Intake & Requirements Profiling</li>
                                <li>• Platform Reliability Analysis</li>
                                <li>• Vehicle Shortlist Presentation</li>
                            </ul>
                        </div>
                        <div className="bg-[#14141B] p-8 rounded-[2rem] border border-[#2A2A35]">
                            <h3 className="text-[#C9A84C] font-mono text-sm tracking-widest uppercase mb-4">Phase 2</h3>
                            <h4 className="font-semibold text-lg text-[#FAF8F5] mb-4">Evaluation & Selection</h4>
                            <p className="text-[#FAF8F5]/70 text-sm leading-relaxed mb-4">
                                Testing the theory in the real world. You evaluate the vehicles experientially; I provide ongoing analysis.
                            </p>
                            <ul className="text-[#FAF8F5]/50 text-xs space-y-2">
                                <li>• Targeted Test Drives</li>
                                <li>• Logistics & Fitment Checks</li>
                                <li>• "Work With Ricki" Client Hub Syncs</li>
                            </ul>
                        </div>
                        <div className="bg-[#14141B] p-8 rounded-[2rem] border border-[#2A2A35]">
                            <h3 className="text-[#C9A84C] font-mono text-sm tracking-widest uppercase mb-4">Phase 3</h3>
                            <h4 className="font-semibold text-lg text-[#FAF8F5] mb-4">Acquisition Strategy</h4>
                            <p className="text-[#FAF8F5]/70 text-sm leading-relaxed mb-4">
                                Protecting your capital. Filtering out bad deals and providing negotiation leverage.
                            </p>
                            <ul className="text-[#FAF8F5]/50 text-xs space-y-2">
                                <li>• Listing Review & Vetting</li>
                                <li>• Dealer Quote Breakdown</li>
                                <li>• F&I / Warranty Strategy</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="page-break"></div>

                <div className="mt-24 w-full">
                    <header className="border-b border-[#2A2A35] pb-8 mb-12">
                        <h2 className="font-playfair italic text-4xl text-[#C9A84C]">Ongoing Support</h2>
                    </header>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 font-inter">
                        <div className="space-y-6 text-[#FAF8F5]/80 text-sm leading-relaxed">
                            <p>This document serves as our strategic baseline, but my role as your advisor continues through the point of purchase.</p>
                            
                            <h4 className="text-[#C9A84C] font-semibold tracking-wide pt-4">Client Dashboard ("Work With Ricki")</h4>
                            <p>By logging into your Autolitics Studio dashboard, you have direct access to our interactive tools:</p>
                            <ul className="space-y-3 font-medium">
                                <li className="flex gap-4"><span className="text-[#C9A84C] mt-1">✦</span><span><strong>Test Drive Log:</strong> Submit your impressions immediately after driving a candidate so we can refine the search.</span></li>
                                <li className="flex gap-4"><span className="text-[#C9A84C] mt-1">✦</span><span><strong>Listing Veto:</strong> Found a car online? Send me the link before you call the dealer. I will review the Carfax, build sheet, and pricing context.</span></li>
                                <li className="flex gap-4"><span className="text-[#C9A84C] mt-1">✦</span><span><strong>Quote Breakdown:</strong> Upload the dealer's out-the-door quote sheet. I will identify hidden fees, bloated add-ons, and provide counter-offer strategies.</span></li>
                            </ul>
                        </div>
                        <div className="bg-[#1A1A24] p-12 rounded-[2rem] border border-[#2A2A35] flex items-center justify-center text-center">
                            <div>
                                <h4 className="font-playfair italic text-2xl text-[#FAF8F5] mb-4">The ultimate goal is a purchase that is free from regret, mechanical anxiety, and financial padding.</h4>
                                <div className="font-mono text-xs tracking-widest text-[#C9A84C] uppercase pt-6 border-t border-[#2A2A35]/50">
                                    I am in your corner until the keys are in your hand.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="page-break"></div>

                <div className="mt-24 w-full">
                    <header className="border-b border-[#2A2A35] pb-8 mb-12 text-center">
                        <h2 className="font-playfair italic text-4xl text-[#C9A84C]">Recommended Next Steps</h2>
                    </header>
                    <div className="flex flex-col items-center">
                        <div className="space-y-8 font-inter text-lg max-w-2xl text-center">
                            <p className="flex items-center gap-6 text-[#FAF8F5]/90">
                                <span className="font-mono text-[#C9A84C] text-sm">01.</span>
                                Narrow shortlist to top 2 primary targets for tactile evaluation.
                            </p>
                            <p className="flex items-center gap-6 text-[#FAF8F5]/90">
                                <span className="font-mono text-[#C9A84C] text-sm">02.</span>
                                Identify and schedule targeted, structured test drives focusing on space logistics (car seat fitment).
                            </p>
                            <p className="flex items-center gap-6 text-[#FAF8F5]/90">
                                <span className="font-mono text-[#C9A84C] text-sm">03.</span>
                                Finalize candidate model and transition to live market sourcing.
                            </p>
                        </div>
                    </div>
                </div>

                <footer className="mt-auto pt-16 border-t border-[#2A2A35] flex justify-between items-center text-xs font-mono uppercase tracking-widest text-[#FAF8F5]/30">
                    <div>Autolitics Studio // Vehicle Strategy Brief</div>
                    <div>Confidential</div>
                </footer>
            </section>
        </div>
    );
};

export default DeliverableView;
