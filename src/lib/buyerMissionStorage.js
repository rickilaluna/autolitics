export const BUYER_MISSION_STORAGE_KEY = 'autolitics_buyer_mission_v1';

export function readBuyerMission() {
    try {
        const raw = localStorage.getItem(BUYER_MISSION_STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

export function writeBuyerMission(payload) {
    try {
        localStorage.setItem(BUYER_MISSION_STORAGE_KEY, JSON.stringify(payload));
    } catch {
        /* local storage can be unavailable; database-backed fields still save */
    }
}

export function asArray(value) {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === 'string' && value.trim()) {
        return value.split(',').map((item) => item.trim()).filter(Boolean);
    }
    return [];
}
