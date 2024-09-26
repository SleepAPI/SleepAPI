import { describe, expect, it } from 'vitest';
import { capitalize, compactNumber } from './string-utils';

describe('capitalize', () => {
  it('shall capitalize a word', () => {
    expect(capitalize('cAPitALIze')).toEqual('Capitalize');
  });
});

describe('compactNumber', () => {
  it('should return the number as a string if less than 1000', () => {
    expect(compactNumber(500)).toEqual('500');
    expect(compactNumber(999)).toEqual('999');
  });

  it('should return the number in K format for thousands', () => {
    expect(compactNumber(1000)).toEqual('1K');
    expect(compactNumber(1500)).toEqual('1.5K');
    expect(compactNumber(999999)).toEqual('1000K');
  });

  it('should return the number in M format for millions', () => {
    expect(compactNumber(1000000)).toEqual('1M');
    expect(compactNumber(1500000)).toEqual('1.5M');
    expect(compactNumber(2500000)).toEqual('2.5M');
  });

  it('should handle edge cases with rounding', () => {
    expect(compactNumber(1000001)).toEqual('1M');
    expect(compactNumber(1999999)).toEqual('2M');
  });
});
