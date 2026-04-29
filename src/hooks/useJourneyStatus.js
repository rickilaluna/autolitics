import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getWorkspaceActivity } from '../lib/vehicleContextStorage';
import { BUYER_MISSION_PATH } from '../data/strategicCarBuyerGuide';

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
    const [workspace, setWorkspace] = useState(null);

    useEffect(() => {
        // Capture local storage state
        setWorkspace(getWorkspaceActivity());

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
    
    // Evaluate if user has generated artifacts in their browser
    const hasTestDriveData = counts.testDrives > 0 || workspace?.hasScorecard;
    const hasOfferData = counts.offers > 0 || workspace?.hasOfferComparison || (workspace?.otdQuotes?.length > 0);
    const hasCompareData = workspace?.decisionEngineCount >= 2;

    // Determine current phase (1-4)
    let currentPhase = 1;
    if (isProfileComplete) currentPhase = 2; // Evaluate
    if (counts.deliverables > 0 || counts.listings > 0) currentPhase = 2;
    if (hasTestDriveData || hasCompareData) currentPhase = 3; // Compare Offers
    if (hasOfferData) currentPhase = 4; // Close

    // Determine next step (resourcePhase maps to PHASE_RESOURCES keys in dashboardResourceCatalog.js)
    let nextStep = null;
    if (!isProfileComplete) {
        nextStep = {
            label: 'Define Your Buying Goals',
            description: 'Complete the Buyer Mission worksheet so the rest of the guide has your priorities, budget posture, timeline, and shortlist context.',
            link: BUYER_MISSION_PATH,
            linkLabel: 'Define My Goals',
            resourcePhase: 'strategy',
        };
    } else if (
        hasPurchasedAdvisory &&
        counts.deliverables === 0 &&
        !profile?.advisory_strategy_brief_at
    ) {
        nextStep = {
            label: 'Strategy Brief In Progress',
            description: 'Your advisor is preparing your custom vehicle strategy. You\'ll be notified when it\'s ready for review.',
            action: null,
            resourcePhase: 'strategy',
        };
    } else if (
        hasPurchasedAdvisory &&
        (counts.deliverables > 0 || profile?.advisory_strategy_brief_at) &&
        !hasTestDriveData && !hasCompareData && !hasOfferData
    ) {
        nextStep = {
            label: 'Review Your Strategy Brief',
            description: 'Your personalized vehicle recommendations are ready. Review them, then schedule your first test drive or use the Decision Engine.',
            link: '/dashboard/strategy-brief',
            linkLabel: 'Start Review',
            resourcePhase: 'strategy',
        };
    } else if (hasPurchasedAdvisory && (hasTestDriveData || hasCompareData) && !hasOfferData) {
        nextStep = {
            label: 'Ready to Negotiate?',
            description: 'You are actively evaluating vehicles. When you receive a dealer quote, submit it for a line-by-line review.',
            link: '/dashboard/my-search/offer',
            linkLabel: 'Submit an Offer',
            resourcePhase: 'negotiate',
        };
    } else if (hasPurchasedAdvisory && hasOfferData) {
        nextStep = {
            label: 'Review Your Offer Analysis',
            description: 'You\'ve engaged with dealer quotes. Check My Search for status updates or run additional quotes in the OTD Price Checker.',
            link: '/dashboard/my-search',
            linkLabel: 'View Submissions',
            resourcePhase: 'negotiate',
        };
    }

    return { loading, counts, workspace, currentPhase, nextStep };
}
