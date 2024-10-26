import { TOptionsBase } from 'i18next';
import { i18next } from './instance';
import { crc32 } from 'crc';

export function getTranslation(lang: string) {
    // Custom t function for custom key management
    const t = (key: string, options?: TOptionsBase & Record<string, unknown>) => {
        try {
            const arr = key.split('::');
            let hashKey = `k${crc32(key).toString(16)}`;
            let defaultValue = key;
            let ns: string | readonly string[] | undefined = options?.ns;
            if (arr.length === 2) {
                ns = arr[0];
                defaultValue = arr[1];

                if (!i18next.hasLoadedNamespace(ns)) {
                    i18next.loadNamespaces(ns);
                }
            }

            const t = i18next.getFixedT(lang, ns)
            let words = t(hashKey, defaultValue);
            if (words === '' || words === hashKey) {
                words = defaultValue;
                console.info(`[i18n] Lost translation: [${hashKey}]${key}`);
            }
            return words;
        } catch (err) {
            console.error(err);
            return key;
        }
    };

    return t
}

