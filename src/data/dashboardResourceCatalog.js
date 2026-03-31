/**
 * Single source of truth for dashboard-facing links to public Resources IP.
 * Used by Resources.jsx, Overview, My Search, Strategy, and cross-links.
 */

import {
    FileText,
    BookOpen,
    FileSpreadsheet,
    ShieldCheck,
    Calculator,
    LayoutGrid,
} from 'lucide-react';

/** @type {Record<string, { label: string, description: string, items: Array<{ id: string, title: string, description: string, to: string, icon: typeof ShieldCheck }> }>} */
export const PHASE_RESOURCES = {
    strategy: {
        label: 'Strategy & Research',
        description: 'Build your buying framework before you shop.',
        items: [
            {
                id: 'buying-framework',
                title: 'Car Buying Framework',
                description: 'A four-stage decision model that shifts power from the dealership to the buyer.',
                to: '/resources/buying-framework',
                icon: ShieldCheck,
            },
            {
                id: 'playbook',
                title: 'The Autolitics Playbook',
                description: 'Navigate dealerships, evaluate vehicles, understand pricing, and structure a smart deal.',
                to: '/resources/playbook',
                icon: BookOpen,
            },
        ],
    },
    evaluate: {
        label: 'Evaluate & Test Drive',
        description: 'Score, compare, and narrow your shortlist.',
        items: [
            {
                id: 'scorecard',
                title: 'Vehicle Evaluation Scorecard',
                description: 'A printable worksheet for scoring vehicles during test drives across six categories.',
                to: '/resources/scorecard',
                icon: FileSpreadsheet,
            },
            {
                id: 'vehicle-comparison-matrix',
                title: 'Vehicle Decision Engine',
                description: 'Compare vehicles digitally, score across 8 dimensions, and get a visual recommendation.',
                to: '/resources/vehicle-comparison-matrix',
                icon: LayoutGrid,
            },
        ],
    },
    negotiate: {
        label: 'Negotiate & Close',
        description: 'Verify pricing, compare offers, and close with confidence.',
        items: [
            {
                id: 'out-the-door-calculator',
                title: 'Out-the-Door Price Checker',
                description: 'See what a clean total should look like and spot hidden extras in a dealer quote.',
                to: '/resources/out-the-door-calculator',
                icon: Calculator,
            },
            {
                id: 'dealer-offer-comparison',
                title: 'Dealer Offer Comparison',
                description: 'Compare quotes from up to four dealerships side-by-side to find the true lowest cost.',
                to: '/resources/dealer-offer-comparison',
                icon: FileText,
            },
        ],
    },
};

export const RESOURCE_HUB_PATH = '/dashboard/resources';

/** Flat list for compact strips */
export function getAllCatalogItems() {
    return Object.entries(PHASE_RESOURCES).flatMap(([phaseKey, phase]) =>
        phase.items.map((item) => ({
            ...item,
            phaseKey,
            phaseLabel: phase.label,
        }))
    );
}
