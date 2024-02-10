import { buildTranslationFile, defaultTransform } from './index';
import path from 'path';
import { cosmiconfigSync } from 'cosmiconfig';
import { z } from 'zod';

const result = cosmiconfigSync('i18next-toolkit').search();

const config = z
  .object({
    locales: z.array(z.string()),
    transform: z.function().optional(),
  })
  .parse(result?.config);

buildTranslationFile({
  input: ['src/**/*.{ts,tsx}', '!src/**/*.spec.{js,jsx,ts,tsx}'],
  output: path.resolve(process.cwd(), './public/locales'),
  lngs: config.locales,
  transform: config.transform ?? defaultTransform,
});
