import { getIngredientForname, getIngredientNames } from './ingredient-utils';

describe('getIngredientForname', () => {
  it('shall return ingredient for name', () => {
    expect(getIngredientForname('Honey')).toMatchInlineSnapshot(`
      {
        "longName": "Honey",
        "name": "Honey",
        "taxedValue": 29.8,
        "value": 101,
      }
    `);
  });

  it('shall lookup ingredient case-insensitive', () => {
    expect(getIngredientForname('hOneY')).toMatchInlineSnapshot(`
      {
        "longName": "Honey",
        "name": "Honey",
        "taxedValue": 29.8,
        "value": 101,
      }
    `);
  });

  it('shall throw programmer error if ingredient is missing', () => {
    expect(() => getIngredientForname('missing')).toThrowErrorMatchingInlineSnapshot(
      `"Ingredient with name [missing] does not exist"`
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
