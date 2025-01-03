import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';
import { getDirname, joinPath, relativePath } from './file-utils';

describe('file-utils', () => {
  const importMetaUrl = import.meta.url;

  describe('getDirname', () => {
    it('should return correct __dirname and __filename', () => {
      const result = getDirname(importMetaUrl);
      expect(result.__dirname).toBe(dirname(fileURLToPath(importMetaUrl)));
      expect(result.__filename).toBe(fileURLToPath(importMetaUrl));
    });
  });

  describe('relativePath', () => {
    it('should resolve the relative path correctly', () => {
      const relative = './test-folder';
      const result = relativePath(relative, importMetaUrl);
      expect(result).toBe(resolve(dirname(fileURLToPath(importMetaUrl)), relative));
    });
  });

  describe('joinPath', () => {
    it('should join the path correctly', () => {
      const relative = './test-folder';
      const result = joinPath(relative, importMetaUrl);
      expect(result).toBe(join(dirname(fileURLToPath(importMetaUrl)), relative));
    });
  });
});
