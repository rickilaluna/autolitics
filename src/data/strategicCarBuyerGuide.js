/**
 * The Strategic Car Buyer — canonical curriculum for the $149 digital product.
 *
 * The customer-facing product follows the four-stage journey used across the
 * dashboard. The deeper Autolitics method lives inside each stage as lessons,
 * tools, and practical checkpoints.
 */

export const STRATEGIC_CAR_BUYER_GUIDE_PATH = '/dashboard/strategic-car-buyer-guide';
export const BUYER_MISSION_PATH = '/dashboard/buyer-mission';

export const GUIDE_TOOL_PATHS = {
    framework: `${STRATEGIC_CAR_BUYER_GUIDE_PATH}/framework`,
    playbook: `${STRATEGIC_CAR_BUYER_GUIDE_PATH}/playbook`,
    decisionEngine: `${STRATEGIC_CAR_BUYER_GUIDE_PATH}/decision-engine`,
    scorecard: `${STRATEGIC_CAR_BUYER_GUIDE_PATH}/scorecard`,
    otdCalculator: `${STRATEGIC_CAR_BUYER_GUIDE_PATH}/out-the-door-calculator`,
    offerComparison: `${STRATEGIC_CAR_BUYER_GUIDE_PATH}/dealer-offer-comparison`,
};

export const GUIDE_TOOL_CONTEXTS = {
    framework: {
        stageNumber: '01',
        stageLabel: 'Discover',
        eyebrow: 'Guide lesson',
        backTo: STRATEGIC_CAR_BUYER_GUIDE_PATH,
        nextTo: GUIDE_TOOL_PATHS.playbook,
        nextLabel: 'Next: Read the Playbook',
    },
    playbook: {
        stageNumber: '01',
        stageLabel: 'Discover',
        eyebrow: 'Guide lesson',
        backTo: STRATEGIC_CAR_BUYER_GUIDE_PATH,
        nextTo: BUYER_MISSION_PATH,
        nextLabel: 'Next: Define my goals',
    },
    decisionEngine: {
        stageNumber: '02',
        stageLabel: 'Evaluate',
        eyebrow: 'Guide tool',
        backTo: STRATEGIC_CAR_BUYER_GUIDE_PATH,
        nextTo: GUIDE_TOOL_PATHS.scorecard,
        nextLabel: 'Next: Score a test drive',
    },
    scorecard: {
        stageNumber: '02',
        stageLabel: 'Evaluate',
        eyebrow: 'Guide tool',
        backTo: STRATEGIC_CAR_BUYER_GUIDE_PATH,
        nextTo: GUIDE_TOOL_PATHS.otdCalculator,
        nextLabel: 'Next: Check out-the-door pricing',
    },
    otdCalculator: {
        stageNumber: '03',
        stageLabel: 'Compare Offers',
        eyebrow: 'Guide tool',
        backTo: STRATEGIC_CAR_BUYER_GUIDE_PATH,
        nextTo: GUIDE_TOOL_PATHS.offerComparison,
        nextLabel: 'Next: Compare dealer offers',
    },
    offerComparison: {
        stageNumber: '03',
        stageLabel: 'Compare Offers',
        eyebrow: 'Guide tool',
        backTo: STRATEGIC_CAR_BUYER_GUIDE_PATH,
        nextTo: GUIDE_TOOL_PATHS.playbook,
        nextLabel: 'Review purchase control guidance',
    },
};

/** @typedef {'read' | 'interactive' | 'print' | 'worksheet' | 'checklist'} GuideModuleKind */

export const GUIDE_STAGE_IDS = {
    discover: 'guide_discover',
    evaluate: 'guide_evaluate',
    compare: 'guide_compare_offers',
    close: 'guide_decision_purchase',
};

export const GUIDE_TASKS = {
    mission: 'guide_define_mission',
    framework: 'c_framework',
    playbook: 'c_playbook',
    shortlist: 'guide_build_shortlist',
    decisionEngine: 'c_decision',
    scorecard: 'c_test_drive',
    otd: 'c_otd',
    offerComparison: 'c_offer_comp',
    finalDecision: 'c_decision_final',
    paperwork: 'c_paperwork',
};

/** @type {Array<{
 *   id: string;
 *   number: string;
 *   label: string;
 *   title: string;
 *   summary: string;
 *   outcome: string;
 *   method: string[];
 *   checkpoints: Array<{ id: string; label: string; to?: string; cta?: string; systemCheck?: 'profile' | 'decisionEngine' | 'scorecard' | 'offers' | 'otd' }>;
 *   modules: Array<{
 *     id: string;
 *     kind: GuideModuleKind;
 *     title: string;
 *     description: string;
 *     to?: string;
 *     cta?: string;
 *     openInNewTab?: boolean;
 *     note?: string;
 *     group?: string;
 *   }>;
 * }>} */
export const STRATEGIC_CAR_BUYER_STAGES = [
    {
        id: GUIDE_STAGE_IDS.discover,
        number: '01',
        label: 'Discover',
        title: 'Define My Goals',
        summary:
            'Before you take your first test drive, get clear on your priorities, needs, price range, timing, and the tradeoffs you will not compromise on.',
        outcome:
            'A focused buyer profile: use case, budget range, must-haves, nice-to-haves, timing, and first shortlist boundaries.',
        method: ['Define My Goals', 'Map the Landscape'],
        checkpoints: [
            {
                id: GUIDE_TASKS.mission,
                label: 'Complete the Buyer Mission worksheet',
                to: BUYER_MISSION_PATH,
                cta: 'Start worksheet',
                systemCheck: 'profile',
            },
            {
                id: GUIDE_TASKS.framework,
                label: 'Read the Car Buying Framework',
                to: GUIDE_TOOL_PATHS.framework,
                cta: 'Read framework',
            },
            {
                id: GUIDE_TASKS.playbook,
                label: 'Read the Playbook introduction and dealership dynamics',
                to: GUIDE_TOOL_PATHS.playbook,
                cta: 'Read Playbook',
            },
        ],
        modules: [
            {
                id: 'mission-builder',
                kind: 'worksheet',
                title: 'Buyer Mission Worksheet',
                description:
                    'A guided worksheet for daily use, budget, timeline, must-haves, dealbreakers, and vehicles already on your radar.',
                to: BUYER_MISSION_PATH,
                cta: 'Start worksheet',
                group: 'Build your mission',
            },
            {
                id: 'buying-framework',
                kind: 'read',
                title: 'The Car Buying Framework',
                description:
                    'The four-stage model for keeping the process deliberate: Discover, Evaluate, Compare Offers, Decision & Purchase.',
                to: GUIDE_TOOL_PATHS.framework,
                cta: 'Read',
                group: 'Read first',
            },
            {
                id: 'playbook-foundation',
                kind: 'read',
                title: 'The Autolitics Playbook',
                description:
                    'The long-form spine of the guide: dealership dynamics, buyer leverage, pricing posture, and calm decision-making.',
                to: GUIDE_TOOL_PATHS.playbook,
                cta: 'Open',
                group: 'Read first',
            },
        ],
    },
    {
        id: GUIDE_STAGE_IDS.evaluate,
        number: '02',
        label: 'Evaluate',
        title: 'Build and Validate the Shortlist',
        summary:
            'Turn your early list into two to four serious contenders, then score real-world fit instead of relying on memory or vibes.',
        outcome: 'A 2-4 vehicle shortlist with consistent scores, notes, and a defensible front-runner.',
        method: ['Map the Landscape', 'Validate in the Real World'],
        checkpoints: [
            {
                id: GUIDE_TASKS.shortlist,
                label: 'Narrow to 2-4 serious candidate vehicles',
                to: BUYER_MISSION_PATH,
                cta: 'Update shortlist',
            },
            {
                id: GUIDE_TASKS.decisionEngine,
                label: 'Run a Vehicle Decision Engine comparison',
                to: GUIDE_TOOL_PATHS.decisionEngine,
                cta: 'Launch engine',
                systemCheck: 'decisionEngine',
            },
            {
                id: GUIDE_TASKS.scorecard,
                label: 'Complete at least one test drive scorecard',
                to: GUIDE_TOOL_PATHS.scorecard,
                cta: 'Open scorecard',
                systemCheck: 'scorecard',
            },
        ],
        modules: [
            {
                id: 'decision-engine',
                kind: 'interactive',
                title: 'Vehicle Decision Engine',
                description:
                    'Compare candidates digitally, weight what matters, and surface a recommendation from your own priorities.',
                to: GUIDE_TOOL_PATHS.decisionEngine,
                cta: 'Launch',
                group: 'Evaluate candidates',
            },
            {
                id: 'scorecard',
                kind: 'interactive',
                title: 'Vehicle Evaluation Scorecard',
                description:
                    'Score vehicles consistently across driving feel, usability, comfort, tech, practicality, and ownership confidence.',
                to: GUIDE_TOOL_PATHS.scorecard,
                cta: 'Use scorecard',
                group: 'Evaluate candidates',
            },
            {
                id: 'matrix-print',
                kind: 'print',
                title: 'Comparison Matrix Worksheet',
                description:
                    'A print-optimized worksheet for paper notes during dealer visits or at-home shortlist conversations.',
                to: '/resources/vehicle-comparison-matrix/template',
                cta: 'Open printable',
                openInNewTab: true,
                group: 'Take with you',
            },
        ],
    },
    {
        id: GUIDE_STAGE_IDS.compare,
        number: '03',
        label: 'Compare Offers',
        title: 'Navigate Pricing and Dealer Quotes',
        summary:
            'Translate quotes into comparable numbers, identify add-ons and fee drift, and keep the conversation anchored to total cost.',
        outcome: 'At least two itemized offers compared apples-to-apples, with a clean out-the-door expectation.',
        method: ['Navigate the Market'],
        checkpoints: [
            {
                id: GUIDE_TASKS.otd,
                label: 'Calculate a clean out-the-door expectation',
                to: GUIDE_TOOL_PATHS.otdCalculator,
                cta: 'Open checker',
                systemCheck: 'otd',
            },
            {
                id: GUIDE_TASKS.offerComparison,
                label: 'Compare multiple dealer offers',
                to: GUIDE_TOOL_PATHS.offerComparison,
                cta: 'Compare offers',
                systemCheck: 'offers',
            },
        ],
        modules: [
            {
                id: 'otd-checker',
                kind: 'interactive',
                title: 'Out-the-Door Price Checker',
                description:
                    'Estimate taxes, fees, add-ons, and market adjustments so the quote can be judged against total cost.',
                to: GUIDE_TOOL_PATHS.otdCalculator,
                cta: 'Open',
                group: 'Price the deal',
            },
            {
                id: 'dealer-compare-tool',
                kind: 'interactive',
                title: 'Dealer Offer Comparison',
                description:
                    'Enter up to five dealer quotes and see which offer is truly lowest after fees, add-ons, and taxes.',
                to: GUIDE_TOOL_PATHS.offerComparison,
                cta: 'Compare offers',
                group: 'Price the deal',
            },
            {
                id: 'dealer-script',
                kind: 'checklist',
                title: 'Dealer Quote Request Script',
                description:
                    'Use the Playbook and offer template to ask every dealer for the same written breakdown before negotiating.',
                to: `${GUIDE_TOOL_PATHS.offerComparison}#what-to-do-next`,
                cta: 'Get script',
                group: 'Request quotes',
            },
            {
                id: 'dealer-worksheet',
                kind: 'print',
                title: 'Dealer Offer Worksheet',
                description:
                    'Blank worksheet for recording quotes at the desk or standardizing photos and emails after the visit.',
                to: '/resources/dealer-offer-comparison/template',
                cta: 'Open printable',
                openInNewTab: true,
                group: 'Request quotes',
            },
        ],
    },
    {
        id: GUIDE_STAGE_IDS.close,
        number: '04',
        label: 'Decision & Purchase',
        title: 'Choose, Verify, and Sign With Control',
        summary:
            'Make the final call, pressure-test the paperwork, and move through the finance office with documentation instead of momentum.',
        outcome: 'A final vehicle and dealer decision, a verified contract, and a clean close without unwanted add-ons.',
        method: ['Close with Confidence'],
        checkpoints: [
            {
                id: GUIDE_TASKS.finalDecision,
                label: 'Make final vehicle and dealer decision',
                to: GUIDE_TOOL_PATHS.decisionEngine,
                cta: 'Review comparison',
            },
            {
                id: GUIDE_TASKS.paperwork,
                label: 'Finalize paperwork and decline unwanted products',
                to: GUIDE_TOOL_PATHS.playbook,
                cta: 'Review add-ons',
            },
        ],
        modules: [
            {
                id: 'final-decision-review',
                kind: 'checklist',
                title: 'Final Decision Review',
                description:
                    'Review tradeoffs, emotional bias, scorecard results, offer clarity, and ownership fit before committing.',
                note: 'Use your saved scorecards, Decision Engine recommendation, and offer comparison as the evidence base.',
                group: 'Final review',
            },
            {
                id: 'fni-addons',
                kind: 'read',
                title: 'Finance Office Add-Ons',
                description:
                    'Revisit the Playbook sections on add-ons, warranties, payment framing, and walking away before signing.',
                to: GUIDE_TOOL_PATHS.playbook,
                cta: 'Review',
                group: 'Final review',
            },
            {
                id: 'otd-final',
                kind: 'interactive',
                title: 'OTD Final Pass',
                description:
                    'Run the contract against a clean total one last time before you sign.',
                to: GUIDE_TOOL_PATHS.otdCalculator,
                cta: 'Check total',
                group: 'Before signing',
            },
        ],
    },
];

/** Back-compat alias for older dashboard imports. */
export const STRATEGIC_CAR_BUYER_PARTS = STRATEGIC_CAR_BUYER_STAGES.map((stage) => ({
    id: stage.id,
    roman: stage.number,
    title: stage.title,
    summary: stage.summary,
    modules: stage.modules,
}));

export function countGuideModules() {
    return STRATEGIC_CAR_BUYER_STAGES.reduce((n, stage) => n + stage.modules.length, 0);
}

export function countGuideCheckpoints() {
    return STRATEGIC_CAR_BUYER_STAGES.reduce((n, stage) => n + stage.checkpoints.length, 0);
}
