import { ChatOpenAI } from '@langchain/openai';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { config } from '../config';
import _chunk from 'lodash/chunk';

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

const promptTemplate = PromptTemplate.fromTemplate(
  "Please help me translate those file to `{locale}`, direct give me json format response, don't be verbose:\n\n{json}"
);

export async function translateWithOpenAI(
  locale: string,
  originTranslation: Record<string, string>
) {
  const {
    baseURL = process.env.OPENAPI_HOST,
    apiKey = process.env.OPENAPI_KEY,
    modelName = 'gpt-3.5-turbo',
  } = config.translator?.openai ?? {};

  if (!apiKey) {
    throw new Error(
      'need openai config with `translator.openai` or environment `OPENAPI_KEY`'
    );
  }

  const model = new ChatOpenAI({
    openAIApiKey: apiKey,
    configuration: {
      baseURL,
    },
    modelName,
    temperature: 0,
  });

  const tasks = _chunk(Object.entries(originTranslation), 80).map((item) => ({
    locale,
    json: JSON.stringify(Object.fromEntries(item), null, 2),
  }));

  const res: Record<string, string>[] = await promptTemplate
    .pipe(model)
    .pipe(new JsonOutputParser())
    .batch(tasks);

  const translation = res.reduce((prev, curr) => {
    return {
      ...prev,
      ...curr,
    };
  }, {});

  /**
   * Not very precise
   */
  const usage = await model.getNumTokens(
    promptTemplate.template + JSON.stringify(originTranslation) //+
    // JSON.stringify(translation)
  );

  return { translation, usage };
}
