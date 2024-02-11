import { describe, expect, test } from 'vitest';
import { stripQuote } from './utils';

describe('utils', () => {
  describe('stripQuote', () => {
    test.each([
      ['"Hello"', 'Hello'],
      ['"Hello World"', 'Hello World'],
      ["'Hello'", 'Hello'],
      ["'Hello World'", 'Hello World'],
      ['Hello', 'Hello'],
      ['Hello World', 'Hello World'],
      ['"', '"'],
      ['""', ''],
      ["'", "'"],
      ["''", ''],
      ['"Hi', '"Hi'],
    ])('%s => %s', (input, output) => {
      expect(stripQuote(input)).toBe(output);
    });
  });
});
