import { headers, cookies } from 'next/headers';
import { I18nConfig, I18nConfigInput, createI18nConfig } from './config';
import {
  loadMessages,
  setServerConfig,
  getServerConfig,
} from './server-translation';
import { TranslationMessages, createTFunction } from './utils';

export { createI18nConfig } from './config';
export type { I18nConfig, I18nConfigInput } from './config';
export type { TranslationMessages } from './utils';

export function initServerI18n(config: I18nConfig) {
  setServerConfig(config);
}

export async function getLocale(): Promise<string> {
  const config = getServerConfig();

  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(config.localeCookieName);
  if (localeCookie && config.locales.includes(localeCookie.value)) {
    return localeCookie.value;
  }

  const headersList = await headers();
  const localeHeader = headersList.get('x-locale');
  if (localeHeader && config.locales.includes(localeHeader)) {
    return localeHeader;
  }

  return config.defaultLocale;
}

export async function getMessages(
  locale?: string
): Promise<TranslationMessages> {
  const config = getServerConfig();
  const resolvedLocale = locale ?? (await getLocale());

  if (!config.locales.includes(resolvedLocale)) {
    return loadMessages(config.defaultLocale, config);
  }

  return loadMessages(resolvedLocale, config);
}

export async function getTranslation(locale?: string) {
  const config = getServerConfig();
  const resolvedLocale = locale ?? (await getLocale());
  const messages = await getMessages(resolvedLocale);
  const t = createTFunction(messages);

  return { t, locale: resolvedLocale };
}
