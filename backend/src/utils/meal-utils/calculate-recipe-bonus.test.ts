import { INFERNO_CORN_KEEMA_CURRY } from '../../domain/recipe/curry';

it('shall calc recipe bonus for given recipe', () => {
  const recipe = INFERNO_CORN_KEEMA_CURRY;

  const ingValue = recipe.ingredients.reduce((sum, cur) => sum + cur.amount * cur.ingredient.value, 0);
  const recipeValue = recipe.value;

  expect(recipeValue / ingValue).toMatchInlineSnapshot(`1.48`);
});
