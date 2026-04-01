import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronRight, ChevronDown, BookOpen, Calculator, LayoutGrid, FileText, FileSpreadsheet, ShieldCheck, FileSignature, MessagesSquare, CarFront } from 'lucide-react';
import { useJourneyStatus } from '../../hooks/useJourneyStatus';
import { useClientProfile } from '../../hooks/useClientProfile';
import { usePurchases } from '../../hooks/usePurchases';

const STAGES = [
    { 
        id: 'discover', 
        label: 'Discover',
        desc: 'Establish your target and build your strategy.',
        checklists: [
            { id: 'c_profile', label: 'Define target & timeline in Profile', type: 'system', checkKey: 'isProfileComplete' },
            { id: 'c_framework', label: 'Read the Car Buying Framework', type: 'manual', link: '/resources/buying-framework' },
            { id: 'c_playbook', label: 'Read the Autolitics Playbook', type: 'manual', link: '/resources/playbook' },
            { id: 'c_intro', label: 'Schedule Initial Call', type: 'manual', reqAdvisory: true },
            { id: 'c_strategy', label: 'Review Strategy Brief', type: 'manual', reqAdvisory: true, link: '/dashboard/strategy-brief' },
        ],
        tools: []
    },
    { 
        id: 'evaluate', 
        label: 'Evaluate',
        desc: 'Filter models, test drive, and select your top choice.',
        checklists: [
            { id: 'c_decision', label: 'Run a Vehicle Decision Engine comparison', type: 'manual', link: '/resources/vehicle-comparison-matrix' },
            { id: 'c_test_drive', label: 'Take a test drive and score it', type: 'manual', link: '/resources/scorecard' },
            { id: 'c_log_drive', label: 'Log Test Drive for review', type: 'manual', reqAdvisory: true, link: '/dashboard/my-search/test-drive' },
            { id: 'c_listing', label: 'Submit Listing for review', type: 'manual', reqAdvisory: true, link: '/dashboard/my-search/listing' },
        ],
        tools: [
            { id: 'engine', label: 'Vehicle Decision Engine', link: '/resources/vehicle-comparison-matrix', icon: LayoutGrid, desc: 'Compare models' },
            { id: 'scorecard', label: 'Evaluation Scorecard', link: '/resources/scorecard', icon: FileSpreadsheet, desc: 'Test drive checklist' },
        ]
    },
    { 
        id: 'compare', 
        label: 'Compare Offers',
        desc: 'Solicit quotes and verify out-the-door numbers.',
        checklists: [
            { id: 'c_otd', label: 'Calculate Clean OTD Price', type: 'manual', link: '/resources/out-the-door-calculator' },
            { id: 'c_offer_comp', label: 'Compare multiple dealer offers', type: 'manual', link: '/resources/dealer-offer-comparison' },
            { id: 'c_analyze_offer', label: 'Analyze Offer with Advisor', type: 'manual', reqAdvisory: true, link: '/dashboard/my-search/offer' },
        ],
        tools: [
            { id: 'otd', label: 'OTD Calculator', link: '/resources/out-the-door-calculator', icon: Calculator, desc: 'Spot hidden fees' },
            { id: 'offer', label: 'Offer Comparison', link: '/resources/dealer-offer-comparison', icon: FileText, desc: 'Stack quotes' },
        ]
    },
    { 
        id: 'close', 
        label: 'Decision & Purchase',
        desc: 'Commit to a vehicle, negotiate the final numbers, and finalize paperwork.',
        checklists: [
            { id: 'c_decision_final', label: 'Make final vehicle & dealer decision', type: 'manual' },
            { id: 'c_fni', label: 'Review F&I Add-ons Strategy Guide', type: 'manual', link: '/resources/playbook' },
            { id: 'c_paperwork', label: 'Finalize paperwork & decline unnecessary products', type: 'manual' },
        ],
        tools: []
    },
];

export default function GlobalJourneyTracker({ className = '', variant = 'compact' }) {
    const { profile, toggleTaskCompletion } = useClientProfile();
    const { hasPurchasedAdvisory } = usePurchases();
    const { currentPhase, workspace, counts } = useJourneyStatus({ profile, hasPurchasedAdvisory });

    // 1-indexed phase
    const currentIndex = Math.max(0, Math.min(STAGES.length - 1, (currentPhase || 1) - 1));
    const [expandedStage, setExpandedStage] = useState(currentIndex);

    const completedTasks = Array.isArray(profile?.completed_journey_tasks) ? profile.completed_journey_tasks : [];
    
    // System checks
    const isProfileComplete = profile?.buying_timeline && profile?.primary_goal;
    const hasStrategyBrief = counts?.deliverables > 0 || !!profile?.advisory_strategy_brief_at;

    const checkTask = (item) => {
        if (item.type === 'system') {
            if (item.checkKey === 'isProfileComplete') return isProfileComplete;
            if (item.checkKey === 'hasStrategyBrief') return hasStrategyBrief;
            return false;
        }
        return completedTasks.includes(item.id);
    };

    const handleToggle = (item) => {
        if (item.type === 'system') return;
        if (toggleTaskCompletion) toggleTaskCompletion(item.id);
    };

    if (variant === 'compact') {
        const progressWidth = `${(currentIndex / (STAGES.length - 1)) * 100}%`;
        return (
            <div className={`w-full bg-[#14141B] border border-[#2A2A35] rounded-3xl p-5 sm:p-6 mb-8 flex flex-col gap-5 shadow-sm ${className}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-[#FAF8F5] font-semibold tracking-tight text-lg">Your Buying Journey</h2>
                        <p className="text-[#FAF8F5]/60 text-sm mt-1">Track your progress toward the right car and the right deal.</p>
                    </div>
                    <div className="text-xs font-['JetBrains_Mono'] text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/20 px-3 py-1.5 rounded-full hidden sm:block">
                        Stage {currentIndex + 1} of {STAGES.length}
                    </div>
                </div>

                <div className="relative pt-2">
                    {/* Connecting lines */}
                    <div className="absolute top-[24px] left-[20px] right-[20px] h-0.5 bg-[#2A2A35] z-0 hidden sm:block rounded-full overflow-hidden">
                        <div className="h-full bg-[#C9A84C] transition-all duration-700 ease-in-out" style={{ width: progressWidth }}></div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-between gap-5 sm:gap-0 relative z-10">
                        {STAGES.map((stage, index) => {
                            const status = index < currentIndex ? 'completed' : index === currentIndex ? 'active' : 'upcoming';
                            const resumeLink = stage.checklists.find(c => c.link)?.link || '#';
                            
                            return (
                                <div key={stage.id} className="flex sm:flex-col items-center gap-4 sm:gap-3 group flex-1">
                                    {/* Indicator */}
                                    <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-500
                                        ${status === 'completed' ? 'bg-[#C9A84C] border-[#C9A84C] text-[#0D0D12] shadow-[0_0_15px_rgba(201,168,76,0.2)]' : ''}
                                        ${status === 'active' ? 'bg-[#14141B] border-[#C9A84C] text-[#C9A84C] shadow-[0_0_15px_rgba(201,168,76,0.15)] scale-110' : ''}
                                        ${status === 'upcoming' ? 'bg-[#14141B] border-[#2A2A35] text-[#FAF8F5]/30' : ''}
                                    `}>
                                        {status === 'completed' ? (
                                            <Check size={18} strokeWidth={3} />
                                        ) : (
                                            <span className="text-sm font-bold font-['JetBrains_Mono']">{index + 1}</span>
                                        )}
                                    </div>

                                    {/* Label Area */}
                                    <div className="flex flex-col sm:items-center sm:text-center min-w-0 flex-1">
                                        <span className={`text-sm font-semibold whitespace-nowrap transition-colors duration-300 ${status === 'active' ? 'text-[#FAF8F5]' : status === 'completed' ? 'text-[#FAF8F5]/80' : 'text-[#FAF8F5]/40'}`}>
                                            {stage.label}
                                        </span>
                                        
                                        {/* Action description / link for active stage */}
                                        <div className="h-6 mt-1 overflow-hidden">
                                            {status === 'active' && (
                                                <Link 
                                                    to={resumeLink} 
                                                    className="text-xs text-[#C9A84C] hover:text-[#FAF8F5] transition-colors flex items-center gap-1 w-fit group/link"
                                                >
                                                    Resume action
                                                    <ChevronRight size={12} className="group-hover/link:translate-x-1 transition-transform" />
                                                </Link>
                                            )}
                                            {status === 'completed' && (
                                                <span className="text-[11px] text-[#FAF8F5]/40 font-['JetBrains_Mono'] hidden sm:block">Completed</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full bg-[#14141B] border border-[#2A2A35] rounded-3xl p-5 sm:p-6 mb-8 shadow-sm flex flex-col gap-6 ${className}`}>
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-[#FAF8F5] font-semibold tracking-tight text-lg">Your Buying Journey</h2>
                    <p className="text-[#FAF8F5]/60 text-sm mt-1">Track your progress toward the right car and the right deal.</p>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                {STAGES.map((stage, index) => {
                    const status = index < currentIndex ? 'completed' : index === currentIndex ? 'active' : 'upcoming';
                    const isExpanded = expandedStage === index;
                    
                    // Filter tasks based on advisory
                    const visibleTasks = stage.checklists.filter(t => !t.reqAdvisory || hasPurchasedAdvisory);

                    return (
                        <div key={stage.id} className={`border rounded-2xl overflow-hidden transition-colors ${isExpanded ? 'bg-[#1C1C24] border-[#2A2A35]' : 'bg-[#1A1A24]/40 border-transparent hover:bg-[#1A1A24]'}`}>
                            {/* Header Button */}
                            <button 
                                onClick={() => setExpandedStage(isExpanded ? null : index)}
                                className="w-full flex items-center gap-4 p-4 sm:p-5 text-left"
                            >
                                <div className={`
                                    w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300
                                    ${status === 'completed' ? 'bg-[#C9A84C] border-[#C9A84C] text-[#0D0D12]' : ''}
                                    ${status === 'active' ? 'bg-transparent border-[#C9A84C] text-[#C9A84C]' : ''}
                                    ${status === 'upcoming' ? 'bg-[#14141B] border-[#2A2A35] text-[#FAF8F5]/30' : ''}
                                `}>
                                    {status === 'completed' ? <Check size={16} strokeWidth={3} /> : <span className="text-xs sm:text-sm font-bold font-['JetBrains_Mono']">{index + 1}</span>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-semibold sm:text-lg ${status === 'active' ? 'text-[#FAF8F5]' : 'text-[#FAF8F5]/90'}`}>{stage.label}</h3>
                                    <p className="text-xs sm:text-sm text-[#FAF8F5]/50 truncate">{stage.desc}</p>
                                </div>
                                <div className="shrink-0 text-[#FAF8F5]/30">
                                    <ChevronDown size={20} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                </div>
                            </button>

                            {/* Expanded Content */}
                            {isExpanded && (
                                <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-[#2A2A35]/50 animate-fade-in flex flex-col gap-5">
                                    {/* Checklist */}
                                    {visibleTasks.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-['JetBrains_Mono'] text-[#FAF8F5]/40 uppercase tracking-widest mb-3">Checklist actions</h4>
                                            <div className="space-y-2.5">
                                                {visibleTasks.map((task) => {
                                                    const checked = checkTask(task);
                                                    return (
                                                        <div key={task.id} className="flex sm:items-center gap-3 group">
                                                            <button 
                                                                onClick={() => handleToggle(task)}
                                                                disabled={task.type === 'system'}
                                                                className={`mt-0.5 sm:mt-0 w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-colors
                                                                    ${checked ? 'bg-[#C9A84C] border-[#C9A84C] text-[#0D0D12]' : 'bg-transparent border-[#FAF8F5]/20 group-hover:border-[#FAF8F5]/40 text-transparent'}
                                                                    ${task.type === 'system' ? 'cursor-default opacity-80' : 'cursor-pointer'}
                                                                `}
                                                            >
                                                                <Check size={14} strokeWidth={3} />
                                                            </button>
                                                            <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                                                <span className={`text-sm ${checked ? 'text-[#FAF8F5]/40 line-through' : 'text-[#FAF8F5]/80'}`}>
                                                                    {task.label}
                                                                    {task.type === 'system' && <span className="ml-2 text-[10px] text-[#FAF8F5]/30 no-underline font-['JetBrains_Mono']">(auto-tracked)</span>}
                                                                </span>
                                                                {task.link && !checked && (
                                                                    <Link to={task.link} className="text-xs text-[#C9A84C] hover:text-[#FAF8F5] transition-colors w-fit flex items-center gap-1">
                                                                        Open <ChevronRight size={12} />
                                                                    </Link>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Evaluation Tools */}
                                    {stage.tools.length > 0 && (
                                        <div className="pt-2">
                                            <h4 className="text-xs font-['JetBrains_Mono'] text-[#FAF8F5]/40 uppercase tracking-widest mb-3">Evaluation Tools</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {stage.tools.map((tool) => {
                                                    const Icon = tool.icon;
                                                    return (
                                                        <Link key={tool.id} to={tool.link} className="bg-[#14141B] border border-[#2A2A35] rounded-xl p-4 flex items-start gap-3 hover:border-[#C9A84C]/50 transition-colors group">
                                                            <div className="h-8 w-8 bg-[#FAF8F5]/5 rounded-lg flex items-center justify-center text-[#FAF8F5]/60 group-hover:text-[#C9A84C] group-hover:bg-[#C9A84C]/10 transition-colors">
                                                                <Icon size={16} />
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-[#FAF8F5] text-sm mb-0.5">{tool.label}</div>
                                                                <div className="text-xs text-[#FAF8F5]/40">{tool.desc}</div>
                                                            </div>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
