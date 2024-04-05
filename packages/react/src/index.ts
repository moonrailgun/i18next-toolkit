import { defaultLanguage } from './language';
import { i18next } from './instance';

export { t, useTranslation } from './t';
export { Trans } from './Trans';

export { i18next };

/**
 * local translation without file
 *
 * @example
 * localTrans({'zh-CN': '你好', 'en-US': 'Hello'});
 */
export function localTrans(trans: Record<string, string>) {
  const lang = i18next.language;
  return trans[lang] ?? trans[defaultLanguage];
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
