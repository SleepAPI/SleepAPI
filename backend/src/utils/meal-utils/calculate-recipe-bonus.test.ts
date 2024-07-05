import { MathUtils, dessert } from 'sleepapi-common';

it('shall calc stats for given recipe', () => {
  const recp = dessert.HUGE_POWER_SOY_DONUTS;

  console.log(recp.ingredients);

  const ingValue = recp.ingredients.reduce((sum, cur) => sum + cur.amount * cur.ingredient.value, 0);
  const recipeValue = recp.value;

  expect(MathUtils.round(recipeValue / ingValue, 2)).toMatchInlineSnapshot(`1.35`);
  expect(recp.value).toMatchInlineSnapshot(`5547`);
});
