'use client';

import React, { createContext, useContext } from 'react';
import type { i18n } from 'i18next';
import type { RoutingStrategy } from './config';

export interface I18nContextValue {
  locale: string;
  locales: string[];
  defaultLocale: string;
  i18nInstance: i18n;
  routingStrategy: RoutingStrategy;
  localeCookieName: string;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

export function useI18nContext(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error(
      '[i18n] useI18nContext must be used within an I18nProvider'
    );
  }
  return ctx;
}
