import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, LayoutGrid } from 'lucide-react';

/**
 * ResourceNav — consistent breadcrumb + hub link for all resource pages.
 * Place immediately after <MinimalHeader /> in each resource page.
 *
 * Props:
 *   title  — current page name shown as the active breadcrumb label
 */

const RESOURCES = [
    { label: 'Framework', to: '/resources/buying-framework' },
    { label: 'Playbook',  to: '/resources/playbook' },
    { label: 'Scorecard', to: '/resources/scorecard' },
    { label: 'Offer Comparison', to: '/resources/dealer-offer-comparison' },
    { label: 'Decision Engine', to: '/resources/vehicle-comparison-matrix' },
    { label: 'OTD Calculator', to: '/resources/out-the-door-calculator' },
];

export default function ResourceNav({ title }) {
    const { pathname } = useLocation();

    return (
        <div className="no-print w-full flex justify-center px-4 mt-4">
            <div className="w-full max-w-5xl">
                <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#0D0D12]/60 border border-[#2A2A35] text-sm">

                    {/* ← Resources hub link */}
                    <Link
                        to="/dashboard/resources"
                        className="flex items-center gap-1.5 text-[#FAF8F5]/40 hover:text-[#FAF8F5]/80 transition-colors duration-200 shrink-0 group"
                    >
                        <LayoutGrid size={13} className="group-hover:text-[#C9A84C] transition-colors" />
                        <span className="font-medium hidden sm:inline">Resources</span>
                        <ChevronLeft size={13} className="hidden sm:inline opacity-50" />
                    </Link>

                    {/* Current page label */}
                    <span className="text-[#FAF8F5]/70 font-medium truncate flex-1 sm:flex-none">
                        {title}
                    </span>

                    {/* Divider */}
                    <div className="flex-1 hidden sm:block" />

                    {/* Quick switcher — other pages */}
                    <div className="flex items-center gap-1">
                        {RESOURCES.filter(r => r.to !== pathname).map(r => (
                            <Link
                                key={r.to}
                                to={r.to}
                                className="px-3 py-1 rounded-lg text-xs font-medium text-[#FAF8F5]/35 hover:text-[#FAF8F5]/70 hover:bg-[#FAF8F5]/5 transition-all duration-200"
                            >
                                {r.label}
                            </Link>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
}
