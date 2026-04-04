/**
 * Shared Tailwind class strings for /admin/vehicles/* edit flows (matches AdminLayout + EngagementBuilder).
 */
export const vPage =
    'w-full max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10 pt-6 pb-24 text-[#FAF8F5] font-[\'Space_Grotesk\']';
/** Narrower column for powertrain / small forms */
export const vPageNarrow =
    'w-full max-w-4xl mx-auto px-4 md:px-8 lg:px-10 pt-6 pb-24 text-[#FAF8F5] font-[\'Space_Grotesk\']';
export const vTitle = 'text-3xl font-semibold tracking-tight text-[#FAF8F5]';
export const vSubtitle = 'text-sm text-[#FAF8F5]/55 font-sans mt-1';
export const vEyebrow = 'text-xs font-[\'JetBrains_Mono\'] text-[#FAF8F5]/40 uppercase tracking-widest mb-2';
export const vLabel =
    'block text-xs font-[\'JetBrains_Mono\'] text-[#FAF8F5]/50 uppercase tracking-wider mb-2';
export const vSectionTitle =
    'text-xl font-semibold text-[#FAF8F5] border-b border-[#2A2A35] pb-3 mb-6';
export const vSubsectionTitle = 'text-lg font-semibold text-[#FAF8F5] mb-4';
export const vPanel = 'bg-[#14141B] rounded-[2rem] border border-[#2A2A35] shadow-sm';
export const vInset = 'bg-[#1A1A24]/80 rounded-2xl border border-[#2A2A35]/80';
export const vPrimaryBtn =
    'inline-flex items-center justify-center gap-2 bg-[#C9A84C] text-[#0D0D12] px-6 py-3 rounded-xl font-semibold hover:bg-[#D4B86A] transition-colors disabled:opacity-50 shadow-sm';
export const vSecondaryBtn =
    'inline-flex items-center justify-center gap-2 border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] px-4 py-2.5 rounded-xl text-sm font-medium hover:border-[#C9A84C]/45 hover:bg-[#C9A84C]/5 transition-colors';
export const vGhostLink =
    'inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium border border-[#2A2A35] text-[#FAF8F5]/90 hover:border-[#C9A84C]/40 hover:text-[#C9A84C] transition-colors';
export const vDestructiveBtn =
    'p-2 rounded-xl text-red-400/90 hover:bg-red-500/10 hover:text-red-300 transition-colors';
export const vTabBtn = (active) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors whitespace-nowrap ${
        active
            ? 'bg-[#1A1A24] text-[#C9A84C] font-semibold border border-[#C9A84C]/25 shadow-sm'
            : 'text-[#FAF8F5]/55 hover:bg-[#1A1A24]/60 border border-transparent'
    }`;
export const vInput =
    'studio-touch-input w-full px-4 py-3 rounded-xl border border-[#2A2A35] bg-[#1A1A24] text-[#FAF8F5] placeholder:text-[#FAF8F5]/25 focus:bg-[#14141B] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 focus:border-[#C9A84C]/60 transition-all font-sans';
export const vSelect = vInput;
export const vTextarea = `${vInput} resize-none`;
