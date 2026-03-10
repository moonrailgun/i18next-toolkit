import { crc32 } from 'crc';

export function hashKey(text: string): string {
  return `k${crc32(text).toString(16)}`;
}

export interface TranslationMessages {
  [namespace: string]: Record<string, string>;
}

/**
 * Create a t function that looks up translations by CRC32 hashed key.
 * Supports `ns::text` syntax for namespaces.
 */
export function createTFunction(
  messages: TranslationMessages,
  defaultNs: string = 'translation'
) {
  return function t(
    key: string,
    options?: Record<string, unknown>
  ): string {
    try {
      const arr = key.split('::');
      let hk = hashKey(key);
      let defaultValue = key;
      let ns: string = (options?.ns as string) ?? defaultNs;

      if (arr.length === 2) {
        ns = arr[0];
        defaultValue = arr[1];
        hk = hashKey(key);
      }

      const nsMessages = messages[ns];
      if (nsMessages && nsMessages[hk] && nsMessages[hk] !== '') {
        let result = nsMessages[hk];

        if (options) {
          for (const [k, v] of Object.entries(options)) {
            if (k === 'ns') continue;
            result = result.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
          }
        }

        return result;
      }

      return defaultValue;
    } catch (err) {
      console.error('[i18n]', err);
      return key;
    }
  };
}

export function parseAcceptLanguage(
  header: string | null,
  supportedLocales: string[]
): string | null {
  if (!header) return null;

  const entries = header
    .split(',')
    .map((entry) => {
      const parts = entry.trim().split(';');
      const locale = parts[0].trim();
      const quality = parts[1]
        ? parseFloat(parts[1].split('=')[1])
        : 1;
      return { locale, quality };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { locale } of entries) {
    if (supportedLocales.includes(locale)) {
      return locale;
    }
    const lang = locale.split('-')[0];
    const match = supportedLocales.find(
      (l) => l === lang || l.startsWith(lang + '-')
    );
    if (match) {
      return match;
    }
  }

  return null;
}
