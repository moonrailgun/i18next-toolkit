import { BaseMessageChunk } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { config } from '../config';

export async function generateTranslationFromOpenai(
  untranslated: Record<string, Record<string, string>>
) {
  const {
    baseURL = process.env.OPENAPI_HOST,
    apiKey = process.env.OPENAPI_KEY,
    modelName,
  } = config.translator?.openai ?? {};

  if (!apiKey) {
    throw new Error('need openai config with `translator.openai`');
  }

  const model = new ChatOpenAI({
    openAIApiKey: apiKey,
    configuration: {
      baseURL,
    },
    modelName,
    temperature: 0,
  });

  const res: Record<string, string> = {};

  for (const locale in untranslated) {
    const json = untranslated[locale];

    if (Object.keys(json).length === 0) {
      console.log(`[${locale}] has no word need to translate, skip.`);
      continue;
    }

    console.log('Is translating:', locale);

    const prompt = `Please help me translate those file to \`${locale}\`, don't be verbose:\n\n${JSON.stringify(
      json,
      null,
      2
    )}`;

    const chunks: BaseMessageChunk[] = [];
    const stream = await model.stream(prompt);

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    res[locale] = chunks.map((c) => String(c.content)).join('');

    console.log(
      'DONE, usage',
      (await model.getNumTokensFromMessages(chunks)).totalCount
    );
  }

  return res;
}
