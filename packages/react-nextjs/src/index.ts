import { crc32 } from 'crc';
import {
  Trans,
  appWithTranslation as _appWithTranslation,
  useTranslation as _useTranslation,
  TFunction,
} from 'next-i18next';
import type { AppProps as NextJsAppProps } from 'next/app';
import { useCallback } from 'react';
import { transformConfig } from './utils';

export { Trans };

export function appWithTranslation<Props extends NextJsAppProps>(
  App: React.ComponentType<Props>,
  i18nConfig: Record<string, string>
) {
  return _appWithTranslation(App, transformConfig(i18nConfig) as any);
}

export let t: TFunction = ((key: string) => {
  return key;
}) as TFunction;
let globalTReady = false;

/**
 * onPreInitI18next in next-i18next not work in server side, its maybe have more than one i18n instance.
 * use customTranslation to place
 */
export function useTranslation() {
  const { i18n, ready, t: originT } = _useTranslation();

  const _t = useCallback(
    (key: any, defaultValue?: any, options?: any) => {
      try {
        const hashKey = `k${crc32(key).toString(16)}`;
        let words = originT(hashKey, defaultValue, options);
        if (words === hashKey) {
          words = key;
          console.info(`[i18n] miss translation: [${hashKey}] ${key}`);
        }
        return words;
      } catch (err) {
        console.error(err);
        return key;
      }
    },
    [originT]
  );

  if (!globalTReady) {
    globalTReady = true;
    t = _t as any;
  }

  return {
    i18n,
    ready,
    t: _t,
  };
}
