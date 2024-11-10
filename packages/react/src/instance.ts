import HttpApi from 'i18next-http-backend'; // https://github.com/i18next/i18next-http-backend
import {
  i18next,
  initI18NInstance,
  I18NInstanceProps,
} from '@i18next-toolkit/react-core';
import LanguageDetector from 'i18next-browser-languagedetector';

interface ReactI18nInstanceProps extends I18NInstanceProps {
  defaultLanguage?: string;
  supportedLngs?: string[];
}

export function setupI18nInstance(options: ReactI18nInstanceProps = {}) {
  const defaultLanguage = options.defaultLanguage ?? 'en';
  const modules = options.modules ?? [LanguageDetector, HttpApi];
  const supportedLngs = options.supportedLngs ?? undefined;

  initI18NInstance({
    modules,
    namespace: options.namespace,
    initOptions: {
      fallbackLng: defaultLanguage,
      load: 'currentOnly',
      supportedLngs,
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
        allowMultiLoading: false,
        addPath: (...args: any[]) => {
          console.log('Lost translate:', ...args);
        },
      },
      ...options.initOptions,
    },
  });
}

export { i18next };
