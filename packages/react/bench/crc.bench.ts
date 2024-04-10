import { bench, describe } from 'vitest';
import { crc32 } from 'crc';

describe('crc32', () => {
  bench('simple word', () => {
    crc32('Foooo');
  });

  bench('long word', () => {
    crc32(
      'Suuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuper long word'
    );
  });

  const superLongWord = 'The quick brown fox jumps over the lazy dog'.repeat(
    100
  );

  bench(`super long word, len: ${superLongWord.length}`, () => {
    crc32(superLongWord);
  });
});
