import { crc32 } from 'crc';
import i18next, { InitOptions, Module, Newable, NewableModule } from 'i18next';
import { initReactI18next } from 'react-i18next';

export interface I18NInstanceProps {
  modules?: Array<Module | NewableModule<Module> | Newable<Module>>;
  initOptions?: InitOptions;
  namespace?: string[];
}

export function initI18NInstance(options: I18NInstanceProps = {}) {
  let instance = i18next;
  const namespace = options.namespace ?? ['translation'];

  if (options.modules && Array.isArray(options.modules)) {
    for (const m of options.modules) {
      instance = instance.use(m);
    }
  }

  instance.use(initReactI18next).init({
    fallbackLng: 'en',
    ns: namespace,
    react: {
      // Reference: https://react.i18next.com/latest/trans-component#i-18-next-options
      hashTransKey(defaultValue: string) {
        // return a key based on defaultValue or if you prefer to just remind you should set a key return false and throw an error
        return `k${crc32(defaultValue).toString(16)}`;
      },
    },
    ...options.initOptions,
  });

  return instance;
}

export { i18next };
