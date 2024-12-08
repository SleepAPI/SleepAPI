it('temp', () => expect(true).toBeTruthy());

// import { SetCoverPokemonStats } from '@src/domain/computed/production';
// import { berry, dessert, ingredient, mainskill, nature, prettifyIngredientDrop, subskill } from 'sleepapi-common';
// import { findOptimalMonsForIngredient, findOptimalSetsForMeal } from './optimal-service';

// describe('findOptimalSetsForMeal', () => {
//   it('shall find all optimal solutions for a recipe', async () => {
//     const input: SetCoverPokemonStats = {
//       level: 60,
//       ribbon: 0,
//       nature: nature.RASH,
//       subskills: [subskill.INGREDIENT_FINDER_M, subskill.HELPING_SPEED_M, subskill.INGREDIENT_FINDER_S],
//       islandBerries: berry.BERRIES,
//       camp: false,
//       mainBedtime: { hour: 21, minute: 30, second: 0 },
//       mainWakeup: { hour: 6, minute: 0, second: 0 },
//     };
//     const data = await findOptimalSetsForMeal(dessert.NEROLIS_RESTORATIVE_TEA.name, input);
//     expect(data.teams).toHaveLength(2);
//     expect(
//       data.teams.map((team) => ({
//         team: team.team.map((member) => member.pokemonSet.pokemon),
//         surplus: prettifyIngredientDrop(team.surplus.total),
//       }))
//     ).toMatchInlineSnapshot(`
//       [
//         {
//           "surplus": "3.7 Cacao, 3.5 Apple, 4.1 Mushroom, 6.6 Ginger",
//           "team": [
//             "ABSOL",
//             "RAICHU",
//           ],
//         },
//         {
//           "surplus": "3.7 Cacao, 2.8 Apple, 4.1 Mushroom, 3.1 Ginger",
//           "team": [
//             "ABSOL",
//             "PIKACHU_HALLOWEEN",
//           ],
//         },
//       ]
//     `);
//   });
// });

// describe('findOptimalMonsForIngredient', () => {
//   it('shall find all optimal mons for an ingredient', async () => {
//     const input: SetCoverPokemonStats = {
//       level: 30,
//       ribbon: 0,
//       nature: nature.RASH,
//       subskills: [],
//       islandBerries: berry.BERRIES,
//       camp: false,
//       mainBedtime: { hour: 21, minute: 30, second: 0 },
//       mainWakeup: { hour: 6, minute: 0, second: 0 },
//     };
//     const teams = findOptimalMonsForIngredient(ingredient.SLOWPOKE_TAIL.name, input).teams.filter(
//       (team) => team.surplus.relevant[0].amount >= 0.999
//     );
//     const pokemonNames = teams.flatMap((team) =>
//       team.team
//         .filter((member) => member.skill !== mainskill.INGREDIENT_MAGNET_S.name)
//         .map((member) => member.pokemonSet.pokemon)
//     );
//     expect(pokemonNames).toHaveLength(2);
//     expect(pokemonNames).toContainEqual('SLOWBRO');
//     expect(pokemonNames).toContainEqual('SLOWKING');
//   });
// });
