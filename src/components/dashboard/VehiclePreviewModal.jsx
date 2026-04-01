import React, { useEffect } from 'react';
import { X, CarFront, Gauge, Fuel, DollarSign, Calendar } from 'lucide-react';

export default function VehiclePreviewModal({ vehicleName, onClose }) {
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    if (!vehicleName) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl animate-fade-in overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-4 border-b border-[#0D0D12]/10">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 bg-[#C9A84C]/10 rounded-xl flex items-center justify-center shrink-0">
                            <CarFront size={20} className="text-[#C9A84C]" />
                        </div>
                        <h2 className="text-lg font-semibold tracking-tight text-[#0D0D12] truncate">{vehicleName}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-[#0D0D12]/5 transition-colors text-[#0D0D12]/40 hover:text-[#0D0D12]"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body — placeholder stats */}
                <div className="p-6 space-y-4">
                    <p className="text-sm text-[#0D0D12]/50">
                        Detailed vehicle data will be available once the vehicle database is connected. Below is a placeholder summary.
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { icon: DollarSign, label: 'Est. MSRP', value: '—' },
                            { icon: Fuel, label: 'Powertrain', value: '—' },
                            { icon: Gauge, label: 'MPG / Range', value: '—' },
                            { icon: Calendar, label: 'Model Year', value: '—' },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-[#FAF8F5] border border-[#0D0D12]/5 rounded-xl p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <stat.icon size={14} className="text-[#0D0D12]/30" />
                                    <span className="text-[10px] font-['JetBrains_Mono'] text-[#0D0D12]/40 uppercase tracking-wider">{stat.label}</span>
                                </div>
                                <p className="text-sm font-semibold text-[#0D0D12]">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6">
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-xl border border-[#0D0D12]/10 text-sm font-medium text-[#0D0D12] hover:bg-[#0D0D12]/5 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
