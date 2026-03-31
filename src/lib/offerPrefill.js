export const OFFER_PREFILL_KEY = 'autolitics_offer_review_prefill';

/**
 * @param {object} payload — dealership_name, vehicle_name, out_the_door_price, client_notes, quote_breakdown, etc.
 */
export function setOfferReviewPrefill(payload) {
    try {
        sessionStorage.setItem(
            OFFER_PREFILL_KEY,
            JSON.stringify({ ...payload, savedAt: new Date().toISOString() })
        );
    } catch (e) {
        console.warn('offerPrefill: could not write sessionStorage', e);
    }
}

export function consumeOfferReviewPrefill() {
    try {
        const raw = sessionStorage.getItem(OFFER_PREFILL_KEY);
        if (!raw) return null;
        sessionStorage.removeItem(OFFER_PREFILL_KEY);
        return JSON.parse(raw);
    } catch (e) {
        console.warn('offerPrefill: could not read sessionStorage', e);
        return null;
    }
}

export function peekOfferReviewPrefill() {
    try {
        const raw = sessionStorage.getItem(OFFER_PREFILL_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}
