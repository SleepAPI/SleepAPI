import { describe, expect, it } from 'vitest';
import { defaultZero } from './number-utils';

describe('defaultZero', () => {
  it('shall default to 0 for undefined', () => {
    expect(defaultZero(undefined)).toBe(0);
  });

  it('shall default to 0 for missing', () => {
    expect(defaultZero()).toBe(0);
  });

  it('shall default to 0 for null', () => {
    expect(defaultZero(null)).toBe(0);
  });

  it('shall not default for normal number', () => {
    expect(defaultZero(1)).toBe(1);
  });

  it('shall not default for negative number', () => {
    expect(defaultZero(-1)).toBe(-1);
  });
});
