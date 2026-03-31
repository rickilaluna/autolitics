import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        // Large zip lookup table is expected; avoid noisy warnings in CI logs.
        chunkSizeWarningLimit: 2500,
        reportCompressedSize: false,
    },
})
