import { SetCoverProductionStats } from '@src/domain/computed/production';
import { berry, dessert, nature, subskill } from 'sleepapi-common';
import { prettifyIngredientDrop } from '../../../utils/json/json-utils';
import { findOptimalSetsForMeal, getOptimalFlexiblePokemon } from './optimal-service';

describe('findOptimalSetsForMeal', () => {
  it('shall find all optimal solutions for a recipe', () => {
    const input: SetCoverProductionStats = {
      level: 60,
      nature: nature.RASH,
      subskills: [subskill.INGREDIENT_FINDER_M, subskill.HELPING_SPEED_M, subskill.INGREDIENT_FINDER_S],
      berries: berry.BERRIES,
      e4eProcs: 0,
      e4eLevel: 6,
      cheer: 0,
      extraHelpful: 0,
      helperBoostProcs: 0,
      helperBoostUnique: 1,
      helperBoostLevel: 6,
      helpingBonus: 0,
      camp: false,
      erb: 0,
      incense: false,
      skillLevel: 6,
      mainBedtime: { hour: 21, minute: 30, second: 0 },
      mainWakeup: { hour: 6, minute: 0, second: 0 },
    };
    const data = findOptimalSetsForMeal(dessert.NEROLIS_RESTORATIVE_TEA.name, input, 1);
    expect(data.teams).toHaveLength(2);
    expect(
      data.teams.map((team) => ({
        team: team.team.map((member) => member.pokemonCombination.pokemon.name),
        surplus: prettifyIngredientDrop(team.surplus.total),
      }))
    ).toMatchInlineSnapshot(`
      [
        {
          "surplus": "3.6 Cacao, 2.8 Apple, 3.6 Mushroom, 6.1 Ginger",
          "team": [
            "ABSOL",
            "RAICHU",
          ],
        },
        {
          "surplus": "3.6 Cacao, 2 Apple, 3.6 Mushroom, 2.2 Ginger",
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
    const input: SetCoverProductionStats = {
      level: 30,
      berries: berry.LAPIS_BERRIES,
      subskills: [subskill.INGREDIENT_FINDER_M, subskill.HELPING_SPEED_M],
      e4eProcs: 5,
      e4eLevel: 6,
      cheer: 0,
      extraHelpful: 0,
      helperBoostProcs: 0,
      helperBoostUnique: 1,
      helperBoostLevel: 6,
      camp: true,
      helpingBonus: 5,
      nature: nature.RASH,
      erb: 0,
      incense: false,
      skillLevel: 6,
      mainBedtime: { hour: 21, minute: 30, second: 0 },
      mainWakeup: { hour: 6, minute: 0, second: 0 },
    };

    const data = getOptimalFlexiblePokemon(input, 50);

    expect(
      data.map(
        (entry) =>
          `${entry.pokemonCombination.pokemon.name}(${prettifyIngredientDrop(entry.pokemonCombination.ingredientList)})`
      )
    ).toMatchInlineSnapshot(`
      [
        "BEWEAR(2 Corn, 5 Corn)",
        "VENUSAUR(2 Honey, 4 Tomato)",
        "VENUSAUR(2 Honey, 5 Honey)",
        "VICTREEBEL(2 Tomato, 4 Potato)",
        "MR_MIME(2 Tomato, 4 Potato)",
        "MEGANIUM(1 Cacao, 2 Cacao)",
        "BEWEAR(2 Corn, 6 Sausage)",
        "VICTREEBEL(2 Tomato, 5 Tomato)",
        "MR_MIME(2 Tomato, 5 Tomato)",
        "GALLADE(1 Apple, 2 Apple)",
        "GARDEVOIR(1 Apple, 2 Apple)",
        "WOBBUFFET(1 Apple, 2 Apple)",
        "LEAFEON(1 Milk, 2 Milk)",
        "ESPEON(1 Milk, 2 Milk)",
        "LUCARIO(1 Oil, 2 Oil)",
        "MEGANIUM(1 Cacao, 3 Honey)",
        "PRIMEAPE(1 Sausage, 2 Sausage)",
        "LEAFEON(1 Milk, 1 Cacao)",
        "ESPEON(1 Milk, 1 Cacao)",
        "LUCARIO(1 Oil, 2 Potato)",
        "PRIMEAPE(1 Sausage, 1 Mushroom)",
        "WOBBUFFET(1 Apple, 1 Mushroom)",
        "GALLADE(1 Apple, 1 Corn)",
        "GARDEVOIR(1 Apple, 1 Corn)",
      ]
    `);
  });
});
