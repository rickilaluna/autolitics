import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useClientProfile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchProfile() {
            if (!user?.email) {
                setLoading(false);
                return;
            }

            try {
                const { data, error: sbError } = await supabase
                    .from('clients')
                    .select('*')
                    .ilike('primary_email', user.email)
                    .single();

                if (sbError && sbError.code !== 'PGRST116') { // PGRST116 means no rows returned
                    throw sbError;
                }

                setProfile(data || null);
            } catch (err) {
                console.error("Error fetching client profile:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchProfile();
    }, [user]);

    const updateProfile = async (updates) => {
        if (!user?.email) return { error: 'No user' };

        try {
            if (profile?.id) {
                // Update existing
                const { data, error } = await supabase
                    .from('clients')
                    .update(updates)
                    .eq('id', profile.id)
                    .select()
                    .single();

                if (error) throw error;
                setProfile(data);
                return { data };
            } else {
                // Create new client record implicitly? This might be hard if we don't know the exact structure needed. 
                // But the app creates the client usually when they start, or we can insert if missing.
                const fullName = [
                    user.user_metadata?.first_name,
                    user.user_metadata?.last_name,
                ].filter(Boolean).join(' ') || 'Client';

                const { data, error } = await supabase
                    .from('clients')
                    .insert([{
                        primary_contact_name: fullName,
                        primary_email: user.email,
                        ...updates
                    }])
                    .select()
                    .single();
                
                if (error) throw error;
                setProfile(data);
                return { data };
            }
        } catch (err) {
            console.error("Error updating client profile:", err);
            return { error: err.message };
        }
    };

    return { profile, loading, error, updateProfile };
}
