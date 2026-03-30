import React, { useState } from 'react';
import { X, Save, CarFront, Plus, Minus } from 'lucide-react';

const OnboardingModal = ({ profile, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        buying_timeline: profile?.buying_timeline || '',
        primary_goal: profile?.primary_goal || '',
        trade_in_status: profile?.trade_in_status || '',
        active_shortlist: profile?.active_shortlist || []
    });

    const [newCar, setNewCar] = useState('');

    const handleCarAdd = () => {
        if (newCar.trim()) {
            setFormData(prev => ({ ...prev, active_shortlist: [...prev.active_shortlist, newCar.trim()] }));
            setNewCar('');
        }
    };

    const handleCarRemove = (idx) => {
        setFormData(prev => ({
            ...prev,
            active_shortlist: prev.active_shortlist.filter((_, i) => i !== idx)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="fixed inset-0 bg-[#0D0D12]/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
            
            <div className="relative bg-[#FAF8F5] rounded-[2rem] shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 sm:p-8 flex items-center justify-between border-b border-[#0D0D12]/10 bg-white">
                    <div>
                        <h2 className="text-2xl font-semibold text-[#0D0D12]">Search Profile</h2>
                        <p className="text-[#0D0D12]/60 text-sm mt-1">Configure your vehicle mission parameters.</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-[#0D0D12]/50 hover:bg-[#0D0D12]/5 hover:text-[#0D0D12] rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 sm:p-8 overflow-y-auto">
                    <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-[#0D0D12] mb-1">When do you expect to buy?</label>
                                <select 
                                    value={formData.buying_timeline}
                                    onChange={(e) => setFormData(prev => ({ ...prev, buying_timeline: e.target.value }))}
                                    className="w-full bg-white border border-[#0D0D12]/20 rounded-xl px-4 py-3 text-[#0D0D12] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 transition-shadow transition-colors"
                                    required
                                >
                                    <option value="" disabled>Select Timeline...</option>
                                    <option value="ASAP (1-2 Weeks)">ASAP (1-2 Weeks)</option>
                                    <option value="Within 30 Days">Within 30 Days</option>
                                    <option value="3-6 Months">3-6 Months</option>
                                    <option value="Not sure yet">Not sure yet</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[#0D0D12] mb-1">What is your primary goal?</label>
                                <select 
                                    value={formData.primary_goal}
                                    onChange={(e) => setFormData(prev => ({ ...prev, primary_goal: e.target.value }))}
                                    className="w-full bg-white border border-[#0D0D12]/20 rounded-xl px-4 py-3 text-[#0D0D12] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 transition-shadow"
                                    required
                                >
                                    <option value="" disabled>Select Priority...</option>
                                    <option value="Lowest Total Payment">Lowest overall cost/payment</option>
                                    <option value="Specific Vehicle Acquisition">Finding a specific, exact vehicle configuration</option>
                                    <option value="Best Trade-In Offset">Maximizing trade-in value</option>
                                    <option value="Reliability & Family Hauling">Maximum safety & reliability</option>
                                    <option value="Ev/Hybrid Economy">EV or Hybrid economy</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[#0D0D12] mb-1">Do you have a vehicle to trade in?</label>
                                <select 
                                    value={formData.trade_in_status}
                                    onChange={(e) => setFormData(prev => ({ ...prev, trade_in_status: e.target.value }))}
                                    className="w-full bg-white border border-[#0D0D12]/20 rounded-xl px-4 py-3 text-[#0D0D12] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 transition-shadow"
                                >
                                    <option value="" disabled>Select Status...</option>
                                    <option value="No Trade-In">No, straight purchase</option>
                                    <option value="Yes, Finance Paid Off">Yes, paid off</option>
                                    <option value="Yes, With Loan">Yes, with active loan</option>
                                    <option value="Yes, Lease Return">Yes, lease maturity</option>
                                </select>
                            </div>

                            <div className="pt-4 border-t border-[#0D0D12]/10">
                                <label className="block text-sm font-semibold text-[#0D0D12] mb-1">Active Target Shortlist</label>
                                <p className="text-xs text-[#0D0D12]/50 font-['JetBrains_Mono'] mb-3">Add any vehicles you are actively considering.</p>
                                
                                <div className="flex gap-2 mb-4">
                                    <input 
                                        type="text" 
                                        value={newCar}
                                        onChange={(e) => setNewCar(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleCarAdd();
                                            }
                                        }}
                                        placeholder="e.g. 2024 Toyota RAV4 Hybrid"
                                        className="flex-1 bg-white border border-[#0D0D12]/20 rounded-xl px-4 py-2 text-[#0D0D12] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50"
                                    />
                                    <button 
                                        type="button"
                                        onClick={handleCarAdd}
                                        className="bg-[#0D0D12] text-white px-4 py-2 rounded-xl hover:bg-[#1A1A24] transition-colors"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>

                                {formData.active_shortlist.length > 0 && (
                                    <div className="space-y-2">
                                        {formData.active_shortlist.map((car, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-white border border-[#0D0D12]/10 p-3 rounded-xl text-sm font-medium shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <CarFront size={16} className="text-[#0D0D12]/50" />
                                                    {car}
                                                </div>
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleCarRemove(idx)}
                                                    className="text-red-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
                
                <div className="p-6 border-t border-[#0D0D12]/10 bg-white flex justify-end gap-3">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="px-6 py-3 font-medium text-[#0D0D12] hover:bg-[#0D0D12]/5 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        form="profile-form"
                        className="bg-[#0D0D12] text-white px-8 py-3 rounded-xl text-sm font-medium hover:bg-[#1A1A24] transition-colors flex items-center gap-2"
                    >
                        <Save size={16} /> Save Profile
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingModal;
