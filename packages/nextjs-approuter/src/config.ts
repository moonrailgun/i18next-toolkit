export type RoutingStrategy = 'url-segment' | 'cookie-header';

export interface I18nConfig {
  locales: string[];
  defaultLocale: string;
  localeDir: string;
  namespaces: string[];
  routingStrategy: RoutingStrategy;
  localeCookieName: string;
}

export interface I18nConfigInput {
  locales: string[];
  defaultLocale: string;
  localeDir?: string;
  namespaces?: string[];
  routingStrategy?: RoutingStrategy;
  localeCookieName?: string;
}

export function createI18nConfig(input: I18nConfigInput): I18nConfig {
  return {
    locales: input.locales,
    defaultLocale: input.defaultLocale,
    localeDir: input.localeDir ?? './public/locales',
    namespaces: input.namespaces ?? ['translation'],
    routingStrategy: input.routingStrategy ?? 'url-segment',
    localeCookieName: input.localeCookieName ?? 'NEXT_LOCALE',
  };
}
