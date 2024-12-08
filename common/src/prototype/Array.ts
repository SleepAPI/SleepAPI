export {}; // Makes this file a module, which is needed for global

declare global {
  interface Array<T> {
    _collect<R>(
      filterFn: (value: T, index: number, array: T[]) => boolean,
      mapFn: (value: T, index: number, array: T[]) => R
    ): R[];
  }
}

/**
 * Filters and transforms elements in an array based on provided callbacks.
 * Combines the functionality of `filter` and `map` into a single operation.
 *
 * @template T The type of elements in the input array.
 * @template R The type of elements in the resulting array.
 * @param {function(T, number, T[]): boolean} filterFn - A predicate function to determine which elements to include.
 * Takes the current element, its index, and the array.
 * @param {function(T, number, T[]): R} mapFn - A transformation function to apply to filtered elements.
 * Takes the current element, its index, and the array.
 * @returns {R[]} A new array containing the transformed elements that satisfy the filter condition.
 *
 * @example
 * // Example usage:
 * const numbers = [1, 2, 3, 4, 5];
 * const evenSquares = numbers._collect(
 *   (n) => n % 2 === 0,  // Filter: include only even numbers
 *   (n) => n * n         // Map: square the number
 * );
 * logger.log(evenSquares); // Output: [4, 16]
 */
Array.prototype._collect = function <T, R>(
  this: T[],
  filterFn: (value: T, index: number, array: T[]) => boolean,
  mapFn: (value: T, index: number, array: T[]) => R
): R[] {
  const result: R[] = [];
  for (let i = 0; i < this.length; i++) {
    const value = this[i];
    if (filterFn(value, i, this)) {
      result.push(mapFn(value, i, this));
    }
  }
  return result;
};
