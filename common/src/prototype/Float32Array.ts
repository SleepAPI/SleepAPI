export {}; // Makes this file a module, which is needed for global

declare global {
  interface Float32Array {
    _mapUnary(operation: (a: number) => number): Float32Array;
    _mapCombine(other: Float32Array, operation: (a: number, b: number) => number): Float32Array;
    _mutateUnary(operation: (a: number) => number): Float32Array;
    _mutateCombine(other: Float32Array, operation: (a: number, b: number) => number): Float32Array;
  }
}

/**
 * Mutates the Float32Array by applying a binary operation element-wise with another Float32Array.
 * @param other The Float32Array to combine.
 * @param operation Binary function (e.g., (a, b) => a + b).
 * @returns The mutated Float32Array.
 * @example flat1._mutateCombine(flat2, (a, b) => a + b);
 */
Object.defineProperty(Float32Array.prototype, '_mutateCombine', {
  value: function (this: Float32Array, other: Float32Array, operation: (a: number, b: number) => number): Float32Array {
    for (let i = 0; i < this.length; i++) {
      this[i] = operation(this[i], other[i]);
    }
    return this;
  },
  writable: false,
  configurable: false
});

/**
 * Mutates the Float32Array by applying a unary operation to each element.
 * @param operation Unary function (e.g., (a) => Math.sqrt(a)).
 * @returns The mutated Float32Array.
 * @example flat._mutateUnary(a => a * 2);
 */
Object.defineProperty(Float32Array.prototype, '_mutateUnary', {
  value: function (this: Float32Array, operation: (a: number) => number): Float32Array {
    for (let i = 0; i < this.length; i++) {
      this[i] = operation(this[i]);
    }
    return this;
  },
  writable: false,
  configurable: false
});

/**
 * Creates a new Float32Array by applying a binary operation element-wise with another Float32Array.
 * @param other The Float32Array to combine.
 * @param operation Binary function (e.g., (a, b) => a + b).
 * @returns A new Float32Array with the results.
 * @example const sum = flat1._mapCombine(flat2, (a, b) => a + b);
 */
Object.defineProperty(Float32Array.prototype, '_mapCombine', {
  value: function (this: Float32Array, other: Float32Array, operation: (a: number, b: number) => number): Float32Array {
    const result = new Float32Array(this.length);
    for (let i = 0; i < this.length; i++) {
      result[i] = operation(this[i], other[i]);
    }
    return result;
  },
  writable: false,
  configurable: false
});

/**
 * Creates a new Float32Array by applying a unary operation to each element.
 * @param operation Unary function (e.g., (a) => Math.sqrt(a)).
 * @returns A new Float32Array with the results.
 * @example const scaled = flat._mapUnary(a => a * 2);
 */
Object.defineProperty(Float32Array.prototype, '_mapUnary', {
  value: function (this: Float32Array, operation: (a: number) => number): Float32Array {
    const result = new Float32Array(this.length);
    for (let i = 0; i < this.length; i++) {
      result[i] = operation(this[i]);
    }
    return result;
  },
  writable: false,
  configurable: false
});
