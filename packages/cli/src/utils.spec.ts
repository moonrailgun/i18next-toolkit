import { describe, expect, test } from 'vitest';
import { findSameValueMap, mergeObject } from './utils';

describe('utils', () => {
  test('findSameValueMap', () => {
    expect(
      findSameValueMap(
        {
          a: '1',
          b: '2',
        },
        {
          a: '1',
          b: '3',
        }
      )
    ).toEqual({
      a: '1',
    });
  });

  test('mergeObject', () => {
    const base = {
      a: '1',
      b: '2',
    };

    const obj = {
      a: '3',
    };

    const res = mergeObject(base, obj);

    expect(res).toEqual({
      a: '3',
      b: '2',
    });
    expect(res).not.toBe(base);
  });
});
