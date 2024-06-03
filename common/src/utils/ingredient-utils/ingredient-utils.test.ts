import { describe, expect, it } from 'vitest';
import { getIngredient, getIngredientNames } from './ingredient-utils';

describe('getIngredient', () => {
  it('shall return ingredient for name', () => {
    expect(getIngredient('Honey')).toMatchInlineSnapshot(`
      {
        "longName": "Honey",
        "name": "Honey",
        "taxedValue": 29.8,
        "value": 101,
      }
    `);
  });

  it('shall lookup ingredient case-insensitive', () => {
    expect(getIngredient('hOneY')).toMatchInlineSnapshot(`
      {
        "longName": "Honey",
        "name": "Honey",
        "taxedValue": 29.8,
        "value": 101,
      }
    `);
  });

  it('shall throw programmer error if ingredient is missing', () => {
    expect(() => getIngredient('missing')).toThrowErrorMatchingInlineSnapshot(
      `[Error: Ingredient with name [missing] does not exist]`,
    );
  });
});

describe('getIngredientNames', () => {
  it('shall get all ingredient names', () => {
    expect(getIngredientNames()).toMatchInlineSnapshot(`
      [
        "Apple",
        "Milk",
        "Soybean",
        "Honey",
        "Sausage",
        "Ginger",
        "Tomato",
        "Egg",
        "Oil",
        "Potato",
        "Herb",
        "Corn",
        "Cacao",
        "Mushroom",
        "Leek",
        "Tail",
      ]
    `);
  });
});
