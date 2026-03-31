import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const vercelSha = process.env.VERCEL_GIT_COMMIT_SHA || ''

// https://vitejs.dev/config/
export default defineConfig({
    define: {
        // Proof of which Git commit Vercel built (empty locally). Helps debug wrong-domain / wrong-project deploys.
        'import.meta.env.VITE_COMMIT_SHA': JSON.stringify(vercelSha),
    },
    plugins: [react()],
    build: {
        // Large zip lookup table is expected; avoid noisy warnings in CI logs.
        chunkSizeWarningLimit: 2500,
        reportCompressedSize: false,
    },
})
