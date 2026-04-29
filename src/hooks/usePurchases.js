import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const DEV_GUIDE_PREVIEW_KEY = 'autolitics_dev_guide_preview';

function getDevGuidePreview() {
    if (!import.meta.env.DEV || typeof window === 'undefined') return false;

    const params = new URLSearchParams(window.location.search);
    if (params.get('guidePreview') === '1') {
        try {
            window.localStorage.setItem(DEV_GUIDE_PREVIEW_KEY, 'true');
        } catch {
            /* ignore */
        }
        return true;
    }

    try {
        return window.localStorage.getItem(DEV_GUIDE_PREVIEW_KEY) === 'true';
    } catch {
        return false;
    }
}

export function usePurchases() {
    const { user } = useAuth();
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [devGuidePreview, setDevGuidePreview] = useState(() => getDevGuidePreview());

    useEffect(() => {
        setDevGuidePreview(getDevGuidePreview());

        async function fetchPurchases() {
            if (!user) {
                setPurchases([]);
                setLoading(false);
                return;
            }

            try {
                const { data, error: sbError } = await supabase
                    .from('purchases')
                    .select('*')
                    // RLS ensures they only see their own purchases
                    .order('created_at', { ascending: false });

                if (sbError) throw sbError;
                setPurchases(data || []);
            } catch (err) {
                console.error('Error fetching purchases:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchPurchases();
    }, [user]);

    const hasPurchasedGuide = devGuidePreview || purchases.some((p) => p.product_type === 'guide');
    const hasPurchasedAdvisory = purchases.some((p) => p.product_type === 'advisory');

    return { purchases, loading, error, hasPurchasedGuide, hasPurchasedAdvisory };
}
