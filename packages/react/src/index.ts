import { i18next, setupI18nInstance } from './instance';

export { t, useTranslation, Trans } from '@i18next-toolkit/react-core';

export { i18next, setupI18nInstance };

/**
 * local translation without file
 *
 * @example
 * localTrans({'zh-CN': '你好', 'en-US': 'Hello'});
 */
export function localTrans(trans: Record<string, string>) {
  const lang = i18next.language;
  return trans[lang] ?? trans['en'];
}

/**
 * set language
 */
export async function setLanguage(lang: string): Promise<void> {
  return new Promise((resolve, reject) => {
    i18next.changeLanguage(lang, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
