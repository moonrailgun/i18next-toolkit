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
  transform: z.function().optional(),
  indentSpaces: z
    .number()
    .describe('Indent Spaces when generate json')
    .default(2),
  scanner: z
    .object({
      source: z.string().default('./**/*.tsx'),
      tsconfigPath: z.string().default('./tsconfig.json'),
      indentationText: z
        .nativeEnum(IndentationText)
        .default(IndentationText.TwoSpaces),
      autoImport: z.boolean().default(false),
      verbose: z.boolean().default(false),
      ignoreFiles: z.array(z.string()).default([]),
      ignoreText: z.array(z.string()).default([]),
    })
    .default({}),
});

export type I18nextToolkitConfig = z.infer<typeof configSchema>;

export const configExisted = Boolean(result?.config);
export const config = configSchema.parse(result?.config ?? {});
