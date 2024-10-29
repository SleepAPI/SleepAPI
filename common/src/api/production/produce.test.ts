import { describe, expect, it } from 'vitest';
import { emptyProduce } from './produce';

describe('emptyProduce', () => {
  it('shall return empty berries and ingredients', () => {
    expect(emptyProduce()).toMatchInlineSnapshot(`
      {
        "berries": [],
        "ingredients": [],
      }
    `);
  });
});
