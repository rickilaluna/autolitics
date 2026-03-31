import React from 'react';

/**
 * Public, no-auth. Use to verify which Git commit Vercel built (VITE_COMMIT_SHA
 * is set at build time from VERCEL_GIT_COMMIT_SHA).
 */
export default function BuildInfo() {
    const sha = import.meta.env.VITE_COMMIT_SHA || '';
    const mode = import.meta.env.MODE || 'unknown';

    return (
        <div className="min-h-screen bg-[#0D0D12] text-[#FAF8F5] font-['JetBrains_Mono'] p-8 text-sm">
            <h1 className="text-lg font-semibold mb-4 text-[#C9A84C]">Build info</h1>
            <pre className="bg-[#14141B] border border-[#2A2A35] rounded-xl p-4 overflow-auto">
                {JSON.stringify(
                    {
                        commit: sha || null,
                        commitShort: sha ? sha.slice(0, 7) : null,
                        mode,
                        note: sha
                            ? 'Set on Vercel from VERCEL_GIT_COMMIT_SHA at build time.'
                            : 'Empty locally or env not injected — expected on dev.',
                    },
                    null,
                    2
                )}
            </pre>
            <p className="text-[#FAF8F5]/50 mt-4 text-xs max-w-xl">
                Open this URL on any Vercel preview or production domain to confirm which revision is deployed without
                logging in.
            </p>
        </div>
    );
}
