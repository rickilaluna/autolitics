/**
 * Lightweight logger for vehicle names entered manually that did not match
 * the autocomplete list. Use to expand the curated dataset based on real usage.
 *
 * In development, read via: getUnmatchedVehicles() or window.__AUTOLITICS_UNMATCHED_VEHICLES
 * Future: send to API or analytics.
 */

const _log = [];

export function logUnmatched(vehicleName) {
    const name = (vehicleName || '').trim();
    if (!name) return;
    _log.push({ name, at: new Date().toISOString() });
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        window.__AUTOLITICS_UNMATCHED_VEHICLES = window.__AUTOLITICS_UNMATCHED_VEHICLES || [];
        window.__AUTOLITICS_UNMATCHED_VEHICLES.push(name);
    }
}

export function getUnmatchedVehicles() {
    return [..._log];
}

export function clearUnmatchedLog() {
    _log.length = 0;
}
