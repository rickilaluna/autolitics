/**
 * Cross-tool vehicle context: local persistence + "considering" strings for type-ahead.
 */

import { OTD_SAVED_QUOTES_KEY } from './otdCalculatorCore';
import { normalizeScorecardBundle, getActiveEntry } from './scorecardBundle';

export const DECISION_ENGINE_STORAGE_KEY = 'autolitics_vehicle_decision_engine_v1';
export const OFFER_COMPARISON_STORAGE_KEY = 'autolitics_offer_comparison_worksheet_v1';
export const SCORECARD_STORAGE_KEY = 'autolitics_vehicle_scorecard_v1';
export const CONSIDERING_MODELS_KEY = 'autolitics_considering_models_v1';
const MAX_CONSIDERING = 24;

function safeParse(json, fallback) {
    try {
        return json ? JSON.parse(json) : fallback;
    } catch {
        return fallback;
    }
}

export function loadDecisionEngineSnapshot() {
    return safeParse(localStorage.getItem(DECISION_ENGINE_STORAGE_KEY), null);
}

export function saveDecisionEngineSnapshot(payload) {
    try {
        localStorage.setItem(DECISION_ENGINE_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
        console.warn('vehicleContextStorage: could not save decision engine', e);
    }
}

export function loadOfferComparisonSnapshot() {
    return safeParse(localStorage.getItem(OFFER_COMPARISON_STORAGE_KEY), null);
}

export function saveOfferComparisonSnapshot(payload) {
    try {
        localStorage.setItem(OFFER_COMPARISON_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
        console.warn('vehicleContextStorage: could not save offer comparison', e);
    }
}

/** Full multi-entry bundle (schema v2) or legacy object (normalized on read). */
export function loadScorecardBundle() {
    const raw = safeParse(localStorage.getItem(SCORECARD_STORAGE_KEY), null);
    return normalizeScorecardBundle(raw);
}

export function saveScorecardBundle(bundle) {
    try {
        localStorage.setItem(SCORECARD_STORAGE_KEY, JSON.stringify(bundle));
    } catch (e) {
        console.warn('vehicleContextStorage: could not save scorecard bundle', e);
    }
}

/** @deprecated Prefer loadScorecardBundle; returns active entry only (for legacy callers). */
export function loadScorecardSnapshot() {
    const b = loadScorecardBundle();
    const e = getActiveEntry(b);
    return e || null;
}

function loadConsideringRing() {
    const arr = safeParse(localStorage.getItem(CONSIDERING_MODELS_KEY), []);
    return Array.isArray(arr) ? arr.filter((s) => typeof s === 'string') : [];
}

export function recordConsideringModel(label) {
    const t = (label || '').trim();
    if (t.length < 2) return;
    let next = loadConsideringRing().filter((s) => s.toLowerCase() !== t.toLowerCase());
    next.unshift(t);
    next = next.slice(0, MAX_CONSIDERING);
    try {
        localStorage.setItem(CONSIDERING_MODELS_KEY, JSON.stringify(next));
    } catch (e) {
        console.warn('vehicleContextStorage: could not save considering models', e);
    }
}

/**
 * Merged unique labels from Decision Engine, Offer Comparison, OTD saved quotes, and explicit ring buffer.
 */
export function getConsideringModelStrings() {
    const set = new Set();
    const push = (s) => {
        const t = (s || '').trim();
        if (t.length > 1) set.add(t);
    };

    const de = loadDecisionEngineSnapshot();
    (de?.vehicles || []).forEach((v) => push(v?.name));

    const oc = loadOfferComparisonSnapshot();
    (oc?.dealers || []).forEach((d) => push(d?.vehicleLabel));

    const bundle = loadScorecardBundle();
    (bundle.entries || []).forEach((entry) => {
        push(entry?.vehicleModel);
        push([entry?.vehicleModel, entry?.trim].filter(Boolean).join(' ').trim());
        (entry?.comparedVehicles || []).forEach(push);
    });

    const quotes = safeParse(localStorage.getItem(OTD_SAVED_QUOTES_KEY), []);
    (Array.isArray(quotes) ? quotes : []).forEach((sq) => {
        push(sq?.vehicleLabel);
        push(sq?.formData?.vehicleLabel);
    });

    loadConsideringRing().forEach(push);

    return [...set];
}

/**
 * Aggregates all meaningful local storage tool artifacts to power the Dashboard's "Saved Workspace"
 * and Journey completion logic, proving retention of self-serve data.
 */
export function getWorkspaceActivity() {
    const activity = {
        otdQuotes: [],
        decisionEngineWinner: null,
        decisionEngineCount: 0,
        hasScorecard: false,
        scorecardCount: 0,
        recentScorecardTitle: null,
        offerComparisonCount: 0,
        recentOfferDealer: null,
        hasOfferComparison: false,
    };

    // 1. OTD Quotes
    try {
        const quotes = safeParse(localStorage.getItem(OTD_SAVED_QUOTES_KEY), []);
        if (Array.isArray(quotes) && quotes.length > 0) {
            // Sort by date descending if they have an ID or just take the end
            const sorted = [...quotes].sort((a, b) => (b.id || 0) - (a.id || 0));
            activity.otdQuotes = sorted.slice(0, 3);
        }
    } catch (e) { console.warn(e); }

    // 2. Decision Engine
    try {
        const de = loadDecisionEngineSnapshot();
        if (de && Array.isArray(de.vehicles)) {
            // Count vehicles where at least one score is filled
            const activeVehicles = de.vehicles.filter(v => 
                v.name && v.scores && Object.values(v.scores).some(s => s !== null && s > 0)
            );
            activity.decisionEngineCount = activeVehicles.length;

            if (activeVehicles.length >= 2) {
                // Determine a simple average winner for display context
                let best = null;
                let maxAvg = 0;
                activeVehicles.forEach(v => {
                    const vals = Object.values(v.scores).filter(s => typeof s === 'number');
                    const avg = vals.length > 0 ? vals.reduce((a,b)=>a+b, 0) / vals.length : 0;
                    if (avg > maxAvg) {
                        maxAvg = avg;
                        best = v.name;
                    }
                });
                activity.decisionEngineWinner = best;
            }
        }
    } catch (e) { console.warn(e); }

    // 3. Scorecard
    try {
        const sb = loadScorecardBundle();
        if (sb && Array.isArray(sb.entries)) {
            const validEntries = sb.entries.filter(e => e.vehicleModel || (e.exteriorRating > 0));
            activity.scorecardCount = validEntries.length;
            if (validEntries.length > 0) {
                activity.hasScorecard = true;
                activity.recentScorecardTitle = validEntries[0].vehicleModel || 'Test Drive Snapshot';
            }
        }
    } catch (e) { console.warn(e); }

    // 4. Offer Comparison Worksheet
    try {
        const oc = loadOfferComparisonSnapshot();
        if (oc && Array.isArray(oc.dealers)) {
            const activeDealers = oc.dealers.filter(d => d.dealerName || d.quotedOtd || d.vehicleLabel);
            activity.offerComparisonCount = activeDealers.length;
            if (activeDealers.length > 0) {
                activity.hasOfferComparison = true;
                activity.recentOfferDealer = 
                    activeDealers[0].dealerName || 
                    activeDealers[0].vehicleLabel || 
                    'Offer Draft';
            }
        }
    } catch (e) { console.warn(e); }

    return activity;
}
