import { describe, expect, it, vi } from 'vitest';
import { RandomUtils } from './random-utils';

describe('rollRandomChance', () => {
  it('shall return false for 0% chance', () => {
    expect(RandomUtils.roll(0)).toBeFalsy();
  });

  it('shall return true for 100% chance', () => {
    expect(RandomUtils.roll(1)).toBeTruthy();
  });
});

describe('randomElement', () => {
  it('should return undefined if the array is empty', () => {
    const result = RandomUtils.randomElement([]);
    expect(result).toBeUndefined();
  });

  it('should return an element from the array', () => {
    const array = [1, 2, 3, 4, 5];
    const result = RandomUtils.randomElement(array);
    expect(array).toContain(result);
  });

  it('should return the element at the random index generated', () => {
    const array = ['a', 'b', 'c', 'd'];
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const result = RandomUtils.randomElement(array);
    expect(result).toBe('c');
    vi.restoreAllMocks();
  });

  it('should handle arrays with one element', () => {
    const array = ['onlyElement'];
    const result = RandomUtils.randomElement(array);
    expect(result).toBe('onlyElement');
  });
});
