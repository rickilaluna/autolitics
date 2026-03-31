/**
 * Cross-tool vehicle context: local persistence + "considering" strings for type-ahead.
 */

import { OTD_SAVED_QUOTES_KEY } from './otdCalculatorCore';

export const DECISION_ENGINE_STORAGE_KEY = 'autolitics_vehicle_decision_engine_v1';
export const OFFER_COMPARISON_STORAGE_KEY = 'autolitics_offer_comparison_worksheet_v1';
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

    const quotes = safeParse(localStorage.getItem(OTD_SAVED_QUOTES_KEY), []);
    (Array.isArray(quotes) ? quotes : []).forEach((sq) => {
        push(sq?.vehicleLabel);
        push(sq?.formData?.vehicleLabel);
    });

    loadConsideringRing().forEach(push);

    return [...set];
}
