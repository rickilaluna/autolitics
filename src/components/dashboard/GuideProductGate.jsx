import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { usePurchases } from '../../hooks/usePurchases';
import { useClientProfile } from '../../hooks/useClientProfile';

/**
 * Renders children only if the user has purchased the digital guide or advisory.
 * Advisory includes full platform access per existing Resources.jsx logic.
 *
 * For first-time Guide purchasers who haven't completed onboarding,
 * redirects to the welcome flow (unless already on the welcome page).
 */
export default function GuideProductGate({ children }) {
    const location = useLocation();
    const { loading: purchaseLoading, hasPurchasedGuide, hasPurchasedAdvisory } = usePurchases();
    const { profile, loading: profileLoading } = useClientProfile();

    const isLoading = purchaseLoading || profileLoading;
    const hasAccess = hasPurchasedGuide || hasPurchasedAdvisory;
    const isOnWelcomePage = location.pathname === '/dashboard/guide-welcome';
    const hasCompletedOnboarding = profile?.guide_onboarding_completed === true;

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[40vh] gap-4 text-[#0D0D12]/50 font-['JetBrains_Mono']">
                <Loader2 className="animate-spin text-[#C9A84C]" size={32} />
                Verifying access…
            </div>
        );
    }

    // No purchase - redirect to guide sales page
    if (!hasAccess) {
        return <Navigate to="/guide" replace state={{ from: 'strategic-car-buyer-guide' }} />;
    }

    // Has purchase but hasn't completed onboarding
    // Redirect to welcome flow (unless already there)
    if (hasPurchasedGuide && !hasPurchasedAdvisory && !hasCompletedOnboarding && !isOnWelcomePage) {
        return <Navigate to="/dashboard/guide-welcome" replace />;
    }

    return children;
}
