import { useState, useEffect, useCallback } from 'react';
import { fetchAllVehicleModels } from '../lib/vehicleCatalogApi';

/**
 * Loads full `vehicle_models` (paginated). Used by Vehicle Library Explorer and similar.
 */
export function useVehicleModelsCatalog(supabase, selectCols = '*') {
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const reload = useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        setError(null);
        try {
            const data = await fetchAllVehicleModels(supabase, selectCols);
            setModels(data);
        } catch (e) {
            setError(e);
            setModels([]);
        } finally {
            setLoading(false);
        }
    }, [supabase, selectCols]);

    useEffect(() => {
        reload();
    }, [reload]);

    return { models, loading, error, reload };
}
