import { PokemonIngredientSet, ingredient, pokemon } from 'sleepapi-common';
import { calculateAverageProduce } from './produce-calculator';

describe('calculateAverageProduce', () => {
  it('shall average a Pokemons produce based on ingredient percentage', () => {
    const averagePokemonCombination: PokemonIngredientSet = {
      pokemon: pokemon.PINSIR,
      ingredientList: [{ amount: 1, ingredient: ingredient.FANCY_APPLE }],
    };
    const ingredientPercentage = 0.5;
    const berriesPerDrop = 1;

    expect(calculateAverageProduce(averagePokemonCombination, ingredientPercentage, berriesPerDrop))
      .toMatchInlineSnapshot(`
      {
        "berries": {
          "amount": 0.5,
          "berry": {
            "name": "LUM",
            "value": 24,
          },
        },
        "ingredients": [
          {
            "amount": 0.5,
            "ingredient": {
              "longName": "Fancy Apple",
              "name": "Apple",
              "taxedValue": 23.7,
              "value": 90,
            },
          },
        ],
      }
    `);
  });
});
