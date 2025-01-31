import { OpenAI } from 'openai';
import { config } from '../config';
import _chunk from 'lodash/chunk';
import { ProxyAgent } from 'proxy-agent';

export async function generateTranslationFromOpenai(
  untranslated: Record<string, Record<string, string>>
) {
  const res: Record<string, string> = {};

  for (const locale in untranslated) {
    const json = untranslated[locale];

    if (Object.keys(json).length === 0) {
      console.log(`[${locale}] has no word need to translate, skip.`);
      continue;
    }

    console.log('Is translating:', locale);

    const { translation, usage } = await translateWithOpenAI(locale, json);

    res[locale] = JSON.stringify(translation);

    console.log('DONE, usage tokens:', usage);
  }

  return res;
}

export async function translateWithOpenAI(
  locale: string,
  originTranslation: Record<string, string>
) {
  const {
    baseURL = process.env.OPENAPI_HOST,
    apiKey = process.env.OPENAPI_KEY,
    modelName = 'gpt-4o-mini',
  } = config.translator?.openai ?? {};

  if (!apiKey) {
    throw new Error(
      'need openai config with `translator.openai` or environment `OPENAPI_KEY`'
    );
  }

  const openai = new OpenAI({
    apiKey: apiKey,
    baseURL,
    httpAgent: new ProxyAgent(),
  });

  let translation = {};
  let usage = 0;
  for (const item of _chunk(Object.entries(originTranslation), 80)) {
    const json = JSON.stringify(Object.fromEntries(item), null, 2);

    const chatCompletion = await openai.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: 'user',
          content: `Please help me translate those file to '${locale}', direct give me json format response, don't be verbose:\n\n${json}`,
        },
      ],
      stream: false,
      temperature: 0,
      response_format: {
        type: 'json_object',
      },
    });

    translation = {
      ...translation,
      ...JSON.parse(chatCompletion.choices[0].message.content ?? '{}'),
    };
    usage += chatCompletion.usage?.total_tokens ?? 0;
  }

  return { translation, usage };
}
