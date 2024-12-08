/* eslint-disable @typescript-eslint/no-explicit-any */
export * from './berry/index.js';
export * from './ingredient/index.js';
export * from './pokemon/index.js';
export * from './produce/index.js';
export * from './solve/index.js';
export * from './team/index.js';
export * from './time/index.js';

import { vi } from 'vitest';

export function mocko<T extends Record<string, any>, TKey extends keyof T>(
  module: T,
  functionName: TKey,
  implementation: T[TKey]
) {
  if (typeof module[functionName] !== 'function') {
    throw new Error(`${String(functionName)} is not a function in the provided module.`);
  }

  const mockFn = vi.fn(implementation as T[TKey]);
  vi.spyOn(module, functionName as any).mockImplementation(mockFn as T[TKey]);
  return mockFn;
}
