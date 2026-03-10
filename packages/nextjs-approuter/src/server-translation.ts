import fs from 'fs';
import path from 'path';
import { I18nConfig } from './config';
import { TranslationMessages, createTFunction } from './utils';

let _config: I18nConfig | null = null;

export function setServerConfig(config: I18nConfig) {
  _config = config;
}

export function getServerConfig(): I18nConfig {
  if (!_config) {
    throw new Error(
      '[i18n] Server config not initialized. Call createI18nConfig() and pass it to setServerConfig() first.'
    );
  }
  return _config;
}

const messagesCache = new Map<string, TranslationMessages>();

export function loadMessages(
  locale: string,
  config: I18nConfig
): TranslationMessages {
  const cacheKey = locale;
  const cached = messagesCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const messages: TranslationMessages = {};
  const localeDir = path.resolve(process.cwd(), config.localeDir);

  for (const ns of config.namespaces) {
    const filePath = path.join(localeDir, locale, `${ns}.json`);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      messages[ns] = JSON.parse(content);
    } catch {
      messages[ns] = {};
    }
  }

  messagesCache.set(cacheKey, messages);
  return messages;
}

export function clearMessagesCache() {
  messagesCache.clear();
}
