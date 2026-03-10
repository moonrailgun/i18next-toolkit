import { crc32 } from 'crc';

export function transformConfig(i18nConfig: any) {
  return {
    i18n: {
      defaultLocale: i18nConfig.defaultLocale ?? 'en',
      locales: i18nConfig.locales ?? ['en'],
      localeDetection: false,
    },
    serializeConfig: false,
    defaultNS: 'translation',
    reloadOnPrerender: process.env.NODE_ENV === 'development',
    react: {
      transSupportBasicHtmlNodes: false,
      hashTransKey(defaultValue: string) {
        // return a key based on defaultValue or if you prefer to just remind you should set a key return false and throw an error
        return `k${crc32(defaultValue).toString(16)}`;
      },
    },
  };
}
