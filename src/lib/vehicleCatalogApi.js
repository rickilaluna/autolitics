/**
 * Single module for browser-side vehicle catalog access (Supabase).
 * Use this everywhere the app loads `vehicle_models`, `v_vehicle_config_profile`, or resolves free-text → model.
 *
 * @see docs/vehicle_data_model_roadmap.md
 * @see docs/manus_vehicle_data_playbook.md
 */

const PAGE = 1000;

/**
 * Coerce profile/workspace pill values (string or legacy object) to a lookup string.
 * @param {unknown} input
 * @returns {string}
 */
export function vehicleNameForLookup(input) {
    if (input == null) return '';
    if (typeof input === 'string') return input.trim();
    if (typeof input === 'object') {
        const o = /** @type {Record<string, unknown>} */ (input);
        const parts = [o.year, o.make, o.model].filter(Boolean);
        if (parts.length) return parts.map(String).join(' ').trim();
        if (o.label != null) return String(o.label).trim();
        if (o.name != null) return String(o.name).trim();
    }
    return String(input).trim();
}

/**
 * All rows from v_vehicle_config_profile (paginated; PostgREST default max ~1000/request).
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @returns {Promise<object[]>}
 */
export async function fetchAllVehicleConfigProfiles(supabase) {
    const all = [];
    let from = 0;
    for (;;) {
        const { data, error } = await supabase
            .from('v_vehicle_config_profile')
            .select('*')
            .order('make', { ascending: true })
            .order('model', { ascending: true })
            .order('model_year', { ascending: false })
            .range(from, from + PAGE - 1);
        if (error) throw error;
        if (!data?.length) break;
        all.push(...data);
        if (data.length < PAGE) break;
        from += PAGE;
    }
    return all;
}

/**
 * All rows from vehicle_models (paginated).
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} [selectCols]
 */
export async function fetchAllVehicleModels(supabase, selectCols = '*') {
    const all = [];
    let from = 0;
    for (;;) {
        const { data, error } = await supabase
            .from('vehicle_models')
            .select(selectCols)
            .order('make', { ascending: true })
            .order('model', { ascending: true })
            .range(from, from + PAGE - 1);
        if (error) throw error;
        if (!data?.length) break;
        all.push(...data);
        if (data.length < PAGE) break;
        from += PAGE;
    }
    return all;
}

/**
 * Match free-text vehicle name to a model + configs + MSRP + powertrains (dashboard preview).
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} vehicleName
 * @returns {Promise<null | {
 *   model: object,
 *   configs: object[],
 *   targetYear: number | null | undefined,
 *   msrpSpecs: object[],
 *   powertrains: object[]
 * }>}
 */
export async function lookupVehicleModelFromFreeText(supabase, vehicleName) {
    const cleaned = vehicleNameForLookup(vehicleName);
    if (!cleaned) return null;
    const yearMatch = cleaned.match(/^(20\d{2})\s+/);
    const hintYear = yearMatch ? parseInt(yearMatch[1], 10) : null;
    const nameWithoutYear = yearMatch ? cleaned.slice(yearMatch[0].length) : cleaned;

    const tokens = nameWithoutYear.split(/\s+/).filter(Boolean);
    const lowerName = nameWithoutYear.toLowerCase();

    const selectCols =
        'id, make, model, segment, vehicle_summary, default_image_url, powertrain_summary, default_trim_guidance';
    let models = [];
    if (tokens.length >= 2) {
        const makePart = tokens[0];
        const modelTokens = tokens.slice(1);
        // Progressively drop trailing tokens so powertrain/trim suffixes don't block a match
        for (let len = modelTokens.length; len >= 1 && models.length === 0; len--) {
            const modelPart = modelTokens.slice(0, len).join(' ');
            const { data } = await supabase
                .from('vehicle_models')
                .select(selectCols)
                .ilike('make', makePart)
                .ilike('model', `%${modelPart}%`)
                .limit(10);
            models = data || [];
        }
    }

    if (models.length === 0) {
        const { data } = await supabase
            .from('vehicle_models')
            .select(selectCols)
            .or(`model.ilike.%${nameWithoutYear}%,make.ilike.%${nameWithoutYear}%`)
            .limit(10);
        models = data || [];
    }

    if (!models.length) return null;

    const best =
        models.find((m) => lowerName === `${m.make} ${m.model}`.toLowerCase()) ||
        models.find((m) => lowerName.includes(`${m.make} ${m.model}`.toLowerCase())) ||
        models.find((m) => lowerName.includes(m.model.toLowerCase())) ||
        models[0];

    const { data: configs } = await supabase
        .from('vehicle_configs')
        .select('id, model_year, config_label, powertrain_category, drivetrain')
        .eq('vehicle_model_id', best.id)
        .order('model_year', { ascending: false });

    const relevantConfigs = configs || [];
    const targetYear = hintYear || relevantConfigs[0]?.model_year;

    const configIds = relevantConfigs.map((c) => c.id);
    let msrpSpecs = [];
    if (configIds.length > 0) {
        const { data } = await supabase
            .from('msrp_specs')
            .select('vehicle_config_id, base_msrp, top_trim_msrp, trim_levels_json')
            .in('vehicle_config_id', configIds);
        msrpSpecs = data || [];
    }

    const { data: powertrains } = await supabase
        .from('powertrain_specs')
        .select(
            'name, engine_description, horsepower_hp, combined_mpg, ev_range_miles, transmission'
        )
        .eq('vehicle_model_id', best.id);

    return {
        model: best,
        configs: relevantConfigs,
        targetYear,
        msrpSpecs,
        powertrains: powertrains || [],
    };
}

/**
 * Full vehicle profile lookup via the v_vehicle_config_profile view.
 * Returns the richest available data (safety, reliability, dimensions, evaluations,
 * expert ratings, market data) in a single query — used by VehiclePreviewModal.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} vehicleName
 * @returns {Promise<null | {
 *   model: object,
 *   profile: object | null,
 *   allProfiles: object[],
 *   targetYear: number | null,
 *   powertrains: object[]
 * }>}
 */
export async function lookupVehicleFullProfile(supabase, vehicleName) {
    const cleaned = vehicleNameForLookup(vehicleName);
    if (!cleaned) return null;
    const yearMatch = cleaned.match(/^(20\d{2})\s+/);
    const hintYear = yearMatch ? parseInt(yearMatch[1], 10) : null;
    const nameWithoutYear = yearMatch ? cleaned.slice(yearMatch[0].length) : cleaned;

    const tokens = nameWithoutYear.split(/\s+/).filter(Boolean);
    const lowerName = nameWithoutYear.toLowerCase();

    // Step 1: resolve make + model from vehicle_models (lightweight).
    // Progressively drop trailing tokens (e.g. "Telluride Hybrid" → "Telluride")
    // so powertrain/trim suffixes don't prevent a match.
    let models = [];
    if (tokens.length >= 2) {
        const makePart = tokens[0];
        const modelTokens = tokens.slice(1);
        for (let len = modelTokens.length; len >= 1 && models.length === 0; len--) {
            const modelPart = modelTokens.slice(0, len).join(' ');
            const { data } = await supabase
                .from('vehicle_models')
                .select('id, make, model')
                .ilike('make', makePart)
                .ilike('model', `%${modelPart}%`)
                .limit(10);
            models = data || [];
        }
    }

    if (models.length === 0) {
        const { data } = await supabase
            .from('vehicle_models')
            .select('id, make, model')
            .or(`model.ilike.%${nameWithoutYear}%,make.ilike.%${nameWithoutYear}%`)
            .limit(10);
        models = data || [];
    }

    if (!models.length) return null;

    const best =
        models.find((m) => lowerName === `${m.make} ${m.model}`.toLowerCase()) ||
        models.find((m) => lowerName.includes(`${m.make} ${m.model}`.toLowerCase())) ||
        models.find((m) => lowerName.includes(m.model.toLowerCase())) ||
        models[0];

    // Step 2: pull full profiles from the view for this make + model
    const { data: profiles, error } = await supabase
        .from('v_vehicle_config_profile')
        .select('*')
        .eq('vehicle_model_id', best.id)
        .order('model_year', { ascending: false });

    if (error) throw error;
    const allProfiles = profiles || [];

    // Step 3: pick the target year config
    const targetYear = hintYear || allProfiles[0]?.model_year || null;
    const profile = allProfiles.find((p) => p.model_year === targetYear) || allProfiles[0] || null;

    // Step 4: powertrains (separate table, not in the view)
    const { data: powertrains } = await supabase
        .from('powertrain_specs')
        .select(
            'name, engine_description, horsepower_hp, combined_mpg, ev_range_miles, transmission'
        )
        .eq('vehicle_model_id', best.id);

    return {
        model: profile
            ? {
                  id: best.id,
                  make: profile.make,
                  model: profile.model,
                  segment: profile.segment,
                  vehicle_summary: profile.vehicle_summary,
                  default_image_url: profile.default_image_url,
                  interior_image_url: profile.interior_image_url,
                  photo_url_front_34: profile.photo_url_front_34,
                  powertrain_summary: profile.powertrain_summary,
                  default_trim_guidance: profile.default_trim_guidance,
                  default_best_for: profile.default_best_for,
                  default_tradeoffs: profile.default_tradeoffs,
                  positioning: profile.positioning,
                  use_case: profile.use_case,
              }
            : best,
        profile,
        allProfiles,
        targetYear,
        powertrains: powertrains || [],
    };
}
