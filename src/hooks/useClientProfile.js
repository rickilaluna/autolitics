import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/** Normalize email for stable matching (avoids duplicate client rows from casing). */
function normalizeEmail(email) {
    return (email || '').trim().toLowerCase();
}

/**
 * Load the single most recently updated clients row for this login email.
 * Uses limit(1) instead of single() so duplicate rows (same email) do not break the query.
 */
export function useClientProfile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadProfile = useCallback(async () => {
        if (!user?.email) {
            setProfile(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { error: mergeErr } = await supabase.rpc('merge_intro_call_booking');
            if (mergeErr) {
                console.warn('merge_intro_call_booking:', mergeErr.message);
            }

            const emailNorm = normalizeEmail(user.email);

            const { data: rows, error: sbError } = await supabase
                .from('clients')
                .select('*')
                .ilike('primary_email', emailNorm)
                .order('updated_at', { ascending: false })
                .limit(1);

            if (sbError) throw sbError;

            setProfile(rows?.[0] ?? null);
        } catch (err) {
            console.error('Error fetching client profile:', err);
            setError(err.message);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    }, [user?.id, user?.email]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const updateProfile = async (updates) => {
        if (!user?.email) return { error: 'No user' };

        const emailNorm = normalizeEmail(user.email);
        const payload = {
            ...updates,
            primary_email: emailNorm,
            updated_at: new Date().toISOString(),
        };
        if (user?.id) {
            payload.auth_user_id = user.id;
        }

        try {
            let clientId = profile?.id;

            if (!clientId) {
                const { data: existing, error: findErr } = await supabase
                    .from('clients')
                    .select('id')
                    .ilike('primary_email', emailNorm)
                    .order('updated_at', { ascending: false })
                    .limit(1);

                if (findErr) throw findErr;
                clientId = existing?.[0]?.id;
            }

            if (clientId) {
                const { data, error } = await supabase
                    .from('clients')
                    .update(payload)
                    .eq('id', clientId)
                    .select()
                    .single();

                if (error) throw error;
                setProfile(data);
                return { data };
            }

            const fullName =
                [user.user_metadata?.first_name, user.user_metadata?.last_name]
                    .filter(Boolean)
                    .join(' ') || 'Client';

            const { data, error } = await supabase
                .from('clients')
                .insert([
                    {
                        primary_contact_name: fullName,
                        ...payload,
                    },
                ])
                .select()
                .single();

            if (error) throw error;
            setProfile(data);
            return { data };
        } catch (err) {
            console.error('Error updating client profile:', err);
            return { error: err.message };
        }
    };

    const toggleTaskCompletion = async (taskId) => {
        if (!profile?.id) return { error: 'No profile loaded' };
        
        const currentTasks = Array.isArray(profile.completed_journey_tasks) 
            ? profile.completed_journey_tasks 
            : [];
            
        const isCompleted = currentTasks.includes(taskId);
        const newTasks = isCompleted 
            ? currentTasks.filter(id => id !== taskId)
            : [...currentTasks, taskId];
            
        // Optimistic update
        setProfile((prev) => ({ ...prev, completed_journey_tasks: newTasks }));
        
        try {
            const { data, error } = await supabase
                .from('clients')
                .update({ completed_journey_tasks: newTasks })
                .eq('id', profile.id)
                .select()
                .single();
                
            if (error) {
                // Revert on fail
                setProfile((prev) => ({ ...prev, completed_journey_tasks: currentTasks }));
                throw error;
            }
            return { data };
        } catch (err) {
            console.error('Error toggling task:', err);
            return { error: err.message };
        }
    };

    return { profile, loading, error, updateProfile, refetchProfile: loadProfile, toggleTaskCompletion };
}
