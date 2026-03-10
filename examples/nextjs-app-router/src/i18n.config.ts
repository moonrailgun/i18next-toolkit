import { createI18nConfig } from '@i18next-toolkit/react-nextjs-approuter';

export const i18nConfig = createI18nConfig({
  locales: ['en', 'zh'],
  defaultLocale: 'en',
  localeDir: './public/locales',
  namespaces: ['translation'],
  routingStrategy: 'url-segment',
});
