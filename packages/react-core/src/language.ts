import type { LanguageDetectorAsyncModule } from 'i18next';

export const defaultLanguage = 'en';
const LANGUAGE_KEY = '__i18nt_language';

function getNavigatorLanguage(): string {
  if (!navigator.language) {
    return defaultLanguage;
  }

  return navigator.language;
}

/**
 * Get current language
 */
function getLanguage(): string {
  return window.localStorage.getItem(LANGUAGE_KEY) ?? getNavigatorLanguage();
}

/**
 * Storage language
 * @param lang Language Code
 */
export function saveLanguage(lang: string) {
  window.localStorage.setItem(LANGUAGE_KEY, lang);
}

/**
 * i18n language detection middleware
 */
export const languageDetector: LanguageDetectorAsyncModule = {
  type: 'languageDetector',
  async: true,
  init: () => {},
  detect: (callback) => {
    try {
      const language = getLanguage();
      callback(language);
    } catch (error) {
      callback(defaultLanguage);
    }
  },
  cacheUserLanguage(language) {
    try {
      saveLanguage(language);
    } catch (error) {}
  },
};
