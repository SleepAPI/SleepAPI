import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

/**
 * Get ESM-compatible __dirname and __filename in TypeScript.
 * @returns An object containing `__dirname` and `__filename`.
 */
export function getDirname(importMetaUrl: string): { __dirname: string; __filename: string } {
  const __filename = fileURLToPath(importMetaUrl);
  const __dirname = dirname(__filename);
  return { __dirname, __filename };
}

/**
 * Resolves a path relative to the directory of the current module.
 * @param path - The relative path to resolve.
 * @returns The resolved absolute path.
 */
export function relativePath(path: string, importMetaUrl: string): string {
  const __filename = fileURLToPath(importMetaUrl);
  const __dirname = dirname(__filename);
  return resolve(__dirname, path);
}

/**
 * Joins a path relative to the directory of the current module.
 * @param relativePath - The relative path to join.
 * @param importMetaUrl - Optional `import.meta.url` of the calling module.
 * @returns The joined absolute path.
 */
export function joinPath(relativePath: string, importMetaUrl: string): string {
  const __filename = fileURLToPath(importMetaUrl);
  const __dirname = dirname(__filename);
  return join(__dirname, relativePath);
}
