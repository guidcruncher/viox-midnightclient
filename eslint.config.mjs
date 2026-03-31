import js from '@eslint/js'
import ts from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from 'eslint-config-prettier'
import globals from 'globals'
import perfectionist from 'eslint-plugin-perfectionist'

export default ts.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'public/**',
      'src/vite-env.d.ts',
      '**/*.d.ts',
    ],
  },

  js.configs.recommended,
  ...ts.configs.recommended,
  ...pluginVue.configs['flat/essential'],

  {
    files: ['src/**/*.vue', 'src/**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        parser: ts.parser,
        extraFileExtensions: ['.vue'],
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      perfectionist,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-case-declarations': 'off',
      'vue/multi-word-component-names': 'off',
      'no-undef': 'off', 
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      'perfectionist/sort-imports': [
        'error',
        {
          type: 'natural',
          order: 'asc',
          newlinesBetween: 1, 
          ignoreCase: true,
          groups: [
            'type',
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'side-effect',
            'unknown',
          ],
        },
      ],
    },
  },

  skipFormatting,
)
