import { IndentationText } from '@i18next-toolkit/scanner';
import { cosmiconfigSync } from 'cosmiconfig';
import { z } from 'zod/v4';

const result = cosmiconfigSync('i18next-toolkit').search();

export const configSchema = z.object({
  publicDir: z
    .string()
    .default('./public')
    .meta({ description: 'Asset dir which serve static files' }),
  defaultLocale: z
    .string()
    .default('en')
    .meta({ description: 'Fallback locale language' }),
  locales: z
    .array(z.string())
    .default(['en'])
    .meta({ description: 'Supported locales' }),
  namespaces: z
    .array(z.string())
    .default(['translation'])
    .meta({
      description:
        'namespace to split translation files, use for improve large translation project',
    }),
  transform: z.any().optional(),
  indentSpaces: z
    .number()
    .default(2)
    .meta({ description: 'Indent Spaces when generate json' }),
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
    .default(() => ({
      input: [
        './**/*.{js,jsx,ts,tsx}',
        '!./**/*.spec.{js,jsx,ts,tsx}',
        '!**/node_modules/**',
      ],
      output: './public/locales',
    })),
  scanner: z
    .object({
      source: z.string().default('./**/*.tsx'),
      tsconfigPath: z.string().default('./tsconfig.json'),
      indentationText: z
        .enum(IndentationText)
        .default(IndentationText.TwoSpaces),
      autoImport: z.boolean().default(false),
      ignoreFiles: z.array(z.string()).default([]),
      ignoreText: z.array(z.string()).default([]),
    })
    .default(() => ({
      source: './**/*.tsx',
      tsconfigPath: './tsconfig.json',
      indentationText: IndentationText.TwoSpaces,
      autoImport: false,
      ignoreFiles: [],
      ignoreText: [],
    })),
  translator: z
    .object({
      type: z.enum(['prompt', 'openai', 'microsoft']).default('prompt'),
      openai: z
        .object({
          baseURL: z
            .string()
            .meta({ description: 'Default is: https://api.openai.com/v1' })
            .optional(),
          apiKey: z.string().optional(),
          modelName: z
            .string()
            .describe(
              'Check out this url: https://platform.openai.com/docs/models/overview'
            )
            .default('gpt-4o-mini'),
        })
        .meta({ description: 'Config with translate file by openai' })
        .optional(),
    })
    .default(() => ({
      type: 'prompt' as const,
      openai: undefined,
    })),
});

export type I18nextToolkitConfig = z.infer<typeof configSchema>;

export const configExisted = Boolean(result?.config);
export const config = configSchema.parse(result?.config ?? {});
