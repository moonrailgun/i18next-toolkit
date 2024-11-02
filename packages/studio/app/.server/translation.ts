import fs from 'fs-extra';
import fg from 'fast-glob';
import { cosmiconfig } from 'cosmiconfig';
import { get, uniq } from 'lodash-es';
import { resolve, basename } from 'path';

export async function readConfig(): Promise<Record<string, unknown>> {
  const result = await cosmiconfig('i18next-toolkit').search();

  return result?.config;
}

export async function readTranslationFile(
  locale: string,
  namespace: string = 'translation'
): Promise<Record<string, string>> {
  const config = await readConfig();
  const publicDir = String(get(config, 'publicDir', './public'));

  return fs.readJson(
    resolve(publicDir, `./locales/${locale}/${namespace}.json`)
  );
}

export async function readAllTranslationFile() {
  const config = await readConfig();
  const publicDir = String(get(config, 'publicDir', './public'));
  const defaultLocale = get(config, 'defaultLocale', 'en') as string;
  const locales = get(config, 'locales', ['en']) as string[];

  const fileList = await fg(resolve(publicDir, './locales/*/*.json'), {
    cwd: process.cwd(),
    absolute: false,
  });

  const namespaces = uniq(
    fileList.map((file) => {
      return basename(file);
    })
  );

  return {
    namespaces,
    fileList,
    defaultLocale,
    locales,
  };
}
