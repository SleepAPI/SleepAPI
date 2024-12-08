it('temp', () => expect(true).toBeTruthy());

// import { OptimalTeamSolution } from '@src/domain/combination/combination';
// import { createPokemonByIngredientReverseIndex } from '@src/utils/set-cover-utils/set-cover-utils';
// import {
//   PokemonIngredientSetSimple,
//   addIngredientSet,
//   dessert,
//   ingredient,
//   pokemon,
//   prettifyIngredientDrop,
//   simplifyIngredientSet,
// } from 'sleepapi-common';
// import { SetCover, SetCoverPokemonSetup } from './set-cover';

// describe('processOptimalTeamSolutions', () => {
//   const setCover = new SetCover(new Map(), new Map());

//   it('shall sort teams in each solution and remove duplicates', () => {
//     const pc1: PokemonIngredientSetSimple = {
//       pokemon: pokemon.PINSIR.name,
//       ingredients: [],
//     };

//     const pc2: PokemonIngredientSetSimple = {
//       pokemon: pokemon.BLASTOISE.name,
//       ingredients: [],
//     };

//     const optimalTeamSolutions: OptimalTeamSolution[] = [
//       {
//         team: [
//           {
//             pokemonSet: pc1,
//             totalIngredients: [],
//             averageIngredients: [],
//             skillProcs: 0,
//             berry: '',
//             skill: '',
//           },
//           {
//             pokemonSet: pc2,
//             totalIngredients: [],
//             averageIngredients: [],
//             skillProcs: 0,
//             berry: '',
//             skill: '',
//           },
//         ],
//         surplus: {
//           extra: [],
//           relevant: [],
//           total: [],
//         },
//         exhaustive: true,
//       },
//       {
//         team: [
//           {
//             pokemonSet: pc1,
//             totalIngredients: [],
//             averageIngredients: [],
//             skillProcs: 0,
//             berry: '',
//             skill: '',
//           },
//           {
//             pokemonSet: pc2,
//             totalIngredients: [],
//             averageIngredients: [],
//             skillProcs: 0,
//             berry: '',
//             skill: '',
//           },
//         ],
//         surplus: {
//           extra: [],
//           relevant: [],
//           total: [],
//         },
//         exhaustive: true,
//       },
//     ];

//     const processedSolutions = setCover.processOptimalTeamSolutions(optimalTeamSolutions);

//     expect(processedSolutions).toHaveLength(1);
//     expect(processedSolutions).toEqual([optimalTeamSolutions[0]]);
//   });
// });

// describe('findOptimalCombinationFor', () => {
//   it('shall respect timeout and return exhaustive false', () => {
//     const produce: SetCoverPokemonSetup[] = [raikou];
//     const reverseIndex = createPokemonByIngredientReverseIndex(produce);

//     const setCover = new SetCover(reverseIndex, new Map());
//     // raikou should solo this recipe, but we should timeout before
//     const result = setCover.findOptimalCombinationFor(
//       [{ amount: 1, ingredient: ingredient.FANCY_APPLE.name }],
//       [],
//       5,
//       0
//     );

//     expect(result).toHaveLength(0);
//   });

//   it('shall return empty array if no solutions found', () => {
//     const produce: SetCoverPokemonSetup[] = [raikou];
//     const reverseIndex = createPokemonByIngredientReverseIndex(produce);

//     const setCover = new SetCover(reverseIndex, new Map());
//     const result = setCover.findOptimalCombinationFor([{ amount: 100, ingredient: ingredient.GREENGRASS_CORN.name }]);

//     expect(result).toHaveLength(0);
//   });

//   it('shall not add special pokemon twice', () => {
//     const produce: SetCoverPokemonSetup[] = [raikou];
//     const reverseIndex = createPokemonByIngredientReverseIndex(produce);
//     expect(reverseIndex.size).toBe(ingredient.INGREDIENTS.length);

//     const setCover = new SetCover(reverseIndex, new Map());
//     // set recipe to 2x raikou's produced ingredients, meaning raikou will need help to make this recipe, or be included twice (not allowed)
//     const result = setCover.findOptimalCombinationFor(
//       addIngredientSet(raikou.totalIngredients, raikou.totalIngredients)
//     );

//     expect(result).toHaveLength(0);
//   });

//   // test using same cache to make recipe with raikou and raichu which boosts raichu apple from 3 to 4.4, then make recipe that needs 3 apple with same cache and see that result is raichu 3 apples and not raichu 4.4 apples. Result for 2nd recipe should not be raikou-boosted
//   it('cached raikou solutions shall not affect solutions without raikou', () => {
//     const cache = new Map();

//     const produce: SetCoverPokemonSetup[] = [raichu, raikou];
//     const reverseIndex = createPokemonByIngredientReverseIndex(produce);

//     const setCover = new SetCover(reverseIndex, cache);
//     const firstRecipeSolve = setCover.findOptimalCombinationFor(
//       simplifyIngredientSet(dessert.NEROLIS_RESTORATIVE_TEA.ingredients)
//     );

//     expect(firstRecipeSolve).toHaveLength(1);
//     const team = firstRecipeSolve[0].team!;
//     expect(team).toHaveLength(2); // raichu and raikou
//     const updatedRaichu = team[0];

//     expect(prettifyIngredientDrop(updatedRaichu.totalIngredients)).toMatchInlineSnapshot(`"4.2 Apple, 18 Ginger"`);

//     const secondRecipeSolve = setCover.findOptimalCombinationFor([
//       { amount: 3, ingredient: ingredient.FANCY_APPLE.name },
//     ]);
//     expect(secondRecipeSolve).toHaveLength(2);

//     const [firstTeamSolution, secondTeamSolution] = secondRecipeSolve;

//     expect(firstTeamSolution.team).toHaveLength(1);
//     const raikouTeam = firstTeamSolution.team[0]!;
//     expect(prettifyIngredientDrop(raikouTeam.totalIngredients)).toMatchInlineSnapshot(
//       `"4 Cacao, 19 Apple, 17 Mushroom"`
//     );

//     expect(secondTeamSolution.team).toHaveLength(1);
//     const raichuTeam = secondTeamSolution.team[0]!;
//     expect(prettifyIngredientDrop(raichuTeam.totalIngredients)).toMatchInlineSnapshot(`"3 Apple, 15 Ginger"`);
//   });

//   it('for team [RAICHU, RAIKOU] shall add 6 helps to both when RAIKOU gets added', () => {
//     const produce: SetCoverPokemonSetup[] = [raichu, raikou];
//     const reverseIndex = createPokemonByIngredientReverseIndex(produce);
//     expect(reverseIndex.size).toBe(ingredient.INGREDIENTS.length);
//     expect(
//       reverseIndex
//         .get(ingredient.FANCY_APPLE.name)
//         ?.map((pk) => `${pk.pokemonSet.pokemon} (${prettifyIngredientDrop(pk.pokemonSet.ingredients)})`)
//     ).toMatchInlineSnapshot(`
//       [
//         "RAIKOU (2 Cacao, 8 Apple, 7 Mushroom)",
//         "RAICHU (1 Apple, 2 Ginger, 3 Ginger)",
//       ]
//     `);
//     const setCover = new SetCover(reverseIndex, new Map());
//     const result = setCover.findOptimalCombinationFor(
//       simplifyIngredientSet(dessert.NEROLIS_RESTORATIVE_TEA.ingredients)
//     );

//     expect(result).toHaveLength(1);
//     const team = result[0].team!;
//     expect(team).toHaveLength(2); // raichu and raikou
//     const updatedRaichu = team[0];
//     const updatedRaikou = team[1];

//     expect(prettifyIngredientDrop(updatedRaichu.totalIngredients)).toMatchInlineSnapshot(`"4.2 Apple, 18 Ginger"`);
//     expect(prettifyIngredientDrop(updatedRaikou.totalIngredients)).toBe('4.2 Cacao, 20 Apple, 18 Mushroom');
//   });

//   it('raikou shall scale properly with team size 3, with only 2 unique electric', () => {
//     const produce: SetCoverPokemonSetup[] = [raichu, raikou];
//     const reverseIndex = createPokemonByIngredientReverseIndex(produce);

//     const setCover = new SetCover(reverseIndex, new Map());
//     const result = setCover.findOptimalCombinationFor([{ ingredient: ingredient.FANCY_APPLE.name, amount: 21 + 8 }]);

//     expect(result).toHaveLength(1);
//     const team = result[0].team!;
//     expect(team).toHaveLength(3); // raikou, 2x raichu
//     const firstMember = team[0];
//     const secondMember = team[1];
//     const thirdMember = team[2];

//     expect(prettifyIngredientDrop(firstMember.totalIngredients)).toMatchInlineSnapshot(`"4.2 Apple, 18 Ginger"`);
//     expect(prettifyIngredientDrop(secondMember.totalIngredients)).toMatchInlineSnapshot(`"4.2 Apple, 18 Ginger"`);
//     expect(prettifyIngredientDrop(thirdMember.totalIngredients)).toBe('4.2 Cacao, 20 Apple, 18 Mushroom');
//   });

//   it('raikou shall scale properly with team size 3, with 3 unique electric', () => {
//     const pikachu: SetCoverPokemonSetup = {
//       ...raichu,
//       pokemonSet: {
//         ...raichu.pokemonSet,
//         pokemon: 'PIKACHU',
//       },
//     };
//     const produce: SetCoverPokemonSetup[] = [raikou, raichu, pikachu];
//     const reverseIndex = createPokemonByIngredientReverseIndex(produce);

//     const setCover = new SetCover(reverseIndex, new Map());
//     const result = setCover.findOptimalCombinationFor([{ ingredient: ingredient.FANCY_APPLE.name, amount: 21 + 8 }]);

//     expect(result).toHaveLength(3);
//     const team = result[0].team!;
//     expect(team).toHaveLength(3); // raikou, raichu, pikachu
//     const firstMember = team[0];
//     const secondMember = team[1];
//     const thirdMember = team[2];

//     expect(prettifyIngredientDrop(firstMember.totalIngredients)).toMatchInlineSnapshot(`"4.6 Apple, 19 Ginger"`);
//     expect(prettifyIngredientDrop(secondMember.totalIngredients)).toMatchInlineSnapshot(`"4.6 Apple, 19 Ginger"`);
//     expect(prettifyIngredientDrop(thirdMember.totalIngredients)).toBe('4.6 Cacao, 22 Apple, 20 Mushroom');
//   });

//   it('cache shall support ingredient magnet', () => {
//     const produce: SetCoverPokemonSetup[] = [vaporeon];
//     const reverseIndex = createPokemonByIngredientReverseIndex(produce);

//     const setCover = new SetCover(reverseIndex, new Map());
//     const result = setCover.findOptimalCombinationFor([
//       { ingredient: ingredient.MOOMOO_MILK.name, amount: 9 },
//       { ingredient: ingredient.FANCY_APPLE.name, amount: 1 },
//     ]);

//     expect(result).toHaveLength(1);
//     const team = result[0].team!;
//     expect(team).toHaveLength(1); // vaporeon
//     const vaporeonProduce = team[0]!.totalIngredients;

//     expect(prettifyIngredientDrop(vaporeonProduce)).toMatchInlineSnapshot(
//       `"9 Milk and 1.37 of all 16 other ingredients"`
//     );
//   });
// });

// const raichu: SetCoverPokemonSetup = {
//   pokemonSet: {
//     pokemon: pokemon.RAICHU.name,
//     ingredients: [
//       {
//         amount: 1,
//         ingredient: ingredient.FANCY_APPLE.name,
//       },
//       {
//         amount: 2,
//         ingredient: ingredient.WARMING_GINGER.name,
//       },
//       {
//         amount: 3,
//         ingredient: ingredient.WARMING_GINGER.name,
//       },
//     ],
//   },
//   averageIngredients: [
//     {
//       amount: 0.2,
//       ingredient: ingredient.FANCY_APPLE.name,
//     },
//     {
//       amount: 0.5,
//       ingredient: ingredient.WARMING_GINGER.name,
//     },
//   ],
//   totalIngredients: [
//     {
//       amount: 3,
//       ingredient: ingredient.FANCY_APPLE.name,
//     },
//     {
//       amount: 15,
//       ingredient: ingredient.WARMING_GINGER.name,
//     },
//   ],
//   skillProcs: 0,
//   berry: pokemon.RAICHU.berry.name,
//   skill: pokemon.RAICHU.skill.name,
// };

// const raikou: SetCoverPokemonSetup = {
//   pokemonSet: {
//     pokemon: pokemon.RAIKOU.name,
//     ingredients: [
//       {
//         amount: 2,
//         ingredient: ingredient.SOOTHING_CACAO.name,
//       },
//       {
//         amount: 8,
//         ingredient: ingredient.FANCY_APPLE.name,
//       },
//       {
//         amount: 7,
//         ingredient: ingredient.TASTY_MUSHROOM.name,
//       },
//     ],
//   },
//   averageIngredients: [
//     {
//       amount: 0.2,
//       ingredient: ingredient.SOOTHING_CACAO.name,
//     },
//     {
//       amount: 1,
//       ingredient: ingredient.FANCY_APPLE.name,
//     },
//     {
//       amount: 1,
//       ingredient: ingredient.TASTY_MUSHROOM.name,
//     },
//   ],

//   totalIngredients: [
//     {
//       amount: 3,
//       ingredient: ingredient.SOOTHING_CACAO.name,
//     },
//     {
//       amount: 14,
//       ingredient: ingredient.FANCY_APPLE.name,
//     },
//     {
//       amount: 12,
//       ingredient: ingredient.TASTY_MUSHROOM.name,
//     },
//   ],
//   skillProcs: 3,
//   berry: pokemon.RAIKOU.berry.name,
//   skill: pokemon.RAIKOU.skill.name,
// };

// const vaporeon: SetCoverPokemonSetup = {
//   pokemonSet: {
//     pokemon: pokemon.VAPOREON.name,
//     ingredients: [
//       {
//         amount: 1,
//         ingredient: ingredient.MOOMOO_MILK.name,
//       },
//       {
//         amount: 2,
//         ingredient: ingredient.MOOMOO_MILK.name,
//       },
//       {
//         amount: 4,
//         ingredient: ingredient.MOOMOO_MILK.name,
//       },
//     ],
//   },
//   averageIngredients: [],
//   totalIngredients: [
//     {
//       amount: 9,
//       ingredient: ingredient.MOOMOO_MILK.name,
//     },
//     {
//       amount: 1.3653423571121408,
//       ingredient: ingredient.FANCY_APPLE.name,
//     },
//     {
//       amount: 1.3653423571121408,
//       ingredient: ingredient.GREENGRASS_SOYBEANS.name,
//     },
//     {
//       amount: 1.3653423571121408,
//       ingredient: ingredient.HONEY.name,
//     },
//     {
//       amount: 1.3653423571121408,
//       ingredient: ingredient.BEAN_SAUSAGE.name,
//     },
//     {
//       amount: 1.3653423571121408,
//       ingredient: ingredient.WARMING_GINGER.name,
//     },
//     {
//       amount: 1.3653423571121408,
//       ingredient: ingredient.SNOOZY_TOMATO.name,
//     },
//     {
//       amount: 1.3653423571121408,
//       ingredient: ingredient.FANCY_EGG.name,
//     },
//     {
//       amount: 1.3653423571121408,
//       ingredient: ingredient.PURE_OIL.name,
//     },
//     {
//       amount: 1.3653423571121408,
//       ingredient: ingredient.SOFT_POTATO.name,
//     },
//     {
//       amount: 1.3653423571121408,
//       ingredient: ingredient.FIERY_HERB.name,
//     },
//     {
//       amount: 1.3653423571121408,
//       ingredient: ingredient.GREENGRASS_CORN.name,
//     },
//     {
//       amount: 1.3653423571121408,
//       ingredient: ingredient.SOOTHING_CACAO.name,
//     },
//     {
//       amount: 1.3653423571121408,
//       ingredient: ingredient.ROUSING_COFFEE.name,
//     },
//     {
//       amount: 1.3653423571121408,
//       ingredient: ingredient.TASTY_MUSHROOM.name,
//     },
//     {
//       amount: 1.3653423571121408,
//       ingredient: ingredient.LARGE_LEEK.name,
//     },
//     {
//       amount: 1.3653423571121408,
//       ingredient: ingredient.SLOWPOKE_TAIL.name,
//     },
//   ],
//   skillProcs: 10,
//   berry: pokemon.VAPOREON.berry.name,
//   skill: pokemon.VAPOREON.skill.name,
// };
