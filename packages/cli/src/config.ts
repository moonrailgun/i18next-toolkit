import { IndentationText } from '@i18next-toolkit/scanner';
import { cosmiconfigSync } from 'cosmiconfig';
import { z } from 'zod/v4';

const result = cosmiconfigSync('i18next-toolkit').search();

export const configSchema = z.object({
  publicDir: z
    .string()
    .prefault('./public')
    .meta({ description: "Asset dir which serve static files" }),
  defaultLocale: z.string().prefault('en').meta({ description: "Fallback locale language" }),
  locales: z.array(z.string()).prefault(['en']).meta({ description: "Supported locales" }),
  namespaces: z
    .array(z.string())
    .prefault(['translation'])
    .meta({ description: 'namespace to split translation files, use for improve large translation project' }),
  transform: z.instanceof(Function).optional(),
  indentSpaces: z
    .number()
    .prefault(2)
    .meta({ description: 'Indent Spaces when generate json' }),
  verbose: z.boolean().prefault(false),
  extractor: z
    .object({
      input: z
        .array(z.string())
        .prefault([
          './**/*.{js,jsx,ts,tsx}',
          '!./**/*.spec.{js,jsx,ts,tsx}',
          '!**/node_modules/**',
        ]),
      output: z.string().prefault('./public/locales'),
    })
    .prefault({}),
  scanner: z
    .object({
      source: z.string().prefault('./**/*.tsx'),
      tsconfigPath: z.string().prefault('./tsconfig.json'),
      indentationText: z
        .enum(IndentationText)
        .prefault(IndentationText.TwoSpaces),
      autoImport: z.boolean().prefault(false),
      ignoreFiles: z.array(z.string()).prefault([]),
      ignoreText: z.array(z.string()).prefault([]),
    })
    .prefault({}),
  translator: z
    .object({
      type: z.enum(['prompt', 'openai', 'microsoft']).prefault('prompt'),
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
            .prefault('gpt-4o-mini'),
        })
        .meta({ description: 'Config with translate file by openai' })
        .optional(),
    })
    .prefault({}),
});

export type I18nextToolkitConfig = z.infer<typeof configSchema>;

export const configExisted = Boolean(result?.config);
export const config = configSchema.parse(result?.config ?? {});
