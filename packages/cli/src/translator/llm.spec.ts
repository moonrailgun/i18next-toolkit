import { describe, expect, test, vi, beforeEach } from 'vitest';

const mockConfig: { translator: { terms: string[] } } = {
  translator: { terms: [] },
};

vi.mock('../config', () => ({
  get config() {
    return mockConfig;
  },
}));

import { generateLLMTranslatePrompt } from './llm';

describe('generateLLMTranslatePrompt', () => {
  beforeEach(() => {
    mockConfig.translator.terms = [];
  });

  test('should contain translation content', () => {
    const prompt = generateLLMTranslatePrompt({
      fr: { key1: 'Hello' },
    });

    expect(prompt).toContain('Please make sure all result should return');
    expect(prompt).toContain('translate those file to `fr`');
    expect(prompt).toContain('Hello');
  });

  test('should not include terms section when terms is empty', () => {
    const prompt = generateLLMTranslatePrompt({
      fr: { key1: 'Hello' },
    });

    expect(prompt).not.toContain('proper nouns');
  });

  test('should include terms as a list when terms provided', () => {
    mockConfig.translator.terms = ['Tianji', 'Webhook', 'Surveily'];

    const prompt = generateLLMTranslatePrompt({
      fr: { key1: 'Hello' },
    });

    expect(prompt).toContain(
      'The following proper nouns MUST be kept in their original form and never translated:'
    );
    expect(prompt).toContain('- Tianji');
    expect(prompt).toContain('- Webhook');
    expect(prompt).toContain('- Surveily');
  });
});
