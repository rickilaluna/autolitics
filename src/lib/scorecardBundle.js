/**
 * Multi-entry Vehicle Evaluation Scorecard storage (local + Supabase JSON payload).
 * schemaVersion 2: { schemaVersion, activeEntryId, entries[] }
 * Legacy: flat single-vehicle form (treated as one entry on load).
 */

export const SCORECARD_SCHEMA_VERSION = 2;

/** @returns {string} */
export function newEntryId() {
    return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function emptyFormFields() {
    return {
        vehicleModel: '',
        trim: '',
        dateTested: new Date().toISOString().slice(0, 10),
        msrp: '',
        dealer: '',
        quotedPrice: '',
        salesperson: '',
        vinStock: '',
        scores: {},
        notes: {},
        overallScore: null,
        shortlist: '',
        strengths: '',
        weaknesses: '',
        questions: '',
        comparedVehicles: ['', '', '', ''],
    };
}

/** One saved evaluation (all form fields + id + savedAt). */
export function createEmptyEntry() {
    const id = newEntryId();
    return { id, savedAt: Date.now(), ...emptyFormFields() };
}

export function emptyBundle() {
    const e = createEmptyEntry();
    return {
        schemaVersion: SCORECARD_SCHEMA_VERSION,
        activeEntryId: e.id,
        entries: [e],
    };
}

/**
 * @param {unknown} raw — legacy flat object or v2 bundle
 * @returns {{ schemaVersion: number, activeEntryId: string, entries: object[] }}
 */
export function normalizeScorecardBundle(raw) {
    if (!raw || typeof raw !== 'object') {
        return emptyBundle();
    }
    if (raw.schemaVersion === SCORECARD_SCHEMA_VERSION && Array.isArray(raw.entries) && raw.entries.length > 0) {
        const activeEntryId = raw.activeEntryId && raw.entries.some((e) => e?.id === raw.activeEntryId)
            ? raw.activeEntryId
            : raw.entries[0].id;
        return {
            schemaVersion: SCORECARD_SCHEMA_VERSION,
            activeEntryId,
            entries: raw.entries.map((e) => ({ ...emptyFormFields(), ...e, id: e.id || newEntryId() })),
        };
    }
    // Legacy: entire object is one vehicle form (may include savedAt at top)
    const { savedAt: _drop, ...rest } = raw;
    const id = newEntryId();
    const savedAt = typeof raw.savedAt === 'number' ? raw.savedAt : Date.now();
    const entry = {
        id,
        savedAt,
        ...emptyFormFields(),
        ...rest,
    };
    delete entry.schemaVersion;
    delete entry.activeEntryId;
    delete entry.entries;
    return {
        schemaVersion: SCORECARD_SCHEMA_VERSION,
        activeEntryId: id,
        entries: [entry],
    };
}

/**
 * @param {{ schemaVersion: number, activeEntryId: string, entries: object[] }} bundle
 * @returns {object | null}
 */
export function getActiveEntry(bundle) {
    if (!bundle?.entries?.length) return null;
    const e = bundle.entries.find((x) => x.id === bundle.activeEntryId);
    return e || bundle.entries[0];
}

/**
 * @param {{ schemaVersion: number, activeEntryId: string, entries: object[] }} bundle
 * @param {string} entryId
 * @param {object} entryData — full entry fields (id will be forced)
 */
export function upsertEntry(bundle, entryId, entryData) {
    const next = bundle.entries.map((e) =>
        e.id === entryId ? { ...e, ...entryData, id: entryId, savedAt: Date.now() } : e
    );
    if (!next.some((e) => e.id === entryId)) {
        next.push({ ...entryData, id: entryId, savedAt: Date.now() });
    }
    return { ...bundle, entries: next };
}

export function setActiveEntry(bundle, entryId) {
    if (!bundle.entries.some((e) => e.id === entryId)) return bundle;
    return { ...bundle, activeEntryId: entryId };
}

/** Remove entry; if active removed, pick another. */
export function removeEntry(bundle, entryId) {
    const entries = bundle.entries.filter((e) => e.id !== entryId);
    if (entries.length === 0) return emptyBundle();
    let activeEntryId = bundle.activeEntryId;
    if (activeEntryId === entryId) {
        activeEntryId = entries[0].id;
    }
    return { schemaVersion: SCORECARD_SCHEMA_VERSION, activeEntryId, entries };
}

/** Payload for Supabase: bundle without redundant top-level savedAt */
export function bundleToRemotePayload(bundle) {
    const { schemaVersion, activeEntryId, entries } = bundle;
    return { schemaVersion, activeEntryId, entries };
}
