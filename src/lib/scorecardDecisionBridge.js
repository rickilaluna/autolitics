/**
 * Maps granular VES row scores → Vehicle Decision Engine 8 categories (1–5).
 * VES uses ~30 criteria; Decision Engine uses 8 higher-level categories — aggregation, not 1:1 labels.
 */

import { CATEGORY_KEYS } from '../pages/resources/vehicleDecisionEngineModel';
import { loadDecisionEngineSnapshot, saveDecisionEngineSnapshot } from './vehicleContextStorage';
import { newEntryId } from './scorecardBundle';

/** @param {Record<string, number | null | undefined>} scores — VES row id → 1–5 */
export function scorecardRowsToDecisionEngineScores(scores) {
    const avg = (ids) => {
        const vals = ids.map((id) => scores[id]).filter((n) => Number.isFinite(n) && n >= 1 && n <= 5);
        if (!vals.length) return null;
        return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
    };

    return {
        driving: avg(['driving_dynamics', 'ride_comfort', 'noise_nvh', 'visibility']),
        interior: avg(['seat_comfort', 'materials', 'cabin_ambience', 'controls_layout', 'roominess']),
        technology: avg(['infotainment', 'software_ui', 'adas', 'phone_integration', 'cluster']),
        practicality: avg(['cargo', 'rear_comfort', 'child_seat', 'storage', 'entry_exit']),
        efficiency: avg(['efficiency', 'charging']),
        reliability: avg(['maintenance', 'warranty']),
        design: avg(['exterior', 'interior_design', 'quality_feel', 'cool_factor', 'ownership_excitement']),
        /** VES has no explicit “ownership cost” row; rough blend for the DE cost axis */
        cost: avg(['efficiency', 'warranty', 'maintenance']),
    };
}

export function defaultDecisionScores() {
    return Object.fromEntries(CATEGORY_KEYS.map((k) => [k, null]));
}

function defaultWeights() {
    return Object.fromEntries(CATEGORY_KEYS.map((k) => [k, 3]));
}

/**
 * Merges mapped category scores into Vehicle Comparison Matrix / Decision Engine storage
 * for the current vehicle label (creates or updates a row by name).
 */
export function applyScorecardEntryToDecisionEngine(entry) {
    const mapped = scorecardRowsToDecisionEngineScores(entry.scores || {});
    const name = [entry.vehicleModel, entry.trim].filter(Boolean).join(' ').trim() || 'From scorecard';
    const de = loadDecisionEngineSnapshot();
    const vehicles = Array.isArray(de?.vehicles) ? [...de.vehicles] : [];
    const weights = de?.weights && typeof de.weights === 'object' ? { ...defaultWeights(), ...de.weights } : defaultWeights();
    const useWeighted = !!de?.useWeighted;
    const idx = vehicles.findIndex((v) => (v.name || '').trim().toLowerCase() === name.toLowerCase());

    const applyMapped = (prevScores) => {
        const base = { ...defaultDecisionScores(), ...(prevScores && typeof prevScores === 'object' ? prevScores : {}) };
        CATEGORY_KEYS.forEach((k) => {
            const v = mapped[k];
            if (v != null && v >= 1 && v <= 5) base[k] = Math.round(v * 2) / 2;
        });
        return base;
    };

    if (idx >= 0) {
        vehicles[idx] = {
            ...vehicles[idx],
            scores: applyMapped(vehicles[idx].scores),
        };
    } else {
        vehicles.push({ id: newEntryId(), name, scores: applyMapped({}) });
    }
    saveDecisionEngineSnapshot({ vehicles, weights, useWeighted, savedAt: Date.now() });
}
