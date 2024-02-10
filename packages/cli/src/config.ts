import { cosmiconfigSync } from 'cosmiconfig';
import { z } from 'zod';

const result = cosmiconfigSync('i18next-toolkit').search();

export const configSchema = z.object({
  publicDir: z.string().default('./public'),
  locales: z.array(z.string()).default(['en']),
  transform: z.function().optional(),
});

export const config = configSchema.parse(result?.config ?? {});
