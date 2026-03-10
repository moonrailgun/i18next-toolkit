'use client';

import React, { useMemo } from 'react';
import i18next from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { I18nContext, I18nContextValue } from './context';
import type { TranslationMessages } from './utils';
import type { RoutingStrategy } from './config';
import { hashKey } from './utils';

export interface I18nProviderProps {
  locale: string;
  locales?: string[];
  defaultLocale?: string;
  messages: TranslationMessages;
  routingStrategy?: RoutingStrategy;
  localeCookieName?: string;
  children: React.ReactNode;
}

export function I18nProvider({
  locale,
  locales = [],
  defaultLocale,
  messages,
  routingStrategy = 'url-segment',
  localeCookieName = 'NEXT_LOCALE',
  children,
}: I18nProviderProps) {
  const { instance, contextValue } = useMemo(() => {
    const resources: Record<
      string,
      Record<string, Record<string, string>>
    > = {};
    resources[locale] = {};
    for (const [ns, translations] of Object.entries(messages)) {
      resources[locale][ns] = translations;
    }

    const inst = i18next.createInstance();
    inst.use(initReactI18next).init({
      lng: locale,
      fallbackLng: defaultLocale ?? locale,
      ns: Object.keys(messages),
      defaultNS: 'translation',
      resources,
      interpolation: {
        escapeValue: false,
      },
      react: {
        hashTransKey(defaultValue: string) {
          return hashKey(defaultValue);
        },
      },
    });

    const ctx: I18nContextValue = {
      locale,
      locales,
      defaultLocale: defaultLocale ?? locale,
      i18nInstance: inst,
      routingStrategy,
      localeCookieName,
    };

    return { instance: inst, contextValue: ctx };
  }, [
    locale,
    messages,
    locales,
    defaultLocale,
    routingStrategy,
    localeCookieName,
  ]);

  return (
    <I18nContext.Provider value={contextValue}>
      <I18nextProvider i18n={instance}>{children}</I18nextProvider>
    </I18nContext.Provider>
  );
}
