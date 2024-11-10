import { i18next, initI18NInstance, I18NInstanceProps } from './instance';

export { t, useTranslation } from './t';
export { Trans } from './Trans';

export { i18next, initI18NInstance, type I18NInstanceProps };

/**
 * local translation without file
 *
 * @example
 * localTrans({'zh-CN': '你好', 'en-US': 'Hello'});
 */
export function localTrans(
  trans: Record<string, string>,
  defaultLanguage?: string
) {
  const lang = i18next.language;
  return trans[lang] ?? (defaultLanguage ? trans[defaultLanguage] : '');
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
