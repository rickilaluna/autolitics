import React, { useState } from 'react';
import { ChevronDown, AlertCircle, CheckCircle2, Info, ChevronRight } from 'lucide-react';

export default function DealIntelligenceCard({ 
    status = 'Clean and Competitive', 
    interpretation = 'This structure aligns with regional market averages.',
    quotedTotal = '$42,500',
    expectedRange = '$41,000 - $43,000',
    varianceAmount = '',
    varianceType = 'neutral',
    contributingFactors = [], 
    onActionClick,
    actionLabel = 'Compare Offer'
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Determine status styling
    let statusConfig = { bg: 'bg-[#C9A84C]/10', text: 'text-[#C9A84C]', icon: <CheckCircle2 size={16} className="text-[#C9A84C]" /> };
    
    if (status === 'Above Expected' || status === 'Needs Review') {
        statusConfig = { bg: 'bg-[#0D0D12]/5', text: 'text-[#0D0D12]/70', icon: <AlertCircle size={16} className="text-[#0D0D12]/70" /> };
    } else if (status === 'Unusually Low') {
        statusConfig = { bg: 'bg-blue-500/10', text: 'text-blue-600', icon: <Info size={16} className="text-blue-600" /> };
    }

    const varianceColor = varianceType === 'positive' ? 'text-green-600' : varianceType === 'negative' ? 'text-[#0D0D12]/90' : 'text-[#0D0D12]/70';

    return (
        <div className="bg-white border text-left border-[#0D0D12]/10 rounded-2xl md:rounded-[2rem] shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col hover:border-[#C9A84C]/40 transition-colors duration-300">
            {/* Main visible area */}
            <div 
                className="p-5 md:p-6 cursor-pointer flex flex-col md:flex-row gap-4 md:items-center justify-between group"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {/* Level 1: Summary */}
                <div className="flex-1 min-w-0 md:pr-4">
                    <div className="flex items-center gap-2 mb-2 opacity-90">
                        {statusConfig.icon}
                        <span className={`text-[11px] font-bold uppercase tracking-widest ${statusConfig.text}`}>
                            {status}
                        </span>
                    </div>
                    <h3 className="text-base md:text-lg font-medium tracking-tight text-[#0D0D12] leading-snug">
                        {interpretation}
                    </h3>
                </div>

                {/* Level 2: Key Facts */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 shrink-0 border-t md:border-t-0 border-[#0D0D12]/5 pt-4 md:pt-0 mt-2 md:mt-0">
                    <div className="text-left md:text-right">
                        <p className="text-[10px] font-['JetBrains_Mono'] text-[#0D0D12]/40 uppercase tracking-widest mb-1">Quote Total</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-2xl md:text-3xl font-semibold tracking-tight text-[#0D0D12]">{quotedTotal}</p>
                            {varianceAmount && <span className={`text-xs font-semibold ${varianceColor} bg-[#0D0D12]/5 px-1.5 py-0.5 rounded-md hidden md:inline-block`}>{varianceAmount}</span>}
                        </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                        {varianceAmount && <span className={`text-xs font-semibold ${varianceColor} bg-[#0D0D12]/5 px-2 py-1 rounded-md md:hidden`}>{varianceAmount}</span>}
                        <button className="md:hidden w-8 h-8 rounded-full bg-[#FAF8F5] flex items-center justify-center border border-[#0D0D12]/5">
                            <ChevronDown size={16} className={`text-[#0D0D12]/60 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Desktop Expand Icon */}
                <div className="hidden md:flex shrink-0 ml-4 items-center justify-center w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#0D0D12]/5 group-hover:bg-[#C9A84C]/5 group-hover:border-[#C9A84C]/20 transition-colors duration-300">
                    <ChevronDown size={18} className={`text-[#0D0D12]/50 group-hover:text-[#C9A84C] transition-all duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {/* Level 3: Details Accordion */}
            <div 
                className={`transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] overflow-hidden bg-[#FAF8F5] border-t border-[#0D0D12]/5 ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="p-5 md:p-8 flex flex-col md:flex-row gap-8 md:gap-12">
                    {/* Reasoning facts */}
                    <div className="flex-1 space-y-5">
                        <div className="flex justify-between items-center text-sm border-b border-[#0D0D12]/10 pb-3">
                            <span className="text-[#0D0D12]/60 font-medium tracking-tight">Expected Market Anchor</span>
                            <span className="font-semibold font-['JetBrains_Mono']">{expectedRange}</span>
                        </div>
                        
                        <div>
                            <p className="text-[10px] font-['JetBrains_Mono'] text-[#0D0D12]/40 uppercase tracking-widest mb-3">Contributing Factors</p>
                            {contributingFactors.length > 0 ? (
                                <ul className="space-y-3">
                                    {contributingFactors.map((factor, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm text-[#0D0D12]/80 leading-snug">
                                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#C9A84C] shrink-0 opacity-80" />
                                            {factor}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-[#0D0D12]/50 italic bg-white border border-[#0D0D12]/5 px-4 py-3 rounded-lg">
                                    The quote appears standard with no significant anomalies detected.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Level 4: Next Action */}
                    <div className="shrink-0 flex items-start md:items-end justify-center pt-2 md:pt-0">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                if(onActionClick) onActionClick();
                            }}
                            className="w-full md:w-auto inline-flex justify-center items-center gap-2 bg-[#0D0D12] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#1A1A24] transition-colors group shadow-sm"
                        >
                            {actionLabel} <ChevronRight size={16} className="text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
