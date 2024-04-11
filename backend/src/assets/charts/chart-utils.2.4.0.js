/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */

function prettifyTime(time) {
  const hourString = String(time.hour).padStart(2, '0');
  const minuteString = String(time.minute).padStart(2, '0');

  return `${hourString}:${minuteString}`;
}

function roundDown(value, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

function prettifyIngredientDrop(ingredientDrop) {
  return ingredientDrop.map(({ amount, ingredient }) => `${roundDown(amount, 1)} ${ingredient.name}`).join(', ');
}

function prettifyProduce(produce) {
  const berries = produce.berries;
  const ings = produce.ingredients;
  return `${roundDown(berries.amount, 2)} ${berries.berry.name} ${
    ings.length > 0 ? `+ ${prettifyIngredientDrop(ings)}` : ''
  }`;
}
