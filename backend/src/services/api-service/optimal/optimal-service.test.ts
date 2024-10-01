import { SetCoverProductionStats } from '@src/domain/computed/production';
import { berry, dessert, ingredient, mainskill, nature, prettifyIngredientDrop, subskill } from 'sleepapi-common';
import { findOptimalMonsForIngredient, findOptimalSetsForMeal } from './optimal-service';

describe('findOptimalSetsForMeal', () => {
  it('shall find all optimal solutions for a recipe', () => {
    const input: SetCoverProductionStats = {
      level: 60,
      ribbon: 0,
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
          "surplus": "3.7 Cacao, 3.5 Apple, 4.1 Mushroom, 6.6 Ginger",
          "team": [
            "ABSOL",
            "RAICHU",
          ],
        },
        {
          "surplus": "3.7 Cacao, 2.7 Apple, 4.1 Mushroom, 2.7 Ginger",
          "team": [
            "ABSOL",
            "PIKACHU_HALLOWEEN",
          ],
        },
      ]
    `);
  });
});

describe('findOptimalMonsForIngredient', () => {
  it('shall find all optimal mons for an ingredient', () => {
    const input: SetCoverProductionStats = {
      level: 30,
      ribbon: 0,
      nature: nature.RASH,
      subskills: [],
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
    const teams = findOptimalMonsForIngredient(ingredient.SLOWPOKE_TAIL.name, input, 1).teams.filter(
      (team) => team.surplus.relevant[0].amount >= 0.999
    );
    const pokemonNames = teams.flatMap((team) =>
      team.team
        .filter((member) => member.pokemonCombination.pokemon.skill !== mainskill.INGREDIENT_MAGNET_S)
        .map((member) => member.pokemonCombination.pokemon.name)
    );
    expect(pokemonNames).toHaveLength(2);
    expect(pokemonNames).toContainEqual('SLOWBRO');
    expect(pokemonNames).toContainEqual('SLOWKING');
  });
});
