import { MathUtils } from 'src/utils/math-utils/math-utils';
import { describe, expect, it } from 'vitest';

describe('floor', () => {
  it('shall floor to specific decimal precision', () => {
    expect(MathUtils.floor(3.56789, 4)).toBe(3.5678);
  });

  it('shall floor to whole integer', () => {
    expect(MathUtils.floor(3.56789, 0)).toBe(3);
  });

  it('shall calculate and round to 1 decimal negative', () => {
    expect(MathUtils.floor(-0.26, 1)).toBe(-0.2);
  });
});

describe('round', () => {
  it('shall round to one decimal', () => {
    expect(MathUtils.round(1.1111, 1)).toBe(1.1);
  });

  it('shall calculate and round to two decimals', () => {
    expect(MathUtils.round(1.567, 2)).toBe(1.57);
  });

  it('shall calculate and round to four decimals', () => {
    expect(MathUtils.round(1.23456, 4)).toBe(1.2346);
  });

  it('shall calculate and round to 1 decimal negative', () => {
    expect(MathUtils.round(-0.26, 1)).toBe(-0.3);
  });
});
