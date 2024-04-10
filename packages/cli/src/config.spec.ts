import { test, expect } from 'vitest';
import { configSchema } from './config';

test('init config', () => {
  expect(configSchema.parse({})).toEqual({
    defaultLocale: 'en',
    extractor: {
      input: [
        './**/*.{js,jsx,ts,tsx}',
        '!./**/*.spec.{js,jsx,ts,tsx}',
        '!**/node_modules/**',
      ],
      output: './public/locales',
    },
    indentSpaces: 2,
    locales: ['en'],
    namespaces: ['translation'],
    publicDir: './public',
    scanner: {
      autoImport: false,
      ignoreFiles: [],
      ignoreText: [],
      indentationText: '  ',
      source: './**/*.tsx',
      tsconfigPath: './tsconfig.json',
    },
    translator: {
      type: 'prompt',
    },
    verbose: false,
  });
});
