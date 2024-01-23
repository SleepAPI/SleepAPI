import { EXPLOSION_POPCORN } from '../../domain/recipe/dessert';

it('shall calc recipe bonus for given recipe', () => {
  const recipe = EXPLOSION_POPCORN;

  const ingValue = recipe.ingredients.reduce((sum, cur) => sum + cur.amount * cur.ingredient.value, 0);
  const recipeValue = recipe.value;

  expect(recipeValue / ingValue).toMatchInlineSnapshot(`1.25`);
});
