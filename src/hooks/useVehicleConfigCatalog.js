import { useState, useEffect, useCallback } from 'react';
import { fetchAllVehicleConfigProfiles } from '../lib/vehicleCatalogApi';

/**
 * Loads full `v_vehicle_config_profile` once (paginated fetch).
 * Shared by admin tools that need the same config catalog (engagement shortlist, model comparison).
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @returns {{ profiles: object[], loading: boolean, error: Error | null, reload: (opts?: { silent?: boolean }) => Promise<void> }}
 *   `reload({ silent: true })` refetches without toggling `loading` (avoids full-page spinners after inline saves).
 */
export function useVehicleConfigCatalog(supabase) {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const reload = useCallback(async (opts = {}) => {
        const { silent } = opts;
        if (!supabase) return;
        if (!silent) {
            setLoading(true);
            setError(null);
        }
        try {
            const data = await fetchAllVehicleConfigProfiles(supabase);
            setProfiles(data);
        } catch (e) {
            setError(e);
            setProfiles([]);
        } finally {
            if (!silent) setLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        reload();
    }, [reload]);

    return { profiles, loading, error, reload };
}
