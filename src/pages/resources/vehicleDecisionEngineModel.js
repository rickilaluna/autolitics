/* Shared evaluation model for Vehicle Decision Engine and print view */

export const CATEGORY_KEYS = ['driving', 'interior', 'technology', 'practicality', 'efficiency', 'reliability', 'design', 'cost'];

export const WEIGHT_MULTIPLIERS = { 5: 1.30, 4: 1.15, 3: 1.00, 2: 0.85, 1: 0.70 };
export const MAX_WEIGHT = 1.30;

export const CATEGORIES = [
    { id: 'driving', label: 'Driving Experience' },
    { id: 'interior', label: 'Interior Quality' },
    { id: 'technology', label: 'Technology' },
    { id: 'practicality', label: 'Practicality' },
    { id: 'efficiency', label: 'Efficiency' },
    { id: 'reliability', label: 'Reliability' },
    { id: 'design', label: 'Design' },
    { id: 'cost', label: 'Ownership Cost' },
];

export function averageScore(scores) {
    const vals = Object.values(scores).filter(v => v != null && v >= 1 && v <= 5);
    if (vals.length === 0) return 0;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function weightedScore(scores, weights) {
    let sumW = 0;
    let sumSW = 0;
    CATEGORY_KEYS.forEach(k => {
        const s = scores[k];
        const w = WEIGHT_MULTIPLIERS[weights[k]] ?? 1;
        if (s != null && s >= 1 && s <= 5) {
            sumSW += s * w;
            sumW += w;
        }
    });
    return sumW === 0 ? 0 : sumSW / sumW;
}

export function isComplete(vehicle) {
    return vehicle.name.trim() && CATEGORY_KEYS.every(k => vehicle.scores[k] != null && vehicle.scores[k] >= 1 && vehicle.scores[k] <= 5);
}

/** Minimum average (or weighted) score required to show a recommendation (1–5 scale). */
export const MIN_RECOMMENDATION_SCORE = 2.5;

/** Minimum number of completed vehicles required to show a recommendation. */
export const MIN_VEHICLES_FOR_RECOMMENDATION = 2;

export function getWinnerIndex(vehicles, useWeighted, weights) {
    const completed = vehicles.filter(isComplete);
    if (completed.length === 0) return -1;
    let best = 0;
    const scoreFn = useWeighted ? v => weightedScore(v.scores, weights) : v => averageScore(v.scores);
    let bestVal = scoreFn(completed[0]);
    for (let i = 1; i < completed.length; i++) {
        const val = scoreFn(completed[i]);
        if (val > bestVal) {
            bestVal = val;
            best = i;
        }
    }
    return vehicles.indexOf(completed[best]);
}

/** True if we should show a winner card (≥2 completed and best score > threshold). */
export function hasQualifiedWinner(vehicles, useWeighted, weights) {
    const completed = vehicles.filter(isComplete);
    if (completed.length < MIN_VEHICLES_FOR_RECOMMENDATION) return false;
    const idx = getWinnerIndex(vehicles, useWeighted, weights);
    if (idx < 0) return false;
    const scoreFn = useWeighted ? v => weightedScore(v.scores, weights) : v => averageScore(v.scores);
    return scoreFn(vehicles[idx]) > MIN_RECOMMENDATION_SCORE;
}

export function getCategoryLeaders(vehicles) {
    const completed = vehicles.filter(isComplete);
    if (completed.length === 0) return {};
    const leaders = {};
    CATEGORY_KEYS.forEach(catId => {
        let bestVehicle = null;
        let bestScore = 0;
        completed.forEach(v => {
            const s = v.scores[catId];
            if (s != null && s >= 1 && s <= 5 && s > bestScore) {
                bestScore = s;
                bestVehicle = v;
            }
        });
        if (bestVehicle) leaders[catId] = bestVehicle.name.trim() || '—';
    });
    return leaders;
}
