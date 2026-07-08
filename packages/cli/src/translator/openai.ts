import { OpenAI } from 'openai';
import { config } from '../config';
import _chunk from 'lodash/chunk';
import { ProxyAgent } from 'proxy-agent';
import { createHash } from 'crypto';
import { generateOpenAITranslateSystemPrompt } from './llm';

/**
 * Models that only accept the default temperature (1) and reject temperature=0.
 * Matched by prefix, so date-suffixed variants (e.g. gpt-5.5-2026-xx-xx) also match.
 */
const DEFAULT_TEMPERATURE_ONLY_MODELS = ['gpt-5.5'];

export function resolveTranslateTemperature(model: string): number {
  return DEFAULT_TEMPERATURE_ONLY_MODELS.some((prefix) =>
    model.startsWith(prefix)
  )
    ? 1
    : 0;
}

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

/**
 * Test the OpenAI translation prompt against raw source texts, optionally
 * across multiple models, printing the prompt sent and each model's output.
 * Used by the `test-prompt` CLI command and the dev script of the same name.
 */
export async function testTranslatePrompt(options: {
  locale: string;
  texts: string[];
  models?: string[];
}) {
  const { locale, texts } = options;

  const originTranslation: Record<string, string> = {};
  for (const text of texts) {
    const key = 'k' + createHash('md5').update(text).digest('hex').slice(0, 8);
    originTranslation[key] = text;
  }

  const systemPrompt = generateOpenAITranslateSystemPrompt(locale);
  const userContent = JSON.stringify(originTranslation, null, 2);

  console.log(`=== System Prompt (${locale}) ===`);
  console.log(systemPrompt);
  console.log('\n=== Input ===');
  console.log(userContent);

  const {
    baseURL = process.env.OPENAPI_HOST,
    apiKey = process.env.OPENAI_API_KEY ?? process.env.OPENAPI_KEY,
    modelName = 'gpt-4o-mini',
  } = config.translator?.openai ?? {};

  if (!apiKey) {
    throw new Error(
      'need openai config with `translator.openai` or environment `OPENAI_API_KEY`'
    );
  }

  const models =
    options.models && options.models.length > 0 ? options.models : [modelName];

  const openai = new OpenAI({
    apiKey,
    baseURL,
    httpAgent: new ProxyAgent(),
  });

  for (const model of models) {
    try {
      const chatCompletion = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        stream: false,
        temperature: resolveTranslateTemperature(model),
        response_format: {
          type: 'json_object',
        },
      });

      const translation = chatCompletion.choices[0].message.content ?? '';

      console.log(`\n=== Translation (model: ${chatCompletion.model}) ===`);
      console.log(translation);
      console.log(`Tokens: ${chatCompletion.usage?.total_tokens ?? 0}`);
    } catch (err) {
      console.error(`\n=== Translation (model: ${model}) FAILED ===`);
      console.error(err instanceof Error ? err.message : err);
    }
  }
}

export async function translateWithOpenAI(
  locale: string,
  originTranslation: Record<string, string>
) {
  const {
    baseURL = process.env.OPENAPI_HOST,
    apiKey = process.env.OPENAI_API_KEY ?? process.env.OPENAPI_KEY,
    modelName = 'gpt-4o-mini',
  } = config.translator?.openai ?? {};

  if (!apiKey) {
    throw new Error(
      'need openai config with `translator.openai` or environment `OPENAI_API_KEY`'
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
          role: 'system',
          content: generateOpenAITranslateSystemPrompt(locale),
        },
        {
          role: 'user',
          content: json,
        },
      ],
      stream: false,
      temperature: resolveTranslateTemperature(modelName),
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
