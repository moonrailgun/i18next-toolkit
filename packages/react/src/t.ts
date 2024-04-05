import { TFunction, TOptionsBase } from 'i18next';
import { i18next } from './instance';
import { crc32 } from 'crc';
import { useTranslation as useI18NTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

/**
 * standard t function
 * use for global but not cool for react
 */
export const t = (
  key: string,
  options?: TOptionsBase & Record<string, unknown>
) => {
  try {
    const arr = key.split('::');
    let hashKey = `k${crc32(key).toString(16)}`;
    let defaultValue = key;
    let ns: string | readonly string[] | undefined = options?.ns;
    if (arr.length === 2) {
      ns = arr[0];
      defaultValue = arr[1];

      if (!i18next.hasLoadedNamespace(ns)) {
        i18next.loadNamespaces(ns);
      }
    }

    let words = i18next.t(hashKey, defaultValue, { ...options, ns });
    if (words === '' || words === hashKey) {
      words = defaultValue;
      console.info(`[i18n] Lost translation: [${hashKey}]${key}`);
    }
    return words;
  } catch (err) {
    console.error(err);
    return key;
  }
};

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
