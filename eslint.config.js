import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import { defineConfig } from 'eslint/config';
import vue from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';

export default defineConfig(
  { ignores: ['dist/', '.astro/', 'local/'] },
  js.configs.recommended,
  tseslint.configs.strict,
  astro.configs.recommended,
  vue.configs['flat/recommended'],
  // vue-tsc checks the browser's globals.
  { files: ['**/*.vue'], languageOptions: { parserOptions: { parser: tseslint.parser } }, rules: { 'no-undef': 'off' } },
  // Debug output never ships; errors go to the container's logs.
  { rules: { 'no-console': ['error', { allow: ['error'] }] } },
);
