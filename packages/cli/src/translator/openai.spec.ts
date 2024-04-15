import { describe, expect, test } from 'vitest';
import { translateWithOpenAI } from './openai';
import fs from 'fs-extra';
import path from 'path';
import { config } from 'dotenv';

describe.runIf(process.env.TEST_OPENAI)('openai', () => {
  config();
  const timeout = 120 * 1000;
  const longTranslation = fs.readJsonSync(
    path.resolve(__dirname, './__fixture__/translation.json')
  );

  test(
    'simple',
    {
      timeout,
    },
    async () => {
      const { translation, usage } = await translateWithOpenAI('pl', {
        k112a7174: 'Usage',
      });

      expect(typeof usage === 'number').toBeTruthy();
      expect(Object.keys(translation).length > 0).toBe(true);
      expect(Object.keys(translation).length === 1).toBe(true);
    }
  );

  test.skip(
    'translateWithOpenAI long message',
    {
      timeout,
    },
    async () => {
      const { translation, usage } = await translateWithOpenAI(
        'pl',
        longTranslation
      );

      expect(typeof usage === 'number').toBeTruthy();
      expect(Object.keys(translation).length > 0).toBe(true);
      expect(Object.keys(translation).length).toBe(
        Object.keys(longTranslation).length
      );
    }
  );
});
