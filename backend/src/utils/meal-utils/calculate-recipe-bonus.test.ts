import { dessert } from 'sleepapi-common';

it('shall calc recipe bonus for given recipe', () => {
  const recp = dessert.PETAL_DANCE_CHOCOLATE_TART;

  const ingValue = recp.ingredients.reduce((sum, cur) => sum + cur.amount * cur.ingredient.value, 0);
  const recipeValue = recp.value;

  expect(recipeValue / ingValue).toMatchInlineSnapshot(`1.25`);
});
