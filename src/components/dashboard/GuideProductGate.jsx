import React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { usePurchases } from '../../hooks/usePurchases';

/**
 * Renders children only if the user has purchased the digital guide or advisory.
 * Advisory includes full platform access per existing Resources.jsx logic.
 */
export default function GuideProductGate({ children }) {
    const { loading, hasPurchasedGuide, hasPurchasedAdvisory } = usePurchases();

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[40vh] gap-4 text-[#0D0D12]/50 font-['JetBrains_Mono']">
                <Loader2 className="animate-spin text-[#C9A84C]" size={32} />
                Verifying access…
            </div>
        );
    }

    if (hasPurchasedGuide || hasPurchasedAdvisory) {
        return children;
    }

    return <Navigate to="/guide" replace state={{ from: 'strategic-car-buyer-guide' }} />;
}
