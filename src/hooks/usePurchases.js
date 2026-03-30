import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function usePurchases() {
    const { user } = useAuth();
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
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

    const hasPurchasedGuide = purchases.some((p) => p.product_type === 'guide');
    const hasPurchasedAdvisory = purchases.some((p) => p.product_type === 'advisory');

    return { purchases, loading, error, hasPurchasedGuide, hasPurchasedAdvisory };
}
