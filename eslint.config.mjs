import js from "@eslint/js";
import reactPlugin from "eslint-plugin-react";

export default [
    js.configs.recommended,
    { ignores: ["dist/**", "node_modules/**", "**/tmp/**", "test*.cjs", "**/*.cjs", "scripts/**"] },
    {
        files: ["src/**/*.jsx", "src/**/*.js"],
        plugins: {
            react: reactPlugin,
        },
        languageOptions: {
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
                ecmaVersion: "latest",
                sourceType: "module",
            },
            globals: {
                document: "readonly",
                sessionStorage: "readonly",
                crypto: "readonly",
                window: "readonly",
                fetch: "readonly",
                console: "readonly",
                setTimeout: "readonly",
                clearTimeout: "readonly",
                setInterval: "readonly",
                clearInterval: "readonly",
                requestAnimationFrame: "readonly",
                cancelAnimationFrame: "readonly",
                localStorage: "readonly",
                URLSearchParams: "readonly",
                alert: "readonly",
                process: "readonly",
                Intl: "readonly",
                navigator: "readonly",
            },
        },
        rules: {
            "react/jsx-uses-react": "error",
            "react/jsx-uses-vars": "error",
        },
    },
];
