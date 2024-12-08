export {}; // Makes this file a module, which is needed for global
// TODO: float and int share same functions essentially, can we combine them instead of duplicating
declare global {
  interface Int16Array {
    _mapUnary(operation: (a: number) => number): Int16Array;
    _mapCombine(other: Int16Array, operation: (a: number, b: number) => number): Int16Array;
    _mapSubClamp(other: Int16Array): Int16Array;
    _mutateUnary(operation: (a: number) => number): Int16Array;
    _mutateCombine(other: Int16Array, operation: (a: number, b: number) => number): Int16Array;
    _mutateAdd(other: Int16Array): Int16Array;
    _mutateSubClamp(other: Int16Array): Int16Array;
  }
}

/**
 * Mutates the Int16Array by applying a binary operation element-wise with another Int16Array.
 * @param other The Int16Array to combine.
 * @param operation Binary function (e.g., (a, b) => a + b).
 * @returns The mutated Int16Array.
 * @example flat1._mutateCombine(flat2, (a, b) => a + b);
 */
Object.defineProperty(Int16Array.prototype, '_mutateCombine', {
  value: function (this: Int16Array, other: Int16Array, operation: (a: number, b: number) => number): Int16Array {
    for (let i = 0; i < this.length; i++) {
      this[i] = operation(this[i], other[i]);
    }
    return this;
  },
  writable: false,
  configurable: false
});

/**
 * Mutates the Int16Array by applying a unary operation to each element.
 * @param operation Unary function (e.g., (a) => Math.sqrt(a)).
 * @returns The mutated Int16Array.
 * @example flat._mutateUnary(a => a * 2);
 */
Object.defineProperty(Int16Array.prototype, '_mutateUnary', {
  value: function (this: Int16Array, operation: (a: number) => number): Int16Array {
    for (let i = 0; i < this.length; i++) {
      this[i] = operation(this[i]);
    }
    return this;
  },
  writable: false,
  configurable: false
});

/**
 * Creates a new Int16Array by applying a binary operation element-wise with another Int16Array.
 * @param other The Int16Array to combine.
 * @param operation Binary function (e.g., (a, b) => a + b).
 * @returns A new Int16Array with the results.
 * @example const sum = flat1._mapCombine(flat2, (a, b) => a + b);
 */
Object.defineProperty(Int16Array.prototype, '_mapCombine', {
  value: function (this: Int16Array, other: Int16Array, operation: (a: number, b: number) => number): Int16Array {
    const result = new Int16Array(this.length);
    for (let i = 0; i < this.length; i++) {
      result[i] = operation(this[i], other[i]);
    }
    return result;
  },
  writable: false,
  configurable: false
});

/**
 * Creates a new Int16Array by applying a unary operation to each element.
 * @param operation Unary function (e.g., (a) => Math.sqrt(a)).
 * @returns A new Int16Array with the results.
 * @example const scaled = flat._mapUnary(a => a * 2);
 */
Object.defineProperty(Int16Array.prototype, '_mapUnary', {
  value: function (this: Int16Array, operation: (a: number) => number): Int16Array {
    const result = new Int16Array(this.length);
    for (let i = 0; i < this.length; i++) {
      result[i] = operation(this[i]);
    }
    return result;
  },
  writable: false,
  configurable: false
});

/**
 * Mutates the Int16Array by adding another Int16Array element-wise.
 * @param other The Int16Array to add to this Int16Array.
 * @returns The mutated Int16Array.
 * @example flat1._mutateAdd(flat2);
 */
Object.defineProperty(Int16Array.prototype, '_mutateAdd', {
  value: function (this: Int16Array, other: Int16Array): Int16Array {
    for (let i = 0; i < this.length; i++) {
      this[i] = this[i] + other[i];
    }

    return this;
  },
  writable: false,
  configurable: false
});

/**
 * Mutates the Int16Array by subtracting another Int16Array element-wise and clamping to a minimum of 0.
 * @param other The Int16Array to subtract from this Int16Array.
 * @returns The mutated Int16Array.
 * @example flat1._mutateSubClamp(flat2);
 */
Object.defineProperty(Int16Array.prototype, '_mutateSubClamp', {
  value: function (this: Int16Array, other: Int16Array): Int16Array {
    for (let i = 0; i < this.length; i++) {
      if (this[i] !== 0) {
        const diff = this[i] - other[i];
        this[i] = diff > 0 ? diff : 0;
      }
    }
    return this;
  },
  writable: false,
  configurable: false
});
/**
 * Returns a new Int16Array where each element is the result of subtracting another Int16Array element-wise
 * and clamping the result to a minimum of 0.
 * @param other The Int16Array to subtract from this Int16Array.
 * @returns A new Int16Array with the results.
 * @example const result = flat1._mapSubClamp(flat2);
 */
Object.defineProperty(Int16Array.prototype, '_mapSubClamp', {
  value: function (this: Int16Array, other: Int16Array): Int16Array {
    const result = new Int16Array(this.length);
    for (let i = 0; i < this.length; i++) {
      if (this[i] !== 0) {
        const diff = this[i] - other[i];
        result[i] = diff > 0 ? diff : 0;
      }
    }
    return result;
  },
  writable: false,
  configurable: false
});
