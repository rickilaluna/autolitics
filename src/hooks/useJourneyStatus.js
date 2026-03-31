import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Fetches client journey milestones: deliverables, listings, test drives, offers.
 * Returns counts + a computed `currentPhase` (1-4) and `nextStep` recommendation.
 */
export function useJourneyStatus({ profile, hasPurchasedAdvisory }) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [counts, setCounts] = useState({
        deliverables: 0,
        listings: 0,
        testDrives: 0,
        offers: 0,
    });

    useEffect(() => {
        async function fetchCounts() {
            if (!user?.email || !profile?.id) {
                setLoading(false);
                return;
            }

            setLoading(true);

            try {
                const clientId = profile.id;

                const [deliverables, listings, drives, offers] = await Promise.all([
                    // Deliverables via engagements
                    (async () => {
                        const { data: engagements } = await supabase
                            .from('engagements')
                            .select('id')
                            .eq('client_id', clientId);
                        if (!engagements?.length) return 0;
                        const { count } = await supabase
                            .from('deliverable_versions')
                            .select('id', { count: 'exact', head: true })
                            .in('engagement_id', engagements.map(e => e.id));
                        return count || 0;
                    })(),
                    // Listing reviews
                    supabase
                        .from('listing_reviews')
                        .select('id', { count: 'exact', head: true })
                        .eq('client_id', clientId)
                        .then(({ count }) => count || 0),
                    // Test drives
                    supabase
                        .from('test_drive_feedback')
                        .select('id', { count: 'exact', head: true })
                        .eq('client_id', clientId)
                        .then(({ count }) => count || 0),
                    // Dealer offers
                    supabase
                        .from('dealer_offer_reviews')
                        .select('id', { count: 'exact', head: true })
                        .eq('client_id', clientId)
                        .then(({ count }) => count || 0),
                ]);

                setCounts({ deliverables, listings, testDrives: drives, offers });
            } catch (err) {
                console.error('Error fetching journey status:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchCounts();
    }, [user, profile?.id]);

    const isProfileComplete = profile && profile.buying_timeline && profile.primary_goal;

    // Determine current phase (1-4)
    let currentPhase = 1;
    if (isProfileComplete) currentPhase = 2;
    if (counts.deliverables > 0 || counts.listings > 0) currentPhase = 2;
    if (counts.testDrives > 0) currentPhase = 3;
    if (counts.offers > 0) currentPhase = 4;

    // Determine next step (resourcePhase maps to PHASE_RESOURCES keys in dashboardResourceCatalog.js)
    let nextStep = null;
    if (!isProfileComplete) {
        nextStep = {
            label: 'Complete Your Search Profile',
            description: 'Tell us about your timeline, goals, and target vehicles so we can personalize your experience.',
            action: 'onboarding',
            resourcePhase: 'strategy',
        };
    } else if (hasPurchasedAdvisory && counts.deliverables === 0) {
        nextStep = {
            label: 'Strategy Brief In Progress',
            description: 'Your advisor is preparing your custom vehicle strategy. You\'ll be notified when it\'s ready for review.',
            action: null,
            resourcePhase: 'strategy',
        };
    } else if (counts.deliverables > 0 && counts.testDrives === 0) {
        nextStep = {
            label: 'Review Your Strategy Brief',
            description: 'Your personalized vehicle recommendations are ready. Review them, then schedule your first test drive.',
            link: '/dashboard/strategy-brief',
            linkLabel: 'Open My Strategy',
            resourcePhase: 'strategy',
        };
    } else if (counts.testDrives > 0 && counts.offers === 0) {
        nextStep = {
            label: 'Ready to Negotiate?',
            description: 'You\'ve driven vehicles and logged feedback. When you receive a dealer quote, submit it for a line-by-line review.',
            link: '/dashboard/my-search/offer',
            linkLabel: 'Submit an Offer',
            resourcePhase: 'negotiate',
        };
    } else if (counts.offers > 0) {
        nextStep = {
            label: 'Review Your Offer Analysis',
            description: 'Your submitted offers are being evaluated. Check My Search for status updates and advisor feedback.',
            link: '/dashboard/my-search',
            linkLabel: 'View Submissions',
            resourcePhase: 'negotiate',
        };
    } else if (!hasPurchasedAdvisory && counts.listings === 0) {
        nextStep = {
            label: 'Start Evaluating Vehicles',
            description: 'Found a listing you like? Submit it for a quick analysis, or explore our resources to sharpen your search.',
            link: '/dashboard/my-search/listing',
            linkLabel: 'Submit a Listing',
            resourcePhase: 'evaluate',
        };
    }

    return { loading, counts, currentPhase, nextStep };
}
