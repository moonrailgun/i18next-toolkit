import i18next, { i18n, InitOptions, Module, Newable, NewableModule, TOptionsBase } from 'i18next';

interface ExtendedI18n extends i18n {
    getTranslation(lang: string): (key: string, options?: TOptionsBase & Record<string, unknown>) => string
}
import FsBackend, { FsBackendOptions } from 'i18next-fs-backend';
import { getTranslation } from './t';

interface InstanceProps {
    modules?: Array<Module | NewableModule<Module> | Newable<Module>>;
    initOptions?: InitOptions;
}

export function initI18NInstance(options: InstanceProps = {}) {
    let instance = i18next;

    // Apply FsBackend by default
    instance = instance.use(FsBackend);

    // Apply additional modules if provided
    if (options.modules && Array.isArray(options.modules)) {
        for (const m of options.modules) {
            instance = instance.use(m);
        }
    }

    // Initialize i18next with default and custom options
    instance.init<FsBackendOptions>({
        ns: ['translation'],
        defaultNS: 'translation',
        initImmediate: false,
        backend: {
            loadPath: 'assets/locales/{{lng}}/{{ns}}.json',
        },
        ...options.initOptions,
    });

    // Add getTranslation helper function
    (instance as ExtendedI18n).getTranslation = getTranslation
    return instance as ExtendedI18n;
}

export { i18next };
