import i18next, { TFunction, TOptionsBase } from 'i18next';
import {
  useTranslation as useI18NTranslation,
  initReactI18next,
} from 'react-i18next';
import { crc32 } from 'crc';
import { defaultLanguage, languageDetector } from './language';
import { useState, useEffect } from 'react';
import HttpApi from 'i18next-http-backend'; // https://github.com/i18next/i18next-http-backend
import { Trans } from './Trans';

export { Trans };

i18next
  .use(languageDetector)
  .use(HttpApi)
  .use(initReactI18next)
  .init({
    fallbackLng: defaultLanguage,
    load: 'currentOnly',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      allowMultiLoading: false,
      addPath: (...args: any[]) => {
        console.log('Lost translate:', ...args);
      },
    },
    react: {
      // Reference: https://react.i18next.com/latest/trans-component#i-18-next-options
      hashTransKey(defaultValue: string) {
        // return a key based on defaultValue or if you prefer to just remind you should set a key return false and throw an error
        return `k${crc32(defaultValue).toString(16)}`;
      },
    },
  } as any);

export { i18next };

/**
 * standard t function
 * use for global but not cool for react
 */
export const t = (
  key: string,
  options?: TOptionsBase & Record<string, unknown>
) => {
  try {
    const hashKey = `k${crc32(key).toString(16)}`;
    let words = i18next.t(hashKey, key, options);
    if (words === '' || words === hashKey) {
      words = key;
      console.info(`[i18n] Lost translation: [${hashKey}]${key}`);
    }
    return words;
  } catch (err) {
    console.error(err);
    return key;
  }
};

/**
 * local translation without file
 *
 * @example
 * localTrans({'zh-CN': '你好', 'en-US': 'Hello'});
 */
export function localTrans(trans: Record<string, string>) {
  const lang = i18next.language;
  return trans[lang] ?? trans[defaultLanguage];
}

/**
 * set language
 */
export async function setLanguage(lang: string): Promise<void> {
  return new Promise((resolve, reject) => {
    i18next.changeLanguage(lang, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * i18n for react
 */
export function useTranslation() {
  const { t: i18nT, ready, i18n } = useI18NTranslation();

  const [_t, _setT] = useState<TFunction>(() => t as any);

  useEffect(() => {
    _setT(() => ((...args: any[]) => (t as any)(...args)) as any);
  }, [i18nT]);

  return { t: _t, ready, i18n };
}
