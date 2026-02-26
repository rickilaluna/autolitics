/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.{js,ts,jsx,tsx}",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#FAF8F5',
                primary: '#0D0D12',
                accent: '#C9A84C',
                text: '#2A2A35',
                ivory: '#FAF8F5',
                obsidian: '#0D0D12',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                drama: ['Playfair Display', 'serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
        },
    },
    plugins: [],
}
