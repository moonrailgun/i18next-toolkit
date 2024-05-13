import { MET } from 'bing-translate-api';
import _zipObject from 'lodash/zipObject';

export async function generateTranslationFromMicrosoft(
  untranslated: Record<string, Record<string, string>>,
  defaultLocale: string
): Promise<Record<string, string>> {
  const res: Record<string, string> = {};
  for (const locale in untranslated) {
    const json = untranslated[locale];
    if (Object.keys(json).length === 0) {
      console.log(`[${locale}] has no word need to translate, skip.`);
      continue;
    }
    console.log('Is translating:', locale);
    const ret = await MET.translate(Object.values(json), defaultLocale, locale);

    if (!ret) {
      console.error(`Can not translate ${locale}, skip`);
      continue;
    }

    res[locale] = JSON.stringify(
      _zipObject(
        Object.keys(json),
        ret.map((item) => item.translations[0].text)
      )
    );
  }
  return res;
}
