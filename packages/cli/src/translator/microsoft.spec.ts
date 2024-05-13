import { describe, expect, test } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { generateTranslationFromMicrosoft } from './microsoft';

describe.runIf(process.env.TEST_MICROSOFT)('microsoft', () => {
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
      const res = await generateTranslationFromMicrosoft(
        {
          fr: {
            k112a7174: 'Usage',
          },
        },
        'en'
      );

      expect(Object.keys(res).length > 0).toBe(true);
      expect(Object.keys(res).length === 1).toBe(true);
    }
  );

  test(
    'generateTranslationFromMicrosoft long message',
    {
      timeout,
    },
    async () => {
      const res = await generateTranslationFromMicrosoft(
        { fr: longTranslation },
        'en'
      );

      expect(Object.keys(res).length > 0).toBe(true);
      expect(Object.keys(JSON.parse(res['fr'])).length).toBe(
        Object.keys(longTranslation).length
      );
    }
  );
});
