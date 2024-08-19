import { languageDetector, defaultLanguage } from './language';
import HttpApi from 'i18next-http-backend'; // https://github.com/i18next/i18next-http-backend
import { i18next, initI18NInstance } from '@i18next-toolkit/react-core';

initI18NInstance({
  modules: [languageDetector, HttpApi],
  initOptions: {
    fallbackLng: defaultLanguage,
    load: 'currentOnly',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      allowMultiLoading: false,
      addPath: (...args: any[]) => {
        console.log('Lost translate:', ...args);
      },
    },
  },
});

export { i18next };
