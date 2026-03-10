'use client';

import { useCallback } from 'react';
import { useTranslation as useI18nextTranslation } from 'react-i18next';
import { useI18nContext } from './context';
import { hashKey } from './utils';
import { useRouter, usePathname } from 'next/navigation';

export function useTranslation() {
  const { i18nInstance } = useI18nContext();
  const { t: i18nT, ready } = useI18nextTranslation();

  const t = useCallback(
    (key: string, options?: Record<string, unknown>): string => {
      try {
        const arr = key.split('::');
        let hk = hashKey(key);
        let defaultValue = key;
        let ns: string | undefined = options?.ns as string | undefined;

        if (arr.length === 2) {
          ns = arr[0];
          defaultValue = arr[1];
          hk = hashKey(key);
        }

        let words = i18nInstance.t(hk, {
          defaultValue,
          ...options,
          ns,
        });

        if (words === '' || words === hk) {
          words = defaultValue;
        }
        return words;
      } catch (err) {
        console.error('[i18n]', err);
        return key;
      }
    },
    [i18nT, i18nInstance]
  );

  return { t, ready, i18n: i18nInstance };
}

export function useLocale(): string {
  const { locale } = useI18nContext();
  return locale;
}

export function useChangeLocale() {
  const { routingStrategy, localeCookieName, locales } = useI18nContext();
  const router = useRouter();
  const pathname = usePathname();

  return useCallback(
    (newLocale: string) => {
      if (!locales.includes(newLocale)) {
        console.warn(`[i18n] Locale "${newLocale}" is not in supported locales`);
        return;
      }

      if (routingStrategy === 'url-segment') {
        const segments = pathname.split('/');
        if (locales.includes(segments[1])) {
          segments[1] = newLocale;
        } else {
          segments.splice(1, 0, newLocale);
        }
        router.push(segments.join('/') || '/');
      } else {
        document.cookie = `${localeCookieName}=${newLocale};path=/;max-age=${365 * 24 * 60 * 60};samesite=lax`;
        router.refresh();
      }
    },
    [routingStrategy, localeCookieName, locales, router, pathname]
  );
}
