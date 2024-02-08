import { berry, nature, recipe, subskill } from 'sleepapi-common';
import { InputProductionStats } from '../../../domain/computed/production';
import { prettifyIngredientDrop } from '../../../utils/json/json-utils';
import { findOptimalSetsForMeal, getOptimalFlexiblePokemon } from './optimal-service';

describe('findOptimalSetsForMeal', () => {
  it('shall find all optimal solutions for a recipe', () => {
    const input: InputProductionStats = {
      level: 60,
      nature: nature.RASH,
      subskills: [subskill.INGREDIENT_FINDER_M, subskill.HELPING_SPEED_M, subskill.INVENTORY_L],
      berries: berry.BERRIES,
      e4eProcs: 0,
      helpingBonus: 0,
      goodCamp: false,
    };
    const data = findOptimalSetsForMeal(recipe.NEROLIS_RESTORATIVE_TEA.name, input);
    expect(data.teams).toHaveLength(2);
    expect(
      data.teams.map((team) => ({
        team: team.team.map((member) => member.pokemonCombination.pokemon.name),
        producedIngredients: prettifyIngredientDrop(team.surplus.total),
      }))
    ).toMatchInlineSnapshot(`
      [
        {
          "producedIngredients": "3.5 Cacao, 2 Apple, 3.1 Mushroom, 4.4 Ginger",
          "team": [
            "ABSOL",
            "RAICHU",
          ],
        },
        {
          "producedIngredients": "3.5 Cacao, 1.4 Apple, 3.1 Mushroom, 1.7 Ginger",
          "team": [
            "ABSOL",
            "PIKACHU_HALLOWEEN",
          ],
        },
      ]
    `);
  });
});

describe('getOptimalFlexiblePokemon', () => {
  it('shall rank optimal flexible pokemon', () => {
    const input: InputProductionStats = {
      level: 30,
      berries: berry.LAPIS_BERRIES,
      subskills: [subskill.INGREDIENT_FINDER_M, subskill.HELPING_SPEED_M],
      e4eProcs: 5,
      goodCamp: true,
      helpingBonus: 5,
      nature: nature.RASH,
    };

    const data = getOptimalFlexiblePokemon(input, 5000);

    expect(
      data.map(
        (entry) =>
          `${entry.pokemonCombination.pokemon.name}(${prettifyIngredientDrop(entry.pokemonCombination.ingredientList)})`
      )
    ).toMatchInlineSnapshot(`
      [
        "BEWEAR(2 Corn, 5 Corn)",
        "VICTREEBEL(2 Tomato, 4 Potato)",
        "MR_MIME(2 Tomato, 4 Potato)",
        "MEGANIUM(1 Cacao, 2 Cacao)",
        "VENUSAUR(2 Honey, 4 Tomato)",
        "VENUSAUR(2 Honey, 5 Honey)",
        "BEWEAR(2 Corn, 6 Sausage)",
        "VICTREEBEL(2 Tomato, 5 Tomato)",
        "MR_MIME(2 Tomato, 5 Tomato)",
        "GALLADE(1 Apple, 2 Apple)",
        "GARDEVOIR(1 Apple, 2 Apple)",
        "WOBBUFFET(1 Apple, 2 Apple)",
        "LEAFEON(1 Milk, 2 Milk)",
        "ESPEON(1 Milk, 2 Milk)",
        "MEGANIUM(1 Cacao, 3 Honey)",
        "LUCARIO(1 Oil, 2 Oil)",
        "PRIMEAPE(1 Sausage, 2 Sausage)",
        "LEAFEON(1 Milk, 1 Cacao)",
        "ESPEON(1 Milk, 1 Cacao)",
        "LUCARIO(1 Oil, 2 Potato)",
        "PRIMEAPE(1 Sausage, 1 Mushroom)",
        "WOBBUFFET(1 Apple, 1 Mushroom)",
      ]
    `);
  });
});
