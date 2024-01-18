import { chunkArray } from './array-utils';

describe('chunkArray', () => {
  it('shall chunk an array into specified sizes', () => {
    const inputArray = [1, 2, 3, 4, 5, 6];
    const chunkSize = 2;

    const chunked = chunkArray(inputArray, chunkSize);
    const result = Array.from(chunked);

    expect(result.length).toBe(3);
    expect(result[0]).toEqual([1, 2]);
    expect(result[1]).toEqual([3, 4]);
    expect(result[2]).toEqual([5, 6]);
  });

  it('shall handle arrays that do not divide evenly', () => {
    const inputArray = [1, 2, 3, 4, 5];
    const chunkSize = 2;

    const chunked = chunkArray(inputArray, chunkSize);
    const result = Array.from(chunked);

    expect(result.length).toBe(3);
    expect(result[0]).toEqual([1, 2]);
    expect(result[1]).toEqual([3, 4]);
    expect(result[2]).toEqual([5]);
  });

  it('shall return an empty array when the input array is empty', () => {
    const inputArray: string[] = [];
    const chunkSize = 2;

    const chunked = chunkArray(inputArray, chunkSize);
    const result = Array.from(chunked);

    expect(result.length).toBe(0);
  });

  it('should handle chunk size larger than the array', () => {
    const inputArray = [1, 2, 3];
    const chunkSize = 5;

    const chunked = chunkArray(inputArray, chunkSize);
    const result = Array.from(chunked);

    expect(result.length).toBe(1);
    expect(result[0]).toEqual([1, 2, 3]);
  });
});
