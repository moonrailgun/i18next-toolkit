// @ts-nocheck
/**
 * Fork from `next-i18next`
 */
import fs from 'fs';
import path from 'path';

import { createConfig } from 'next-i18next/dist/commonjs/config/createConfig';
import createClient from 'next-i18next/dist/commonjs/createClient/node';
import { globalI18n } from 'next-i18next/dist/commonjs/appWithTranslation';
import { SSRConfig } from 'next-i18next/dist/commonjs/types';
import { getFallbackForLng, unique } from 'next-i18next/dist/commonjs/utils';
import { Module, Namespace } from 'i18next';
import { transformConfig } from '../utils';

let DEFAULT_CONFIG_PATH = './.i18next-toolkitrc.json';

/**
 * One line expression like `const { I18NEXT_DEFAULT_CONFIG_PATH: DEFAULT_CONFIG_PATH = './next-i18next.config.js' } = process.env;`
 * is breaking the build, so keep it like this.
 *
 * @see https://github.com/i18next/next-i18next/pull/2084#issuecomment-1420511358
 */
if (process.env.I18NEXT_DEFAULT_CONFIG_PATH) {
  DEFAULT_CONFIG_PATH = process.env.I18NEXT_DEFAULT_CONFIG_PATH;
}

type ArrayElementOrSelf<T> = T extends ReadonlyArray<infer U> ? U[] : T[];

export const serverSideTranslations = async (
  initialLocale: string,
  namespacesRequired:
    | ArrayElementOrSelf<Namespace>
    | string
    | string[]
    | undefined = undefined
): Promise<SSRConfig> => {
  if (typeof initialLocale !== 'string') {
    throw new Error(
      'Initial locale argument was not passed into serverSideTranslations'
    );
  }

  let userConfig;
  const configPath = path.resolve(DEFAULT_CONFIG_PATH);

  if (!userConfig && fs.existsSync(configPath)) {
    try {
      const data = fs.readFileSync(configPath, 'utf8');
      const i18nConfig = JSON.parse(data);
      userConfig = {
        ...transformConfig(i18nConfig),
        localePath: path.resolve(
          i18nConfig.publicDir ?? './public',
          './locales'
        ),
      };
    } catch (err) {
      console.error(err);
    }
  }

  if (userConfig === null) {
    throw new Error(
      `[@i18next-toolkit/react-nextjs] was unable to find a user config at ${configPath}`
    );
  }

  const config = createConfig({
    ...userConfig,
    lng: initialLocale,
  });

  const { localeExtension, localePath, fallbackLng, reloadOnPrerender } =
    config;

  if (reloadOnPrerender) {
    await globalI18n?.reloadResources();
  }

  const { i18n, initPromise } = createClient({
    ...config,
    lng: initialLocale,
  });

  await initPromise;

  const hasCustomBackend = userConfig?.use?.some(
    (b: Module) => b.type === 'backend'
  );
  if (hasCustomBackend && namespacesRequired) {
    await i18n.loadNamespaces(
      Array.isArray(namespacesRequired)
        ? (namespacesRequired as string[])
        : (namespacesRequired as string)
    );
  }

  const initialI18nStore: Record<string, any> = {
    [initialLocale]: {},
  };

  getFallbackForLng(initialLocale, fallbackLng ?? false).forEach(
    (lng: string) => {
      initialI18nStore[lng] = {};
    }
  );

  if (!Array.isArray(namespacesRequired)) {
    if (typeof localePath === 'function') {
      throw new Error(
        'Must provide namespacesRequired to serverSideTranslations when using a function as localePath'
      );
    }

    const getLocaleNamespaces = (path: string) =>
      fs.existsSync(path)
        ? fs
            .readdirSync(path)
            .map((file) => file.replace(`.${localeExtension}`, ''))
        : [];

    const namespacesByLocale = Object.keys(initialI18nStore)
      .map((locale) =>
        getLocaleNamespaces(
          path.resolve(process.cwd(), `${localePath}/${locale}`)
        )
      )
      .flat();

    namespacesRequired = unique(namespacesByLocale);
  }

  if (Array.isArray(namespacesRequired)) {
    namespacesRequired.forEach((ns) => {
      for (const locale in initialI18nStore) {
        initialI18nStore[locale][ns] =
          (i18n.services.resourceStore.data[locale] || {})[ns] || {};
      }
    });
  }

  return {
    _nextI18Next: {
      initialI18nStore,
      initialLocale,
      ns: namespacesRequired,
      userConfig: config.serializeConfig ? userConfig : null,
    },
  };
};
