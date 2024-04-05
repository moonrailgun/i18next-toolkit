import { crc32 } from 'crc';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { languageDetector, defaultLanguage } from './language';
import HttpApi from 'i18next-http-backend'; // https://github.com/i18next/i18next-http-backend

i18next
  .use(languageDetector)
  .use(HttpApi)
  .use(initReactI18next)
  .init({
    fallbackLng: defaultLanguage,
    ns: ['common', 'translation'],
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
