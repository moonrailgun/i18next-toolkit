import { IndentationText } from '@i18next-toolkit/scanner';
import { cosmiconfigSync } from 'cosmiconfig';
import { z } from 'zod';

const result = cosmiconfigSync('i18next-toolkit').search();

export const configSchema = z.object({
  publicDir: z
    .string()
    .default('./public')
    .describe('Asset dir which serve static files'),
  defaultLocale: z.string().default('en').describe('Fallback locale language'),
  locales: z.array(z.string()).default(['en']).describe('Supported locales'),
  namespaces: z
    .array(z.string())
    .default(['translation'])
    .describe(
      'namespace to split translation files, use for improve large translation project'
    ),
  transform: z.function().optional(),
  indentSpaces: z
    .number()
    .describe('Indent Spaces when generate json')
    .default(2),
  verbose: z.boolean().default(false),
  extractor: z
    .object({
      input: z
        .array(z.string())
        .default([
          './**/*.{js,jsx,ts,tsx}',
          '!./**/*.spec.{js,jsx,ts,tsx}',
          '!**/node_modules/**',
        ]),
      output: z.string().default('./public/locales'),
    })
    .default({}),
  scanner: z
    .object({
      source: z.string().default('./**/*.tsx'),
      tsconfigPath: z.string().default('./tsconfig.json'),
      indentationText: z
        .nativeEnum(IndentationText)
        .default(IndentationText.TwoSpaces),
      autoImport: z.boolean().default(false),
      ignoreFiles: z.array(z.string()).default([]),
      ignoreText: z.array(z.string()).default([]),
    })
    .default({}),
  translator: z
    .object({
      type: z.enum(['prompt', 'openai', 'microsoft']).default('prompt'),
      openai: z
        .object({
          baseURL: z
            .string()
            .describe('Default is: https://api.openai.com/v1')
            .optional(),
          apiKey: z.string().optional(),
          modelName: z
            .string()
            .describe(
              'Check out this url: https://platform.openai.com/docs/models/overview'
            )
            .default('gpt-4o-mini'),
        })
        .describe('Config with translate file by openai')
        .optional(),
    })
    .default({}),
});

export type I18nextToolkitConfig = z.infer<typeof configSchema>;

export const configExisted = Boolean(result?.config);
export const config = configSchema.parse(result?.config ?? {});
