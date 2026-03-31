import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Printer, Upload, Trophy, Plus, Minus } from 'lucide-react';
import caTaxData from '../../data/ca_sales_tax.json';
import caZipToCounty from '../../data/ca_zip_to_county.json';
import VehicleAutocomplete from '../VehicleAutocomplete';
import {
    STATES,
    computeOtdResults,
    resolveCalculatedCaTaxRate,
    resolveCaLocationFromZip,
    OTD_SAVED_QUOTES_KEY,
} from '../../lib/otdCalculatorCore';
import {
    loadOfferComparisonSnapshot,
    saveOfferComparisonSnapshot,
    getConsideringModelStrings,
    recordConsideringModel,
} from '../../lib/vehicleContextStorage';
import ExpertReviewUpsellCard from './ExpertReviewUpsellCard';

const MIN_OFFERS = 3;
const MAX_OFFERS = 5;

/** Native selects render shorter than text inputs; fixed height + padding aligns Shared tax location row. */
const SHARED_TAX_FIELD_BASE =
    'w-full min-w-0 max-w-full box-border bg-[#0D0D12] border border-[#2A2A35] rounded-xl px-3 h-11 min-h-[2.75rem] text-sm text-[#FAF8F5] leading-snug shadow-none';
const SHARED_TAX_SELECT_CLASS = `${SHARED_TAX_FIELD_BASE} appearance-none cursor-pointer pr-9 bg-[length:0.875rem] bg-[right_0.65rem_center] bg-no-repeat [background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23C9A84C' stroke-opacity='0.55'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")]`;
const SHARED_TAX_INPUT_CLASS = `${SHARED_TAX_FIELD_BASE} font-['JetBrains_Mono']`;

function defaultOfferLabel(i) {
    return `Offer ${i + 1}`;
}

function emptyOffer(i) {
    return {
        dealerName: defaultOfferLabel(i),
        vehicleLabel: '',
        salePrice: '',
        quotedOtd: '',
        docFee: '',
        regEstimate: '',
        taxRateOverride: '',
        addons: '',
        marketAdjustment: '',
    };
}

function formatCurrency(val) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(Math.round(val));
}

const defaultShared = { state: 'CA', zipCode: '', county: '', city: '' };

function loadWorksheetOrDefaults() {
    const saved = loadOfferComparisonSnapshot();
    if (saved?.dealers?.length >= MIN_OFFERS) {
        return {
            shared: { ...defaultShared, ...saved.shared },
            dealers: saved.dealers.map((d, i) => ({
                ...emptyOffer(i),
                ...d,
                dealerName: d.dealerName || defaultOfferLabel(i),
            })),
            excludeExtras: !!saved.excludeExtras,
        };
    }
    return {
        shared: { ...defaultShared },
        dealers: Array.from({ length: MIN_OFFERS }, (_, i) => emptyOffer(i)),
        excludeExtras: false,
    };
}

const wsInit = loadWorksheetOrDefaults();

/** @param {{ embedInPage?: boolean }} props — When true, parent page supplies title and intro; show location note for tax/reg. */
export default function DealerComparisonInteractive({ embedInPage = false }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [shared, setShared] = useState(wsInit.shared);
    const [dealers, setDealers] = useState(wsInit.dealers);
    const [excludeExtras, setExcludeExtras] = useState(wsInit.excludeExtras);
    const [contextRecent, setContextRecent] = useState(() => getConsideringModelStrings());

    const caCounties = useMemo(() => {
        const counties = caTaxData.filter((d) => d.State === 'California').map((d) => d.County);
        return [...new Set(counties)].sort();
    }, []);

    const caCities = useMemo(() => {
        if (!shared.county) return [];
        const cities = caTaxData
            .filter((d) => d.State === 'California' && d.County === shared.county && d.City)
            .map((d) => d.City);
        return [...new Set(cities)].sort();
    }, [shared.county]);

    const calculatedCaTaxRate = useMemo(
        () => resolveCalculatedCaTaxRate(caTaxData, shared.county, shared.city),
        [shared.county, shared.city]
    );

    useEffect(() => {
        const t = setTimeout(() => {
            saveOfferComparisonSnapshot({ shared, dealers, excludeExtras, savedAt: Date.now() });
        }, 450);
        return () => clearTimeout(t);
    }, [shared, dealers, excludeExtras]);

    useEffect(() => {
        setContextRecent(getConsideringModelStrings());
    }, [dealers]);

    useEffect(() => {
        const t = setTimeout(() => {
            dealers.forEach((d) => {
                const v = (d.vehicleLabel || '').trim();
                if (v) recordConsideringModel(v);
            });
        }, 800);
        return () => clearTimeout(t);
    }, [dealers]);

    useEffect(() => {
        if (!shared.zipCode || shared.zipCode.length !== 5) return;
        import('../../data/zipcodes.json')
            .then((module) => {
                const zipData = module.default;
                const zipInfo = zipData[shared.zipCode];
                if (!zipInfo) return;
                const newState = zipInfo.state;
                setShared((prev) => {
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
            })
            .catch((err) => console.error('Could not load zip dataset', err));
    }, [shared.zipCode]);

    const columnResults = useMemo(() => {
        return dealers.map((d) =>
            computeOtdResults({
                salePrice: Number(d.salePrice) || 0,
                state: shared.state,
                docFee: d.docFee,
                regEstimate: d.regEstimate,
                taxRateOverride: d.taxRateOverride,
                calculatedCaTaxRate,
                quotedOtd: d.quotedOtd,
                addons: d.addons,
                marketAdjustment: d.marketAdjustment,
                excludeExtras,
            })
        );
    }, [dealers, shared.state, calculatedCaTaxRate, excludeExtras]);

    const bestIdx = useMemo(() => {
        let best = -1;
        let bestQuote = Infinity;
        columnResults.forEach((r, i) => {
            if (!r.valid) return;
            if (r.activeQuote < bestQuote) {
                bestQuote = r.activeQuote;
                best = i;
            }
        });
        return best;
    }, [columnResults]);

    const applyLoadSaved = useCallback(() => {
        try {
            const raw = localStorage.getItem(OTD_SAVED_QUOTES_KEY);
            const list = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(list) || list.length === 0) return;
            const firstFd = list[0]?.formData || {};
            if (firstFd.state) {
                setShared((s) => ({
                    ...s,
                    state: firstFd.state || s.state,
                    zipCode: firstFd.zipCode != null ? String(firstFd.zipCode) : s.zipCode,
                    county: firstFd.county != null ? String(firstFd.county) : s.county,
                    city: firstFd.city != null ? String(firstFd.city) : s.city,
                }));
            }
            const n = Math.min(MAX_OFFERS, Math.max(MIN_OFFERS, list.length));
            const nextDealers = Array.from({ length: n }, (_, i) => emptyOffer(i));
            list.slice(0, n).forEach((sq, i) => {
                const fd = sq.formData || {};
                nextDealers[i] = {
                    dealerName: sq.name || defaultOfferLabel(i),
                    vehicleLabel: '',
                    salePrice: fd.salePrice != null ? String(fd.salePrice) : '',
                    quotedOtd: fd.quotedOtd != null ? String(fd.quotedOtd) : '',
                    docFee: fd.docFee != null ? String(fd.docFee) : '',
                    regEstimate: fd.regEstimate != null ? String(fd.regEstimate) : '',
                    taxRateOverride: fd.taxRateOverride != null ? String(fd.taxRateOverride) : '',
                    addons: fd.addons != null ? String(fd.addons) : '',
                    marketAdjustment: fd.marketAdjustment != null ? String(fd.marketAdjustment) : '',
                };
            });
            setDealers(nextDealers);
        } catch (e) {
            console.error(e);
        }
    }, []);

    const applySeedOtd = useCallback(() => {
        try {
            const raw = sessionStorage.getItem('autolitics_comparison_seed_otd');
            if (!raw) return;
            const data = JSON.parse(raw);
            sessionStorage.removeItem('autolitics_comparison_seed_otd');
            if (data.shared) {
                setShared((s) => ({ ...s, ...data.shared }));
            }
            if (data.dealer) {
                setDealers((prev) => {
                    const next = prev.length >= MIN_OFFERS ? [...prev] : Array.from({ length: MIN_OFFERS }, (_, i) => emptyOffer(i));
                    next[0] = {
                        ...next[0],
                        ...data.dealer,
                        dealerName: data.dealer.dealerName || next[0].dealerName,
                        vehicleLabel: data.dealer.vehicleLabel || '',
                    };
                    return next;
                });
            }
        } catch (e) {
            console.warn(e);
        }
    }, []);

    useEffect(() => {
        if (searchParams.get('loadSaved') === '1') {
            applyLoadSaved();
            searchParams.delete('loadSaved');
            setSearchParams(searchParams, { replace: true });
        }
        if (searchParams.get('seedOtd') === '1') {
            applySeedOtd();
            searchParams.delete('seedOtd');
            setSearchParams(searchParams, { replace: true });
        }
    }, [searchParams, setSearchParams, applyLoadSaved, applySeedOtd]);

    const updateDealer = (idx, patch) => {
        setDealers((prev) => {
            const next = [...prev];
            next[idx] = { ...next[idx], ...patch };
            return next;
        });
    };

    const addOffer = () => {
        setDealers((prev) =>
            prev.length < MAX_OFFERS ? [...prev, emptyOffer(prev.length)] : prev
        );
    };

    const removeOffer = () => {
        setDealers((prev) => (prev.length > MIN_OFFERS ? prev.slice(0, -1) : prev));
    };

    const handlePrint = () => window.print();

    const bestPrefill =
        bestIdx >= 0
            ? {
                  dealership_name: dealers[bestIdx].dealerName || '',
                  vehicle_name: dealers[bestIdx].vehicleLabel || '',
                  out_the_door_price: String(Math.round(columnResults[bestIdx].activeQuote)),
                  client_notes: `From offer comparison worksheet (lowest quoted OTD). Expected clean ~${formatCurrency(columnResults[bestIdx].cleanOtd)}. Variance: ${columnResults[bestIdx].diff > 0 ? '+' : ''}${formatCurrency(columnResults[bestIdx].diff)}.`,
                  quote_breakdown: {
                      source: 'dealer_comparison',
                      bestColumnIndex: bestIdx,
                      columns: columnResults.map((r, i) => ({
                          dealerName: dealers[i].dealerName,
                          vehicleLabel: dealers[i].vehicleLabel,
                          valid: r.valid,
                          salePrice: r.salePrice,
                          quotedOtd: r.activeQuote,
                          cleanOtd: r.cleanOtd,
                          variance: r.diff,
                          statusTitle: r.statusTitle,
                      })),
                  },
              }
            : null;

    return (
        <section className="mb-12 comparison-interactive-root w-full min-w-0">
            <div
                className={`flex flex-wrap items-center gap-4 mb-6 no-print ${
                    embedInPage ? 'justify-end' : 'justify-between'
                }`}
            >
                {!embedInPage && (
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Compare Real Dealer Quotes</h2>
                )}
                <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                    <button
                        type="button"
                        onClick={applyLoadSaved}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-[#C9A84C] border border-[#C9A84C]/35 px-4 py-2 rounded-full hover:bg-[#C9A84C]/10 transition-colors"
                    >
                        <Upload size={14} />
                        Load saved OTD quotes
                    </button>
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-[#0D0D12] bg-[#C9A84C] px-4 py-2 rounded-full hover:scale-[1.02] transition-transform"
                    >
                        <Printer size={14} />
                        Print / PDF
                    </button>
                </div>
            </div>
            {!embedInPage && (
                <p className="text-sm text-[#FAF8F5]/50 leading-relaxed mb-6 no-print">
                    Enter dealer quotes to see which offer is truly lowest once tax, fees, and extras are accounted for.
                    One tax location applies to every offer column (same as the OTD checker). Start with {MIN_OFFERS}{' '}
                    offers; add up to {MAX_OFFERS}. We highlight the lowest quoted OTD and show variance vs a clean
                    estimate per column.
                </p>
            )}
            {embedInPage && (
                <p className="text-sm text-[#FAF8F5]/50 leading-relaxed mb-6 no-print">
                    One tax location applies to every offer column (same as the{' '}
                    <Link to="/resources/out-the-door-calculator" className="text-[#C9A84C] hover:underline font-medium">
                        OTD Price Checker
                    </Link>
                    ). Start with {MIN_OFFERS} offers; add up to {MAX_OFFERS}. Lowest quoted OTD is highlighted; each
                    column shows variance vs. a clean estimate.
                </p>
            )}

            <div className="section-card bg-[#14141B] rounded-2xl border border-[#2A2A35] p-5 md:p-6 mb-6 no-print w-full min-w-0">
                <h3 className="text-xs font-['JetBrains_Mono'] text-[#C9A84C]/80 uppercase tracking-widest mb-2">
                    Shared tax location
                </h3>
                <p className="text-xs text-[#FAF8F5]/45 mb-4 leading-relaxed">
                    Tax and registration estimates are location-based and can materially affect total cost.
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full min-w-0">
                    <div className="space-y-1 min-w-0">
                        <label className="text-xs text-[#FAF8F5]/50">State</label>
                        <select
                            value={shared.state}
                            onChange={(e) =>
                                setShared((s) => ({
                                    ...s,
                                    state: e.target.value,
                                    county: e.target.value === 'CA' ? s.county : '',
                                    city: e.target.value === 'CA' ? s.city : '',
                                }))
                            }
                            className={SHARED_TAX_SELECT_CLASS}
                        >
                            {STATES.map((st) => (
                                <option key={st.code} value={st.code}>
                                    {st.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1 min-w-0">
                        <label className="text-xs text-[#FAF8F5]/50">ZIP</label>
                        <input
                            value={shared.zipCode}
                            onChange={(e) => setShared((s) => ({ ...s, zipCode: e.target.value.replace(/\D/g, '').slice(0, 5) }))}
                            maxLength={5}
                            className={SHARED_TAX_INPUT_CLASS}
                            placeholder="90210"
                        />
                    </div>
                    {shared.state === 'CA' && (
                        <>
                            <div className="space-y-1 min-w-0">
                                <label className="text-xs text-[#FAF8F5]/50">County</label>
                                <select
                                    value={shared.county}
                                    onChange={(e) => setShared((s) => ({ ...s, county: e.target.value, city: '' }))}
                                    className={SHARED_TAX_SELECT_CLASS}
                                >
                                    <option value="">Select</option>
                                    {caCounties.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1 min-w-0">
                                <label className="text-xs text-[#FAF8F5]/50">City (optional)</label>
                                <select
                                    value={shared.city}
                                    onChange={(e) => setShared((s) => ({ ...s, city: e.target.value }))}
                                    className={SHARED_TAX_SELECT_CLASS}
                                >
                                    <option value="">County rate</option>
                                    {caCities.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}
                </div>
                {shared.state === 'CA' && shared.county && (
                    <p className="text-[11px] text-[#FAF8F5]/35 mt-3 font-['JetBrains_Mono']">
                        Using {calculatedCaTaxRate}% sales tax for estimates.
                    </p>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-6 no-print">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-[#2A2A35] bg-[#0D0D12]/80 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={excludeExtras}
                        onChange={(e) => setExcludeExtras(e.target.checked)}
                        className="rounded border-[#2A2A35] text-[#C9A84C] focus:ring-[#C9A84C] shrink-0"
                    />
                    <span className="text-xs text-[#FAF8F5]/70">
                        Exclude disclosed add-ons / market adjustment from quoted OTD (per column)
                    </span>
                </label>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={addOffer}
                        disabled={dealers.length >= MAX_OFFERS}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FAF8F5]/80 border border-[#2A2A35] px-3 py-2 rounded-xl hover:bg-[#2A2A35]/50 disabled:opacity-40 disabled:pointer-events-none"
                    >
                        <Plus size={14} /> Add offer
                    </button>
                    <button
                        type="button"
                        onClick={removeOffer}
                        disabled={dealers.length <= MIN_OFFERS}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FAF8F5]/80 border border-[#2A2A35] px-3 py-2 rounded-xl hover:bg-[#2A2A35]/50 disabled:opacity-40 disabled:pointer-events-none"
                    >
                        <Minus size={14} /> Remove last
                    </button>
                </div>
            </div>

            <div className="w-full min-w-0 mb-8 no-print">
                <div
                    className="grid w-full min-w-0 gap-4"
                    style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(17rem, 1fr))' }}
                >
                    {dealers.map((d, i) => {
                        const r = columnResults[i];
                        const isBest = i === bestIdx && bestIdx >= 0;
                        return (
                            <div
                                key={i}
                                className={`min-w-0 rounded-2xl border p-4 space-y-3 box-border ${
                                    isBest ? 'border-[#C9A84C]/50 bg-[#C9A84C]/[0.06]' : 'border-[#2A2A35] bg-[#14141B]'
                                }`}
                            >
                                <div className="min-w-0 space-y-2">
                                    <div className="flex flex-col gap-2 min-w-0">
                                        <input
                                            value={d.dealerName}
                                            onChange={(e) => updateDealer(i, { dealerName: e.target.value })}
                                            className="w-full min-w-0 max-w-full box-border bg-[#0D0D12] border border-[#2A2A35] rounded-lg px-2 py-1.5 text-sm font-semibold text-[#FAF8F5]"
                                            aria-label={`Offer ${i + 1} label`}
                                        />
                                        {isBest && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[#C9A84C] w-fit">
                                                <Trophy size={12} /> Best OTD
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <VehicleAutocomplete
                                    value={d.vehicleLabel}
                                    onChange={(v) => updateDealer(i, { vehicleLabel: v })}
                                    contextRecent={contextRecent}
                                    placeholder="Vehicle / trim"
                                    helperText=""
                                    className="w-full min-w-0 max-w-full box-border bg-[#0D0D12] border border-[#2A2A35] rounded-lg px-2 py-1.5 text-xs text-[#FAF8F5]/80"
                                />
                                <div className="space-y-1 min-w-0">
                                    <label className="text-[10px] text-[#FAF8F5]/40 uppercase tracking-wider">Sale price</label>
                                    <input
                                        type="number"
                                        value={d.salePrice}
                                        onChange={(e) => updateDealer(i, { salePrice: e.target.value })}
                                        className="w-full min-w-0 max-w-full box-border bg-[#0D0D12] border border-[#2A2A35] rounded-lg px-2 py-1.5 text-sm font-['JetBrains_Mono'] text-[#FAF8F5]"
                                    />
                                </div>
                                <div className="space-y-1 min-w-0">
                                    <label className="text-[10px] text-[#FAF8F5]/40 uppercase tracking-wider">Quoted OTD</label>
                                    <input
                                        type="number"
                                        value={d.quotedOtd}
                                        onChange={(e) => updateDealer(i, { quotedOtd: e.target.value })}
                                        className="w-full min-w-0 max-w-full box-border bg-[#C9A84C]/5 border border-[#C9A84C]/25 rounded-lg px-2 py-1.5 text-sm font-['JetBrains_Mono'] text-[#C9A84C]"
                                    />
                                </div>
                                <details className="text-xs min-w-0">
                                    <summary className="cursor-pointer text-[#FAF8F5]/40 hover:text-[#FAF8F5]/60">
                                        Overrides
                                    </summary>
                                    <div className="pt-2 space-y-2 min-w-0">
                                        <input
                                            type="number"
                                            placeholder="Doc fee"
                                            value={d.docFee}
                                            onChange={(e) => updateDealer(i, { docFee: e.target.value })}
                                            className="w-full min-w-0 max-w-full box-border bg-[#0D0D12] border border-[#2A2A35] rounded-lg px-2 py-1 font-['JetBrains_Mono'] text-[#FAF8F5]"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Reg estimate"
                                            value={d.regEstimate}
                                            onChange={(e) => updateDealer(i, { regEstimate: e.target.value })}
                                            className="w-full min-w-0 max-w-full box-border bg-[#0D0D12] border border-[#2A2A35] rounded-lg px-2 py-1 font-['JetBrains_Mono'] text-[#FAF8F5]"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Tax % override"
                                            value={d.taxRateOverride}
                                            onChange={(e) => updateDealer(i, { taxRateOverride: e.target.value })}
                                            className="w-full min-w-0 max-w-full box-border bg-[#0D0D12] border border-[#2A2A35] rounded-lg px-2 py-1 font-['JetBrains_Mono'] text-[#FAF8F5]"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Add-ons $"
                                            value={d.addons}
                                            onChange={(e) => updateDealer(i, { addons: e.target.value })}
                                            className="w-full min-w-0 max-w-full box-border bg-[#0D0D12] border border-[#2A2A35] rounded-lg px-2 py-1 font-['JetBrains_Mono'] text-[#FAF8F5]"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Market adj. $"
                                            value={d.marketAdjustment}
                                            onChange={(e) => updateDealer(i, { marketAdjustment: e.target.value })}
                                            className="w-full min-w-0 max-w-full box-border bg-[#0D0D12] border border-[#2A2A35] rounded-lg px-2 py-1 font-['JetBrains_Mono'] text-[#FAF8F5]"
                                        />
                                    </div>
                                </details>
                                {r.valid ? (
                                    <div className="pt-2 border-t border-[#2A2A35] space-y-1 text-xs font-['JetBrains_Mono'] min-w-0">
                                        <div className="flex justify-between gap-2 text-[#FAF8F5]/50">
                                            <span className="shrink-0">Clean est.</span>
                                            <span className="truncate text-right">{formatCurrency(r.cleanOtd)}</span>
                                        </div>
                                        <div className="flex justify-between gap-2">
                                            <span className="text-[#FAF8F5]/50 shrink-0">Variance</span>
                                            <span
                                                className={`truncate text-right ${
                                                    Math.abs(r.diff) <= 500
                                                        ? 'text-green-400'
                                                        : Math.abs(r.diff) <= 1500
                                                          ? 'text-amber-400'
                                                          : r.diff > 0
                                                            ? 'text-red-400'
                                                            : 'text-blue-400'
                                                }`}
                                            >
                                                {r.diff > 0 ? '+' : ''}
                                                {formatCurrency(r.diff)}
                                            </span>
                                        </div>
                                        <div className="text-[10px] text-[#FAF8F5]/35">{r.statusTitle}</div>
                                    </div>
                                ) : (
                                    <p className="text-[11px] text-[#FAF8F5]/30 pt-2">Enter sale price and quoted OTD</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Print-only summary table */}
            <div className="hidden print:block print-table-section w-full min-w-0 mb-6">
                <table className="comparison-table w-full text-sm border-collapse table-fixed">
                    <thead>
                        <tr>
                            <th className="text-left px-3 py-2 border border-[#ccc] bg-[#f5f5f5] w-[22%]">Line item</th>
                            {dealers.map((d, i) => (
                                <th
                                    key={`h-${i}`}
                                    className="px-2 py-2 border border-[#ccc] bg-[#f5f5f5] text-center text-[11px] align-bottom"
                                >
                                    {d.dealerName}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {['Vehicle / trim', 'Sale price', 'Quoted OTD', 'Clean estimate', 'Variance', 'Status'].map((label) => (
                            <tr key={label}>
                                <td className="px-3 py-2 border border-[#e0e0e0] font-['JetBrains_Mono'] text-xs">{label}</td>
                                {dealers.map((d, ci) => {
                                    const r = columnResults[ci];
                                    let cell = '—';
                                    if (label === 'Vehicle / trim') cell = d.vehicleLabel || '—';
                                    if (label === 'Sale price') cell = d.salePrice ? formatCurrency(Number(d.salePrice)) : '—';
                                    if (label === 'Quoted OTD') cell = d.quotedOtd ? formatCurrency(Number(d.quotedOtd)) : '—';
                                    if (label === 'Clean estimate') cell = r.valid ? formatCurrency(r.cleanOtd) : '—';
                                    if (label === 'Variance')
                                        cell = r.valid ? `${r.diff > 0 ? '+' : ''}${formatCurrency(r.diff)}` : '—';
                                    if (label === 'Status') cell = r.valid ? r.statusTitle : '—';
                                    return (
                                        <td key={`c-${ci}-${label}`} className="px-2 py-2 border border-[#e0e0e0] text-center text-[11px] break-words">
                                            {cell}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <p className="text-[10px] text-[#666] mt-2 font-['JetBrains_Mono']">
                    Tax location: {shared.state}
                    {shared.zipCode ? ` · ZIP ${shared.zipCode}` : ''}
                    {shared.state === 'CA' && shared.county ? ` · ${shared.county}` : ''}
                </p>
            </div>

            <div className="no-print space-y-4 mb-6">
                <ExpertReviewUpsellCard variant="dark" prefill={bestPrefill} />
                {bestPrefill && (
                    <p className="text-xs text-[#FAF8F5]/40">
                        Submit the highlighted &quot;Best OTD&quot; column with one click above, or{' '}
                        <Link to="/resources/out-the-door-calculator" className="text-[#C9A84C] hover:underline">
                            drill into a single quote
                        </Link>{' '}
                        in the OTD checker.
                    </p>
                )}
            </div>
        </section>
    );
}
