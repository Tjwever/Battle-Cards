import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import { fixupPluginRules } from '@eslint/compat'

export default tseslint.config(
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['src/**/*.{ts,tsx}'],
        plugins: {
            react: reactPlugin,
            'react-hooks': fixupPluginRules(reactHooksPlugin),
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            // React
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',

            // TypeScript
            '@typescript-eslint/no-unused-vars': ['warn', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
            }],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/consistent-type-imports': 'warn',

            // General best practices
            'no-console': 'warn',
            'no-debugger': 'error',
            'prefer-const': 'error',
            'no-var': 'error',
            'eqeqeq': ['error', 'always'],
        },
    },
    {
        ignores: ['build/**', 'node_modules/**', 'vite.config.ts', '*.config.js'],
    }
)
