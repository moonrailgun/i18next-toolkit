import { IndentationText } from '@i18next-toolkit/scanner';
import { cosmiconfigSync } from 'cosmiconfig';
import { z } from 'zod';

const result = cosmiconfigSync('i18next-toolkit').search();

export const configSchema = z.object({
  publicDir: z.string().default('./public'),
  defaultLocale: z.string().default('en'),
  locales: z.array(z.string()).default(['en']),
  transform: z.function().optional(),
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

export const config = configSchema.parse(result?.config ?? {});
