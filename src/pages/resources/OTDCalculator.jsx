import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ResourcePageShell from '../../components/ResourcePageShell';
import ResourceNav from '../../components/ResourceNav';
import ExpertReviewUpsellCard from '../../components/resources/ExpertReviewUpsellCard';
import VehicleAutocomplete from '../../components/VehicleAutocomplete';
import { Calculator, AlertTriangle, CheckCircle2, Info, Save, RefreshCw, Copy, Check, X, GitCompare } from 'lucide-react';
import caTaxData from '../../data/ca_sales_tax.json';
import caZipToCounty from '../../data/ca_zip_to_county.json';
import {
    STATES,
    computeOtdResults,
    resolveCalculatedCaTaxRate,
    resolveCaLocationFromZip,
    OTD_SAVED_QUOTES_KEY,
} from '../../lib/otdCalculatorCore';
import { getConsideringModelStrings, recordConsideringModel } from '../../lib/vehicleContextStorage';

export default function OTDCalculator() {
    const [formData, setFormData] = useState({
        vehicleLabel: '',
        salePrice: '',
        state: 'CA',
        zipCode: '',
        county: '',
        city: '',
        quotedOtd: '',
        taxRateOverride: '',
        docFee: '',
        regEstimate: '',
        addons: '',
        marketAdjustment: ''
    });

    // We debounce the quote input to prevent immediate "Unusually Low" evaluations while typing "4000..."
    const [debouncedQuote, setDebouncedQuote] = useState('');
    
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuote(formData.quotedOtd);
        }, 800);
        return () => clearTimeout(handler);
    }, [formData.quotedOtd]);

    const [hasCalculated, setHasCalculated] = useState(false);
    const [excludeExtras, setExcludeExtras] = useState(false);
    const [copiedScript, setCopiedScript] = useState(false);

    const contextRecent = useMemo(() => getConsideringModelStrings(), [formData.vehicleLabel]);

    useEffect(() => {
        const t = setTimeout(() => {
            const v = (formData.vehicleLabel || '').trim();
            if (v) recordConsideringModel(v);
        }, 600);
        return () => clearTimeout(t);
    }, [formData.vehicleLabel]);

    // Derived CA locations
    const caCounties = useMemo(() => {
        const counties = caTaxData.filter(d => d.State === 'California').map(d => d.County);
        return [...new Set(counties)].sort();
    }, []);

    const caCities = useMemo(() => {
        if (!formData.county) return [];
        const cities = caTaxData
            .filter(d => d.State === 'California' && d.County === formData.county && d.City)
            .map(d => d.City);
        return [...new Set(cities)].sort();
    }, [formData.county]);

    const calculatedCaTaxRate = useMemo(
        () => resolveCalculatedCaTaxRate(caTaxData, formData.county, formData.city),
        [formData.state, formData.county, formData.city]
    );

    // Save Quote State
    const [savedQuotes, setSavedQuotes] = useState(() => {
        try {
            const localData = localStorage.getItem(OTD_SAVED_QUOTES_KEY);
            return localData ? JSON.parse(localData) : [];
        } catch (error) {
            console.error('Error loading saved quotes:', error);
            return [];
        }
    });
    const [isSaving, setIsSaving] = useState(false);
    const [quoteName, setQuoteName] = useState('');

    useEffect(() => {
        try {
            localStorage.setItem(OTD_SAVED_QUOTES_KEY, JSON.stringify(savedQuotes));
        } catch (error) {
            console.error('Error saving quotes to local storage:', error);
        }
    }, [savedQuotes]);

    // Handle ZIP Code Auto-populate
    useEffect(() => {
        if (formData.zipCode && formData.zipCode.length === 5) {
            import('../../data/zipcodes.json')
                .then(module => {
                    const zipData = module.default;
                    const zipInfo = zipData[formData.zipCode];
                    if (zipInfo) {
                        const newState = zipInfo.state;
                        setFormData((prev) => {
                            let next = { ...prev, state: newState };
                            if (newState === 'CA') {
                                const loc = resolveCaLocationFromZip({
                                    zip5: prev.zipCode,
                                    zipCityRaw: zipInfo.city,
                                    caTaxData,
                                    zipToCountyMap: caZipToCounty,
                                });
                                if (loc) {
                                    next.county = loc.county;
                                    next.city = loc.city;
                                } else {
                                    next.county = '';
                                    next.city = '';
                                }
                            } else {
                                next.county = '';
                                next.city = '';
                            }
                            return next;
                        });
                    }
                })
                .catch(err => console.error("Could not load zip dataset", err));
        }
    }, [formData.zipCode]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.round(val));
    };

    const results = useMemo(() => {
        const salePrice = Number(formData.salePrice) || 0;
        return computeOtdResults({
            salePrice,
            state: formData.state,
            docFee: formData.docFee,
            regEstimate: formData.regEstimate,
            taxRateOverride: formData.taxRateOverride,
            calculatedCaTaxRate,
            quotedOtd: debouncedQuote,
            addons: formData.addons,
            marketAdjustment: formData.marketAdjustment,
            excludeExtras,
        });
    }, [formData, debouncedQuote, excludeExtras, calculatedCaTaxRate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (!hasCalculated) setHasCalculated(true);
    };

    const handleCopyScript = () => {
        const textToCopy = `"Can you send me a fully itemized out-the-door breakdown? I want to review all fees, add-ons, and adjustments before proceeding."\n\n"Can you remove any dealer-installed packages, protection products, or markup from the quote?"`;
        navigator.clipboard.writeText(textToCopy);
        setCopiedScript(true);
        setTimeout(() => setCopiedScript(false), 2000);
    };

    const handleSaveQuote = () => {
        if (!quoteName.trim()) return;
        setSavedQuotes(prev => [...prev, {
            id: Date.now(),
            name: quoteName,
            salePrice: results.salePrice,
            quoted: results.activeQuote,
            diff: results.diff,
            statusTitle: results.statusTitle,
            color: results.statusColor,
            date: new Date().toLocaleDateString(),
            formData: { ...formData }
        }]);
        setIsSaving(false);
        setQuoteName('');
    };

    const handleCompareAnother = () => {
        setFormData(prev => ({
            ...prev,
            vehicleLabel: '',
            salePrice: '',
            quotedOtd: '',
            taxRateOverride: '',
            docFee: '',
            regEstimate: '',
            addons: '',
            marketAdjustment: ''
        }));
        setDebouncedQuote('');
        setExcludeExtras(false);
        setIsSaving(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const StatusIcon = results.status === 'RED_FLAG' || results.status === 'HIGH' ? AlertTriangle : 
                       results.status === 'CLEAN' ? CheckCircle2 : Info;

    return (
        <ResourcePageShell
            navTitle="OTD Price Checker"
            maxWidth="5xl"
            mainClassName="md:px-6 !pb-8"
            footer={
                <div className="w-full bg-[#14141B] border-t border-[#2A2A35] py-12 sm:py-16 mt-auto">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center mb-8 sm:mb-10">
                        <p className="text-[15px] font-['JetBrains_Mono'] text-[#FAF8F5]/40 leading-relaxed uppercase tracking-wider">
                            This tool is part of the Autolitics decision system<br />
                            for comparing vehicles, evaluating offers, and making a clear final decision.
                        </p>
                    </div>
                    <div className="flex justify-center opacity-70 px-3">
                        <ResourceNav title="OTD Price Checker" />
                    </div>
                </div>
            }
        >
                    
                    {/* Header */}
                    <div className="mb-12">
                        <div className="inline-flex items-center gap-2 text-[10px] font-['JetBrains_Mono'] text-[#C9A84C]/60 uppercase tracking-widest mb-4 border border-[#C9A84C]/20 px-3 py-1 rounded-full">
                            Autolitics Advisory Tool
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
                            Out-the-Door<br />
                            <span className="font-['Playfair_Display'] italic text-[#C9A84C]">Price Checker</span>
                        </h1>
                        <p className="text-lg text-[#FAF8F5]/55 max-w-2xl leading-relaxed">
                            See what a clean total should look like — and spot hidden extras.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-8 items-start relative">
                        
                        {/* LEFT COLUMN: Inputs */}
                        <div className="lg:col-span-5 space-y-8 order-2 lg:order-1 lg:sticky lg:top-24">
                            
                            {/* Required Inputs */}
                            <div className="bg-[#14141B] rounded-2xl border border-[#2A2A35] p-6 lg:p-8">
                                <h2 className="text-sm font-['JetBrains_Mono'] text-[#C9A84C] uppercase tracking-widest mb-6">Quote Details</h2>
                                
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm text-[#FAF8F5]/70 font-medium tracking-wide">Vehicle / trim <span className="text-[#FAF8F5]/40 text-[10px] uppercase font-normal">(Optional)</span></label>
                                        <VehicleAutocomplete
                                            value={formData.vehicleLabel}
                                            onChange={(v) => setFormData((prev) => ({ ...prev, vehicleLabel: v }))}
                                            contextRecent={contextRecent}
                                            placeholder="e.g. 2025 BMW X3 xDrive30i"
                                            helperText="Matches the vehicle catalog and models from your Decision Engine worksheet."
                                            className="studio-touch-input w-full bg-[#0D0D12] border border-[#2A2A35] rounded-xl px-4 py-3 text-[#FAF8F5] focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/50 transition-all text-sm"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm text-[#FAF8F5]/70 font-medium tracking-wide">Vehicle Sale Price / MSRP <span className="text-[#C9A84C]">*</span></label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FAF8F5]/40">$</span>
                                            <input 
                                                type="number"
                                                name="salePrice"
                                                value={formData.salePrice}
                                                onChange={handleChange}
                                                className="studio-touch-input w-full bg-[#0D0D12] border border-[#2A2A35] rounded-xl px-4 py-3 pl-8 text-[#FAF8F5] focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/50 transition-all font-['JetBrains_Mono']"
                                                placeholder="e.g. 45000"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm text-[#FAF8F5]/70 font-medium tracking-wide">Dealer Quoted OTD Price <span className="text-[#C9A84C]">*</span></label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FAF8F5]/40">$</span>
                                            <input 
                                                type="number"
                                                name="quotedOtd"
                                                value={formData.quotedOtd}
                                                onChange={handleChange}
                                                className="studio-touch-input w-full bg-[#C9A84C]/5 border border-[#C9A84C]/30 rounded-xl px-4 py-3 pl-8 text-[#C9A84C] focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all font-['JetBrains_Mono'] font-bold"
                                                placeholder="e.g. 49500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm text-[#FAF8F5]/70 font-medium tracking-wide">State <span className="text-[#C9A84C]">*</span></label>
                                            <select 
                                                name="state"
                                                value={formData.state}
                                                onChange={handleChange}
                                                className="studio-touch-input w-full bg-[#0D0D12] border border-[#2A2A35] rounded-xl px-4 py-3 text-[#FAF8F5] focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/50 transition-all appearance-none"
                                            >
                                                {STATES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="flex items-center justify-between text-sm text-[#FAF8F5]/70 font-medium tracking-wide">
                                                <span>ZIP Code <span className="text-[#FAF8F5]/40 text-[10px] uppercase font-normal">(Optional)</span></span>
                                            </label>
                                            <input 
                                                type="text"
                                                name="zipCode"
                                                value={formData.zipCode}
                                                onChange={handleChange}
                                                maxLength={5}
                                                className="studio-touch-input w-full bg-[#0D0D12] border border-[#2A2A35] rounded-xl px-4 py-3 text-[#FAF8F5] focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/50 transition-all font-['JetBrains_Mono']"
                                                placeholder="e.g. 90210"
                                            />
                                        </div>
                                    </div>

                                    {formData.state === 'CA' && (
                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div className="space-y-2">
                                                <label className="text-sm text-[#FAF8F5]/70 font-medium tracking-wide">County</label>
                                                <select 
                                                    name="county"
                                                    value={formData.county}
                                                    onChange={(e) => {
                                                        handleChange(e);
                                                        setFormData(prev => ({ ...prev, city: '' }));
                                                    }}
                                                    className="studio-touch-input w-full bg-[#0D0D12] border border-[#2A2A35] rounded-xl px-4 py-3 text-[#FAF8F5] focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/50 transition-all appearance-none text-sm"
                                                >
                                                    <option value="">Select County...</option>
                                                    {caCounties.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <label className="text-sm text-[#FAF8F5]/70 font-medium tracking-wide">City</label>
                                                <select 
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleChange}
                                                    disabled={!formData.county || caCities.length === 0}
                                                    className="studio-touch-input w-full bg-[#0D0D12] border border-[#2A2A35] rounded-xl px-4 py-3 text-[#FAF8F5] focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/50 transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                                >
                                                    <option value="">{caCities.length === 0 ? 'City...' : 'Select City...'}</option>
                                                    {caCities.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Disclosed Extras */}
                            <div className="bg-[#14141B] rounded-2xl border border-[#2A2A35] p-6 lg:p-8">
                                <h2 className="text-sm font-['JetBrains_Mono'] text-[#FAF8F5]/40 uppercase tracking-widest mb-6">Disclosed Extras (Optional)</h2>
                                
                                {/* REORDERED: Doc, Reg, Tax first */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-[#FAF8F5]/70 font-medium tracking-wide uppercase">Doc Fee</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FAF8F5]/40">$</span>
                                            <input 
                                                type="number"
                                                name="docFee"
                                                value={formData.docFee}
                                                onChange={handleChange}
                                                className="studio-touch-input w-full bg-[#0D0D12] border border-[#2A2A35] rounded-xl px-3 py-2.5 pl-7 text-sm text-[#FAF8F5] focus:outline-none focus:border-[#C9A84C]/50 transition-all font-['JetBrains_Mono'] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                placeholder={formData.state === 'CA' ? "85" : "0"}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] text-[#FAF8F5]/70 font-medium tracking-wide uppercase">Reg Estimate</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FAF8F5]/40">$</span>
                                            <input 
                                                type="number"
                                                name="regEstimate"
                                                value={formData.regEstimate}
                                                onChange={handleChange}
                                                className="studio-touch-input w-full bg-[#0D0D12] border border-[#2A2A35] rounded-xl px-3 py-2.5 pl-7 text-sm text-[#FAF8F5] focus:outline-none focus:border-[#C9A84C]/50 transition-all font-['JetBrains_Mono'] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                placeholder={formData.state === 'CA' ? Math.round((Number(formData.salePrice) || 0) * 0.0115).toString() : "0"}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] text-[#FAF8F5]/70 font-medium tracking-wide uppercase">Tax Rate</label>
                                        <div className="relative">
                                            <input 
                                                type="number"
                                                step="0.01"
                                                name="taxRateOverride"
                                                value={formData.taxRateOverride}
                                                onChange={handleChange}
                                                className="studio-touch-input w-full bg-[#0D0D12] border border-[#2A2A35] rounded-xl px-3 py-2.5 pr-10 text-sm text-[#FAF8F5] focus:outline-none focus:border-[#C9A84C]/50 transition-all font-['JetBrains_Mono'] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                placeholder={formData.state === 'CA' ? calculatedCaTaxRate.toFixed(2) : "0.00"}
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FAF8F5]/40">%</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-[10px] text-[#FAF8F5]/30 mb-6 italic leading-relaxed">
                                    Notes: {formData.state === 'CA' ? "California tax rate defaults to your selected county/city rate, or 8.25% average if unselected." : "Verify standard limits for doc and tax rates in your state."}
                                </div>

                                <div className="border-t border-[#2A2A35] border-dashed pt-6 space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs text-[#FAF8F5]/70 font-medium tracking-wide">Known Add-ons</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FAF8F5]/40">$</span>
                                                <input 
                                                    type="number"
                                                    name="addons"
                                                    value={formData.addons}
                                                    onChange={handleChange}
                                                    className="studio-touch-input w-full bg-[#0D0D12] border border-[#2A2A35] rounded-xl px-3 py-2.5 pl-7 text-sm text-[#FAF8F5] focus:outline-none focus:border-[#C9A84C]/50 transition-all font-['JetBrains_Mono']"
                                                    placeholder="e.g. 1500"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs text-[#FAF8F5]/70 font-medium tracking-wide">Market Adjustment</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FAF8F5]/40">$</span>
                                                <input 
                                                    type="number"
                                                    name="marketAdjustment"
                                                    value={formData.marketAdjustment}
                                                    onChange={handleChange}
                                                    className="studio-touch-input w-full bg-[#0D0D12] border border-[#2A2A35] rounded-xl px-3 py-2.5 pl-7 text-sm text-[#FAF8F5] focus:outline-none focus:border-[#C9A84C]/50 transition-all font-['JetBrains_Mono']"
                                                    placeholder="e.g. 5000"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Toggle if extras present */}
                                    {results.totalKnownExtras > 0 && (
                                        <label className="flex items-center gap-3 p-3 mt-2 rounded-xl border border-[#C9A84C]/20 bg-[#C9A84C]/5 cursor-pointer hover:bg-[#C9A84C]/10 transition-colors">
                                            <button 
                                                type="button"
                                                onClick={() => setExcludeExtras(!excludeExtras)}
                                                className={`w-10 h-5 shrink-0 rounded-full transition-colors relative ${excludeExtras ? 'bg-[#C9A84C]' : 'bg-[#0D0D12] border border-[#2A2A35]'}`}
                                            >
                                                <span className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white transition-transform ${excludeExtras ? 'translate-x-5' : 'translate-x-1'}`} />
                                            </button>
                                            <span className="text-xs text-[#FAF8F5]/80 font-medium select-none">Exclude disclosed extras from dealer quote</span>
                                        </label>
                                    )}
                                </div>

                            </div>

                        </div>

                        {/* RIGHT COLUMN: Output UI */}
                        <div className="lg:col-span-7 order-1 lg:order-2">
                            <div className="space-y-6">
                                
                                {results.valid ? (
                                    <div className="animate-in fade-in duration-500 space-y-6">
                                        
                                        {/* Advisory Card */}
                                        <div className="rounded-2xl border border-[#2A2A35] bg-[#14141B]">
                                            {/* Status Banner */}
                                            <div className={`p-6 border-b flex gap-4 rounded-t-2xl ${results.statusBg} ${results.statusBorder}`}>
                                                <div className={`mt-1 shrink-0 ${results.statusColor}`}>
                                                    <StatusIcon size={24} />
                                                </div>
                                                <div>
                                                    <h3 className={`text-lg font-semibold mb-1 ${results.statusColor}`}>{results.statusTitle}</h3>
                                                    <p className={`text-sm leading-relaxed ${results.statusColor} opacity-90`}>
                                                        {results.statusMessage}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="p-6 lg:p-8">
                                                <h4 className="text-sm font-['JetBrains_Mono'] text-[#C9A84C] uppercase tracking-widest mb-6">Quote Analysis</h4>
                                                
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-[#FAF8F5]/60">Vehicle Sale Price</span>
                                                        <span className="font-['JetBrains_Mono'] text-[#FAF8F5]/80">{formatCurrency(results.salePrice)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-[#FAF8F5]/60">Expected Tax ({results.taxRate}%)</span>
                                                        <span className="font-['JetBrains_Mono'] text-[#FAF8F5]/80">{formatCurrency(results.calculatedTax)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-[#FAF8F5]/60">Reg / Doc Estimate</span>
                                                        <span className="font-['JetBrains_Mono'] text-[#FAF8F5]/80">{formatCurrency(results.regFee + results.docFee)}</span>
                                                    </div>
                                                    
                                                    {/* Total Clean Range */}
                                                    <div className="mt-4 pt-4 border-t border-[#2A2A35]">
                                                        <div className="flex justify-between items-center text-lg font-semibold text-[#FAF8F5]/90">
                                                            <span>Expected Clean Range</span>
                                                            <span className="font-['JetBrains_Mono']">{formatCurrency(results.rangeLow)} – {formatCurrency(results.rangeHigh)}</span>
                                                        </div>
                                                        <p className="text-[11px] text-[#FAF8F5]/40 mt-1">
                                                            This range reflects the expected sale price, tax, registration, and standard documentation fee.
                                                        </p>
                                                    </div>

                                                    {/* Dealer Quote Row */}
                                                    <div className="flex justify-between items-center text-[#C9A84C] bg-[#C9A84C]/5 px-4 py-3 rounded-lg border border-[#C9A84C]/10 mt-6 relative overflow-hidden">
                                                        <span className="text-sm font-semibold">{excludeExtras ? 'Adjusted Dealer Quote' : 'Dealer Quote'}</span>
                                                        <span className="text-base font-bold font-['JetBrains_Mono']">{formatCurrency(results.activeQuote)}</span>
                                                        {excludeExtras && <span className="absolute left-0 top-0 h-full w-1 bg-[#C9A84C]"></span>}
                                                    </div>

                                                    {/* Gap Output */}
                                                    <div className="border-t border-dashed border-[#2A2A35] pt-4 mt-6">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs font-['JetBrains_Mono'] text-[#FAF8F5]/50 uppercase tracking-widest">
                                                                {results.diff > 0 ? 'Above Expected' : 'Below Expected'}
                                                            </span>
                                                            <span className={`text-base font-bold font-['JetBrains_Mono'] ${Math.abs(results.diff) < 300 ? 'text-green-400' : (results.diff > 0 ? 'text-red-400' : 'text-blue-400')}`}>
                                                                {results.diff > 0 ? '+' : ''}{formatCurrency(results.diff)}
                                                            </span>
                                                        </div>

                                                        {results.totalKnownExtras > 0 && !excludeExtras && (
                                                            <>
                                                                <div className="flex justify-between items-center mt-3 pl-4 border-l-2 border-[#2A2A35]">
                                                                    <span className="text-xs text-[#FAF8F5]/50">Disclosed Adds/Market Adj.</span>
                                                                    <span className="text-xs text-[#FAF8F5]/50 font-['JetBrains_Mono']">
                                                                        - {formatCurrency(results.totalKnownExtras)}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between items-center mt-3 pl-4 border-l-2 border-[#C9A84C]/40">
                                                                    <span className="text-xs text-[#FAF8F5]/80 font-semibold">Unexplained Remaining Gap</span>
                                                                    <span className="text-xs text-[#C9A84C] font-semibold font-['JetBrains_Mono']">
                                                                        {formatCurrency(results.unexplainedDiff)}
                                                                    </span>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* UI Improvement: Thicker Stacked Bar with distinct colors & hovers */}
                                                <div className="mt-8 pt-8 border-t border-[#2A2A35]">
                                                    <h4 className="text-[10px] font-['JetBrains_Mono'] text-[#FAF8F5]/40 uppercase tracking-widest mb-4">Where the Total Comes From</h4>
                                                    <div className="flex w-full h-4 mb-3">
                                                        {results.visibleBars.map((bar, index) => {
                                                            let roundedClass = '';
                                                            if (index === 0) roundedClass += ' rounded-l-full';
                                                            if (index === results.visibleBars.length - 1) roundedClass += ' rounded-r-full';
                                                            
                                                            return (
                                                                <div 
                                                                    key={bar.label} 
                                                                    style={{ width: `${(bar.value / results.stackTotal) * 100}%` }} 
                                                                    className={`${bar.color} ${roundedClass} relative group`} 
                                                                    title={bar.label}
                                                                >
                                                                    <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-[#2A2A35] text-xs py-1.5 px-3 rounded-md shadow-xl whitespace-nowrap z-50 font-bold border ${bar.borderColor || 'border-[#FAF8F5]/10'} ${bar.textColor}`}>
                                                                        {bar.label} <span className={`font-['JetBrains_Mono'] font-normal ml-1 ${bar.textColor === 'text-red-400' ? '' : 'text-[#FAF8F5]/70'}`}>{formatCurrency(bar.value)}</span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="flex justify-between text-[10px] text-[#FAF8F5]/40 font-['JetBrains_Mono']">
                                                        <span>Clean Estimate</span>
                                                        {results.diff > 0 && <span className="text-red-400/80">Added Variance</span>}
                                                    </div>
                                                </div>

                                            </div>
                                            
                                            {/* Moved Market Context immediately below calculations */}
                                            <div className="p-6 bg-[#0D0D12] border-t border-[#2A2A35]">
                                                <h4 className="text-xs font-['JetBrains_Mono'] text-[#FAF8F5]/50 uppercase tracking-widest mb-3">Market Context</h4>
                                                <p className="text-[13px] text-[#FAF8F5]/60 leading-relaxed">
                                                    Not every inflated quote signals a bad deal. Newly launched or high-demand vehicles often sell closer to MSRP, and discounts may be limited. What matters is whether the quote is clean, transparent, and free of unnecessary extras.
                                                </p>
                                            </div>

                                            <div className="p-6 border-t border-[#2A2A35] space-y-4">
                                                <ExpertReviewUpsellCard
                                                    variant="dark"
                                                    prefill={{
                                                        vehicle_name: formData.vehicleLabel?.trim() || '',
                                                        out_the_door_price: String(Math.round(results.activeQuote)),
                                                        client_notes:
                                                            `From OTD Price Checker: Expected clean range approx. ${formatCurrency(results.rangeLow)}–${formatCurrency(results.rangeHigh)}. Variance vs clean estimate: ${results.diff > 0 ? '+' : ''}${formatCurrency(results.diff)}. Status: ${results.statusTitle}.`,
                                                        quote_breakdown: {
                                                            source: 'otd_calculator',
                                                            salePrice: results.salePrice,
                                                            cleanOtd: results.cleanOtd,
                                                            rangeLow: results.rangeLow,
                                                            rangeHigh: results.rangeHigh,
                                                            quotedOtd: results.activeQuote,
                                                            variance: results.diff,
                                                            statusTitle: results.statusTitle,
                                                            taxRate: results.taxRate,
                                                            calculatedTax: results.calculatedTax,
                                                            docFee: results.docFee,
                                                            regFee: results.regFee,
                                                            formSnapshot: { ...formData },
                                                        },
                                                    }}
                                                />
                                                <div className="flex flex-wrap gap-3">
                                                    <Link
                                                        to="/resources/dealer-offer-comparison?seedOtd=1"
                                                        onClick={() => {
                                                            try {
                                                                sessionStorage.setItem(
                                                                    'autolitics_comparison_seed_otd',
                                                                    JSON.stringify({
                                                                        shared: {
                                                                            state: formData.state,
                                                                            zipCode: formData.zipCode,
                                                                            county: formData.county,
                                                                            city: formData.city,
                                                                        },
                                                                        dealer: {
                                                                            dealerName: '',
                                                                            vehicleLabel: formData.vehicleLabel || '',
                                                                            salePrice: formData.salePrice,
                                                                            quotedOtd: formData.quotedOtd,
                                                                            docFee: formData.docFee,
                                                                            regEstimate: formData.regEstimate,
                                                                            taxRateOverride: formData.taxRateOverride,
                                                                            addons: formData.addons,
                                                                            marketAdjustment: formData.marketAdjustment,
                                                                        },
                                                                    })
                                                                );
                                                            } catch (err) {
                                                                console.warn(err);
                                                            }
                                                        }}
                                                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#C9A84C] border border-[#C9A84C]/35 px-4 py-2.5 rounded-xl hover:bg-[#C9A84C]/10 transition-colors"
                                                    >
                                                        <GitCompare size={16} />
                                                        Open in comparison worksheet
                                                    </Link>
                                                    <Link
                                                        to="/resources/dealer-offer-comparison?loadSaved=1"
                                                        className="inline-flex items-center gap-2 text-sm font-medium text-[#FAF8F5]/50 hover:text-[#FAF8F5]/80 transition-colors"
                                                    >
                                                        Compare saved quotes
                                                    </Link>
                                                </div>
                                            </div>

                                        </div>

                                        {/* Likely sources of variance */}
                                        {results.diff > 150 && (
                                            <div className="bg-[#14141B] rounded-2xl border border-[#2A2A35] p-6 lg:p-8">
                                                <h4 className="text-sm font-semibold mb-3">Likely Sources of Variance</h4>
                                                <p className="text-sm text-[#FAF8F5]/70 leading-relaxed mb-4">
                                                    {(results.totalKnownExtras > 0 && !excludeExtras)
                                                        ? 'This difference may be explained in part by the disclosed extras entered above. Any remaining gap should be reviewed carefully.' 
                                                        : 'This difference is most often caused by one or more of the following:'}
                                                </p>
                                                <ul className="text-sm text-[#FAF8F5]/60 space-y-2 list-disc pl-4 marker:text-[#C9A84C]">
                                                    <li>Market adjustment or dealer markup</li>
                                                    <li>Dealer-installed add-ons or protection packages</li>
                                                    <li>Elevated documentation or miscellaneous dealer fees</li>
                                                    <li>Tax or registration assumptions that differ from the quote</li>
                                                </ul>
                                            </div>
                                        )}

                                        {/* Utility Footer Actions */}
                                        <div className="flex flex-wrap items-center gap-3 pt-4 print:hidden">
                                            {!isSaving ? (
                                                <button 
                                                    onClick={() => setIsSaving(true)} 
                                                    className="flex items-center gap-2 px-5 py-3 bg-[#C9A84C]/5 border border-[#C9A84C]/30 text-[#C9A84C] rounded-xl text-sm font-semibold hover:bg-[#C9A84C]/10 transition-colors"
                                                >
                                                    <Save size={16} /> Save this quote
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                                    <input 
                                                        type="text" 
                                                        value={quoteName}
                                                        onChange={(e) => setQuoteName(e.target.value)}
                                                        placeholder="Name (e.g. BMW Downtown)"
                                                        className="studio-touch-input w-full sm:w-64 bg-[#14141B] border border-[#2A2A35] rounded-xl px-4 py-3 text-sm text-[#FAF8F5] focus:outline-none focus:border-[#C9A84C] transition-colors"
                                                        autoFocus
                                                    />
                                                    <button onClick={handleSaveQuote} className="p-3 bg-[#C9A84C] rounded-xl text-white hover:opacity-90 transition-opacity">
                                                        <Check size={18} />
                                                    </button>
                                                    <button onClick={() => { setIsSaving(false); setQuoteName(''); }} className="p-3 border border-[#2A2A35] rounded-xl text-[#FAF8F5]/60 hover:text-white transition-opacity">
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            )}
                                            <button 
                                                onClick={handleCompareAnother} 
                                                className="flex items-center gap-2 px-5 py-3 border border-[#2A2A35] rounded-xl text-sm font-semibold hover:bg-[#2A2A35]/50 transition-colors text-[#FAF8F5]/80 w-full sm:w-auto mt-2 sm:mt-0"
                                            >
                                                <RefreshCw size={16} /> Check another quote
                                            </button>
                                        </div>

                                    </div>
                                ) : (
                                    <div className="bg-[#14141B] rounded-2xl border border-[#2A2A35] p-10 flex flex-col items-center justify-center text-center opacity-70 min-h-[400px]">
                                        <div className="w-16 h-16 rounded-full bg-[#0D0D12] border border-[#2A2A35] flex items-center justify-center mb-6 text-[#FAF8F5]/20">
                                            <Calculator size={28} />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2 text-[#FAF8F5]/90">Awaiting Numbers</h3>
                                        <p className="text-sm text-[#FAF8F5]/50 max-w-sm leading-relaxed">
                                            Enter the vehicle sale price and the dealer's fully quoted out-the-door price to view advisory feedback and next steps.
                                        </p>
                                    </div>
                                )}
                                
                            </div>
                        </div>

                    </div>
                
                {/* --- SEPARATE GUIDANCE SECTION BELOW UI --- */}
                {results.valid && (
                    <div className="w-full mt-20 pt-16 border-t border-[#2A2A35]">
                        <div className="text-center mb-10">
                            <h2 className="text-sm font-['JetBrains_Mono'] text-[#C9A84C] uppercase tracking-widest mb-3">Advisory Action Plan</h2>
                            <h3 className="text-2xl font-bold">How to move forward</h3>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 items-stretch">
                            {/* What to Say script */}
                            <div className="bg-[#C9A84C]/5 border border-[#C9A84C]/20 rounded-2xl p-8 relative flex flex-col h-full">
                                <div className="absolute top-6 right-6 print:hidden">
                                    <button 
                                        onClick={handleCopyScript}
                                        className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center text-[#C9A84C] hover:bg-[#C9A84C]/20 transition-all font-semibold"
                                        title="Copy Script"
                                    >
                                        {copiedScript ? <Check size={18} /> : <Copy size={18} />}
                                    </button>
                                </div>
                                <h4 className="text-sm font-semibold text-[#C9A84C] mb-5">What to Say to the Dealer</h4>
                                <div className="pr-12 flex-grow">
                                    <p className="text-[15px] leading-relaxed text-[#FAF8F5]/90 italic font-medium mb-4 whitespace-pre-line">
                                        “Can you send me a fully itemized out-the-door breakdown? I want to review all fees, add-ons, and adjustments before proceeding.”
                                    </p>
                                    <p className="text-sm leading-relaxed text-[#FAF8F5]/60 italic">
                                        If needed, ask: “Can you remove any dealer-installed packages, protection products, or markup from the quote?”
                                    </p>
                                </div>
                            </div>

                            {/* Next Steps */}
                            <div className="p-8 rounded-2xl bg-[#14141B] border border-[#2A2A35] flex flex-col h-full">
                                <h4 className="text-sm font-semibold text-[#FAF8F5]/80 mb-5">Next Steps</h4>
                                <p className="text-[15px] text-[#FAF8F5]/60 leading-relaxed">
                                    Always request a fully itemized out-the-door breakdown before moving forward.<br/><br/>A verbal quote or single-number total can conceal markup, add-ons, or inflated dealer fees. The goal is not just a lower number — it is a clean, fully explained one. Let the numbers dictate the negotiation.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- SAVED QUOTES UI --- */}
                {savedQuotes.length > 0 && (
                    <div className="w-full mt-16 print:hidden">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                            <h3 className="text-sm font-['JetBrains_Mono'] uppercase tracking-widest text-[#FAF8F5]/60">Your Saved Quotes</h3>
                            <Link
                                to="/resources/dealer-offer-comparison?loadSaved=1"
                                className="text-xs font-semibold text-[#C9A84C] hover:underline"
                            >
                                Open all in comparison worksheet
                            </Link>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {savedQuotes.map(sq => (
                                <div 
                                    key={sq.id} 
                                    className={`p-5 bg-[#14141B] rounded-2xl border border-[#2A2A35] flex flex-col ${sq.formData ? 'cursor-pointer hover:border-[#C9A84C]/50 transition-colors' : ''}`}
                                    onClick={() => {
                                        if (sq.formData) {
                                            setFormData(sq.formData);
                                            setDebouncedQuote(sq.formData.quotedOtd || '');
                                            setQuoteName(sq.name);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }
                                    }}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="font-semibold text-[15px] text-[#FAF8F5]/90">{sq.name}</div>
                                            <div className="text-[11px] text-[#FAF8F5]/40 font-['JetBrains_Mono'] mt-1">{sq.date}</div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSavedQuotes(prev => prev.filter(q => q.id !== sq.id));
                                                }}
                                                className="text-[#FAF8F5]/30 hover:text-red-400/80 transition-colors"
                                                title="Delete quote"
                                            >
                                                <X size={14} />
                                            </button>
                                            <div className={`text-[10px] font-bold px-2 py-1 rounded-md bg-opacity-10 border border-opacity-20 uppercase tracking-wider ${sq.color.replace('text-', 'bg-').replace('text-', 'border-')} ${sq.color}`}>
                                                {sq.statusTitle}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-auto space-y-2 pt-4 border-t border-[#2A2A35]">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[#FAF8F5]/60">Vehicle</span>
                                            <span className="font-['JetBrains_Mono']">{formatCurrency(sq.salePrice)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[#FAF8F5]/60">Quote</span>
                                            <span className="font-bold text-[#C9A84C] font-['JetBrains_Mono']">{formatCurrency(sq.quoted)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

        </ResourcePageShell>
    );
}
