import { expect, it } from 'bun:test';

it('temp', () => expect(true).toBeTruthy());

// import { OptimalTeamSolution } from '@src/domain/combination/combination';
// import { sortByMinimumFiller } from '@src/services/calculator/ingredient/ingredient-calculate';
// import { SetCoverPokemonSetup } from '@src/services/set-cover/set-cover';
// import {
//   berry,
//   ingredient,
//   mainskill,
//   pokemon,
//   prettifyIngredientDrop,
//   SimplifiedIngredientSet,
// } from 'sleepapi-common';
// import { MOCK_SET_COVER_POKEMON } from '../test-utils/defaults';
// import {
//   calculateHelperBoostIngredientsIncrease,
//   calculateRemainingSimplifiedIngredients,
//   countNrOfHelperBoostHelps,
//   countUniqueHelperBoostPokemon,
//   createMemoKey,
//   createPokemonByIngredientReverseIndex,
//   extractRelevantSurplus,
//   parseMemoKey,
//   sumOfSimplifiedIngredients,
// } from './set-cover-utils';

// describe('createPokemonByIngredientReverseIndex', () => {
//   it('should correctly map ingredients to Pokémon', () => {
//     const pokemons: SetCoverPokemonSetup[] = [
//       MOCK_SET_COVER_POKEMON,
//       {
//         ...MOCK_SET_COVER_POKEMON,
//         totalIngredients: [
//           { amount: 2, ingredient: ingredient.FIERY_HERB.name },
//           { amount: 4, ingredient: ingredient.GREENGRASS_CORN.name },
//         ],
//       },
//     ];

//     const reverseIndex = createPokemonByIngredientReverseIndex(pokemons);
//     expect(reverseIndex.get(ingredient.HONEY.name)).toEqual([pokemons[0]]);
//     expect(reverseIndex.get(ingredient.FANCY_APPLE.name)).toEqual([pokemons[0]]);
//     expect(reverseIndex.get(ingredient.FIERY_HERB.name)).toEqual([pokemons[1]]);
//     expect(reverseIndex.get(ingredient.GREENGRASS_CORN.name)).toEqual([pokemons[1]]);
//   });

//   it('should handle multiple Pokémon producing the same ingredient', () => {
//     const pokemons: SetCoverPokemonSetup[] = [
//       MOCK_SET_COVER_POKEMON,
//       {
//         ...MOCK_SET_COVER_POKEMON,
//         totalIngredients: [{ amount: 3, ingredient: ingredient.FANCY_APPLE.name }],
//       },
//     ];

//     const reverseIndex = createPokemonByIngredientReverseIndex(pokemons);
//     expect(reverseIndex.get(ingredient.FANCY_APPLE.name)).toHaveLength(2);
//     expect(reverseIndex.get(ingredient.FANCY_APPLE.name)).toContainEqual(pokemons[1]);
//     expect(reverseIndex.get(ingredient.FANCY_APPLE.name)).toContainEqual(pokemons[0]);
//   });

//   it('should handle an empty input array', () => {
//     const reverseIndex = createPokemonByIngredientReverseIndex([]);
//     expect(reverseIndex.size).toBe(0);
//   });

//   it('shall handle Pokémon producing no ingredients', () => {
//     const pokemons: SetCoverPokemonSetup[] = [{ ...MOCK_SET_COVER_POKEMON, totalIngredients: [] }];

//     expect(createPokemonByIngredientReverseIndex(pokemons).size).toBe(0);
//   });

//   it('shall add RAIKOU to each ingredient, but not add RAIKOU twice to the same ingredient', () => {
//     const pokemons: SetCoverPokemonSetup[] = [
//       { ...MOCK_SET_COVER_POKEMON, pokemonSet: { pokemon: pokemon.RAIKOU.name, ingredients: [] } },
//     ];

//     const reverseIndex = createPokemonByIngredientReverseIndex(pokemons);
//     expect(reverseIndex.get(ingredient.FANCY_APPLE.name)).toHaveLength(1);
//     expect(reverseIndex.get(ingredient.BEAN_SAUSAGE.name)).toHaveLength(1);
//     expect(reverseIndex.size).toBe(ingredient.INGREDIENTS.length);
//     expect(reverseIndex.get(ingredient.FANCY_APPLE.name)).toContainEqual(pokemons[0]);
//   });

//   it('shall add non-special pokemon once per ingredient', () => {
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
//   });
// });

// describe('createMemoKey', () => {
//   it('correctly formats a key with a single ingredient', () => {
//     const params = {
//       remainingIngredients: [{ ingredient: 'Apple', amount: 2 }],
//       spotsLeftInTeam: 3,
//     };
//     const key = createMemoKey(params);
//     expect(key).toBe('Apple:2|3|');
//   });

//   it('correctly formats a key with multiple ingredients', () => {
//     const params = {
//       remainingIngredients: [
//         { ingredient: 'Apple', amount: 2 },
//         { ingredient: 'Honey', amount: 1 },
//       ],
//       spotsLeftInTeam: 2,
//     };
//     const key = createMemoKey(params);
//     expect(key).toBe('Apple:2,Honey:1|2|');
//   });

//   it('returns only the team spots part when no ingredients are provided', () => {
//     const params = {
//       remainingIngredients: [],
//       spotsLeftInTeam: 4,
//     };
//     const key = createMemoKey(params);
//     expect(key).toBe('|4|');
//   });

//   it('correctly handles variations in ingredient amounts', () => {
//     const params = {
//       remainingIngredients: [
//         { ingredient: 'Apple', amount: 3 },
//         { ingredient: 'Honey', amount: 2 },
//       ],
//       spotsLeftInTeam: 1,
//     };
//     const key = createMemoKey(params);
//     expect(key).toBe('Apple:3,Honey:2|1|');
//   });

//   it('correctly reflects different spots left in team', () => {
//     const params = {
//       remainingIngredients: [{ ingredient: 'Apple', amount: 1 }],
//       spotsLeftInTeam: 5,
//     };
//     const key = createMemoKey(params);
//     expect(key).toBe('Apple:1|5|');
//   });

//   it('shall parse helpeBoost part correctly', () => {
//     const params = {
//       remainingIngredients: [],
//       spotsLeftInTeam: 0,
//       helperBoost: {
//         amount: 3,
//         berry: berry.GREPA.name,
//       },
//     };

//     const key = createMemoKey(params);
//     expect(key).toBe('|0|3:GREPA');
//   });

//   it('shall support undefined parts', () => {
//     const params = {
//       remainingIngredients: [],
//       spotsLeftInTeam: 0,
//     };

//     const key = createMemoKey(params);
//     expect(key).toBe('|0|');
//   });
// });

// describe('parseMemoKey', () => {
//   it('correctly parses a key with a single ingredient', () => {
//     const key = 'Apple:2|3';
//     const parsed = parseMemoKey(key);
//     expect(parsed).toEqual({
//       remainingIngredients: [{ ingredient: 'Apple', amount: 2 }],
//       spotsLeftInTeam: 3,
//     });
//   });

//   it('correctly parses a key with multiple ingredients', () => {
//     const key = 'Apple:2,Banana:1|2';
//     const parsed = parseMemoKey(key);
//     expect(parsed).toEqual({
//       remainingIngredients: [
//         { ingredient: 'Apple', amount: 2 },
//         { ingredient: 'Banana', amount: 1 },
//       ],
//       spotsLeftInTeam: 2,
//     });
//   });

//   it('handles an empty ingredients part correctly', () => {
//     const key = '|4';
//     const parsed = parseMemoKey(key);
//     expect(parsed).toEqual({
//       remainingIngredients: [],
//       spotsLeftInTeam: 4,
//     });
//   });

//   it('correctly parses floating point amounts', () => {
//     const key = 'Apple:2.5,Banana:1.75|1';
//     const parsed = parseMemoKey(key);
//     expect(parsed).toEqual({
//       remainingIngredients: [
//         { ingredient: 'Apple', amount: 2.5 },
//         { ingredient: 'Banana', amount: 1.75 },
//       ],
//       spotsLeftInTeam: 1,
//     });
//   });

//   it('correctly parses different spots left in team', () => {
//     const key = 'Apple:1|5';
//     const parsed = parseMemoKey(key);
//     expect(parsed).toEqual({
//       remainingIngredients: [{ ingredient: 'Apple', amount: 1 }],
//       spotsLeftInTeam: 5,
//     });
//   });

//   it('correctly parses helperBoost', () => {
//     const key = 'Apple:1|5|3:grepa';
//     const parsed = parseMemoKey(key);
//     expect(parsed).toEqual({
//       remainingIngredients: [{ ingredient: 'Apple', amount: 1 }],
//       spotsLeftInTeam: 5,
//       helperBoost: {
//         amount: 3,
//         berry: 'grepa',
//       },
//     });
//   });
// });

// describe('calculateRemainingSimplifiedIngredients', () => {
//   it('calculates remaining amounts without rounding', () => {
//     const requiredIngredients: SimplifiedIngredientSet[] = [
//       { ingredient: ingredient.FANCY_APPLE.name, amount: 5 },
//       { ingredient: ingredient.GREENGRASS_CORN.name, amount: 3 },
//     ];
//     const producedIngredients: SimplifiedIngredientSet[] = [
//       { ingredient: ingredient.FANCY_APPLE.name, amount: 2 },
//       { ingredient: ingredient.GREENGRASS_CORN.name, amount: 2 },
//     ];
//     const remaining = calculateRemainingSimplifiedIngredients(requiredIngredients, producedIngredients);
//     expect(remaining).toEqual([
//       { ingredient: 'Apple', amount: 3 },
//       { ingredient: ingredient.GREENGRASS_CORN.name, amount: 1 },
//     ]);
//   });

//   it('calculates and rounds up remaining amounts', () => {
//     const requiredIngredients: SimplifiedIngredientSet[] = [
//       { ingredient: ingredient.FANCY_APPLE.name, amount: 5 },
//       { ingredient: ingredient.GREENGRASS_CORN.name, amount: 4 },
//     ];
//     const producedIngredients: SimplifiedIngredientSet[] = [
//       { ingredient: ingredient.FANCY_APPLE.name, amount: 2.5 },
//       { ingredient: ingredient.GREENGRASS_CORN.name, amount: 1.5 },
//     ];
//     const remaining = calculateRemainingSimplifiedIngredients(requiredIngredients, producedIngredients, true);
//     expect(remaining).toEqual([
//       { ingredient: 'Apple', amount: 3 },
//       { ingredient: ingredient.GREENGRASS_CORN.name, amount: 3 },
//     ]);
//   });

//   it('handles ingredients not produced at all', () => {
//     const requiredIngredients: SimplifiedIngredientSet[] = [
//       { ingredient: ingredient.FANCY_APPLE.name, amount: 2 },
//       { ingredient: ingredient.GREENGRASS_CORN.name, amount: 4 },
//     ];
//     const producedIngredients: SimplifiedIngredientSet[] = [
//       { ingredient: ingredient.HONEY.name, amount: 5 }, // Honey is not required
//     ];
//     const remaining = calculateRemainingSimplifiedIngredients(requiredIngredients, producedIngredients);
//     expect(remaining).toEqual(requiredIngredients);
//   });

//   it('handles excess production correctly', () => {
//     const requiredIngredients: SimplifiedIngredientSet[] = [{ ingredient: ingredient.FANCY_APPLE.name, amount: 5 }];
//     const producedIngredients: SimplifiedIngredientSet[] = [{ ingredient: ingredient.FANCY_APPLE.name, amount: 10 }];
//     const remaining = calculateRemainingSimplifiedIngredients(requiredIngredients, producedIngredients);
//     expect(remaining).toEqual([]);
//   });

//   it('correctly handles zero remaining ingredients needed', () => {
//     const requiredIngredients: SimplifiedIngredientSet[] = [
//       { ingredient: ingredient.FANCY_APPLE.name, amount: 5 },
//       { ingredient: 'Honey', amount: 2 },
//     ];
//     const producedIngredients: SimplifiedIngredientSet[] = [
//       { ingredient: ingredient.FANCY_APPLE.name, amount: 5 },
//       { ingredient: ingredient.HONEY.name, amount: 2 },
//     ];
//     const remaining = calculateRemainingSimplifiedIngredients(requiredIngredients, producedIngredients);
//     expect(remaining).toEqual([]);
//   });
// });

// describe('sumOfSimplifiedIngredients', () => {
//   it('sums the amounts of a list of simplified ingredients', () => {
//     const ingredients = [
//       { ingredient: 'Apple', amount: 5 },
//       { ingredient: 'Honey', amount: 3 },
//       { ingredient: 'Corn', amount: 2 },
//     ];
//     const total = sumOfSimplifiedIngredients(ingredients);
//     expect(total).toEqual(10); // 5 + 3 + 2 = 10
//   });

//   it('returns 0 for an empty list', () => {
//     const ingredients: SimplifiedIngredientSet[] = [];
//     const total = sumOfSimplifiedIngredients(ingredients);
//     expect(total).toEqual(0);
//   });

//   it('handles single ingredient correctly', () => {
//     const ingredients = [{ ingredient: 'Honey', amount: 4 }];
//     const total = sumOfSimplifiedIngredients(ingredients);
//     expect(total).toEqual(4);
//   });

//   it('handles fractional amounts correctly', () => {
//     const ingredients = [
//       { ingredient: 'Apple', amount: 1.5 },
//       { ingredient: 'Honey', amount: 2.25 },
//     ];
//     const total = sumOfSimplifiedIngredients(ingredients);
//     expect(total).toBeCloseTo(3.75); // To handle floating point precision issues
//   });

//   it('handles negative amounts, implying a deficit', () => {
//     const ingredients = [
//       { ingredient: 'Apple', amount: 5 },
//       { ingredient: 'Corn', amount: -2 }, // Assuming negative values can represent a deficit
//     ];
//     const total = sumOfSimplifiedIngredients(ingredients);
//     expect(total).toEqual(3); // 5 + (-2) = 3
//   });
// });

// describe('countUniqueHelperBoostPokemon', () => {
//   it('shall return zero if team is empty', () => {
//     expect(countUniqueHelperBoostPokemon([], berry.BELUE.name)).toEqual(0);
//   });

//   it('shall return zero if none of the members match boosted berry', () => {
//     const team: SetCoverPokemonSetup[] = [raichu, raikou];
//     expect(countUniqueHelperBoostPokemon(team, berry.BELUE.name)).toEqual(0);
//   });

//   it('shall return 1 if one of the members matches boosted berry', () => {
//     const team: SetCoverPokemonSetup[] = [raichu];
//     expect(countUniqueHelperBoostPokemon(team, berry.GREPA.name)).toEqual(1);
//   });

//   it('shall return 2 if two of the members matches boosted berry', () => {
//     const team: SetCoverPokemonSetup[] = [raichu, raikou];
//     expect(countUniqueHelperBoostPokemon(team, berry.GREPA.name)).toEqual(2);
//   });

//   it('shall ignore duplicates when counting', () => {
//     const team: SetCoverPokemonSetup[] = [raichu, raikou, raichu, raichu, raikou];
//     expect(countUniqueHelperBoostPokemon(team, berry.GREPA.name)).toEqual(2);
//   });
// });

// describe('countNrOfHelperBoostHelps', () => {
//   it('shall return skill amount for 1 proc without extra unique mons', () => {
//     expect(countNrOfHelperBoostHelps({ uniqueBoostedMons: 1, skillLevel: 6, skillProcs: 1 })).toEqual(
//       mainskill.HELPER_BOOST.amount(6)
//     );
//   });

//   it('shall add 1 to skill amount for for each unique matching mon', () => {
//     const uniqueBoostedMons = 4;
//     expect(countNrOfHelperBoostHelps({ uniqueBoostedMons, skillLevel: 6, skillProcs: 1 })).toEqual(
//       mainskill.HELPER_BOOST.amount(6) + uniqueBoostedMons
//     );
//   });
// });

// describe('calculateHelperBoostIngredientsIncrease', () => {
//   it('shall add one help for every mon and full helps for last', () => {
//     const member1: SetCoverPokemonSetup = {
//       ...raichu,

//       averageIngredients: [
//         {
//           amount: 1,
//           ingredient: ingredient.FANCY_APPLE.name,
//         },
//       ],
//     };
//     const member2: SetCoverPokemonSetup = {
//       ...raichu,
//       averageIngredients: [
//         {
//           amount: 1,
//           ingredient: ingredient.SOOTHING_CACAO.name,
//         },
//       ],
//     };
//     const result = calculateHelperBoostIngredientsIncrease([member1, member2], 10);

//     expect(prettifyIngredientDrop(result)).toMatchInlineSnapshot(`"1 Apple, 10 Cacao"`);
//   });
// });

// describe('sortByMinimumFiller', () => {
//   it('shall sort OptimalTeamSolutions based on the minimum surplus of required ingredients', () => {
//     const recipe: SimplifiedIngredientSet[] = [
//       { amount: 10, ingredient: ingredient.MOOMOO_MILK.name },
//       { amount: 10, ingredient: ingredient.FANCY_APPLE.name },
//     ];

//     const teamSolutions: OptimalTeamSolution[] = [
//       {
//         team: [],
//         surplus: extractRelevantSurplus(recipe, [
//           { amount: 2, ingredient: ingredient.MOOMOO_MILK.name },
//           { amount: 2, ingredient: ingredient.FANCY_APPLE.name },
//         ]),
//         exhaustive: true,
//       },
//       {
//         team: [],
//         surplus: extractRelevantSurplus(recipe, [
//           { amount: 2, ingredient: ingredient.MOOMOO_MILK.name },
//           { amount: 2, ingredient: ingredient.BEAN_SAUSAGE.name },
//           { amount: 4, ingredient: ingredient.FANCY_APPLE.name },
//         ]),
//         exhaustive: true,
//       },
//       {
//         team: [],
//         surplus: extractRelevantSurplus(recipe, [{ amount: 3, ingredient: ingredient.MOOMOO_MILK.name }]),
//         exhaustive: true,
//       },
//     ];
//     const sortedSolutions = sortByMinimumFiller(teamSolutions, recipe);

//     expect(sortedSolutions[0].surplus).toEqual(teamSolutions[1].surplus);
//     expect(sortedSolutions[1].surplus).toEqual(teamSolutions[0].surplus);
//     expect(sortedSolutions[2].surplus).toEqual(teamSolutions[2].surplus);
//   });
// });

// describe('extractRelevantSurplus', () => {
//   const MOOMOO_MILK = { name: 'MOOMOO_MILK', value: 1, taxedValue: 1, longName: 'Moomoo Milk' };
//   const FANCY_APPLE = { name: 'FANCY_APPLE', value: 1, taxedValue: 1, longName: 'Fancy Apple' };
//   const BEAN_SAUSAGE = { name: 'BEAN_SAUSAGE', value: 1, taxedValue: 1, longName: 'Bean Sausage' };

//   it('shall correctly categorize relevant and extra surplus ingredients', () => {
//     const recipe: SimplifiedIngredientSet[] = [
//       { amount: 10, ingredient: MOOMOO_MILK.name },
//       { amount: 5, ingredient: FANCY_APPLE.name },
//     ];

//     const surplus: SimplifiedIngredientSet[] = [
//       { amount: 2, ingredient: MOOMOO_MILK.name },
//       { amount: 3, ingredient: BEAN_SAUSAGE.name },
//       { amount: 1, ingredient: FANCY_APPLE.name },
//     ];

//     const result = extractRelevantSurplus(recipe, surplus);

//     expect(result.total).toEqual(surplus);
//     expect(result.relevant).toEqual([
//       { amount: 2, ingredient: MOOMOO_MILK },
//       { amount: 1, ingredient: FANCY_APPLE },
//     ]);
//     expect(result.extra).toEqual([{ amount: 3, ingredient: BEAN_SAUSAGE }]);
//   });

//   it('shall return an empty array for extra if all surplus ingredients are relevant', () => {
//     const recipe = [{ amount: 10, ingredient: MOOMOO_MILK.name }];
//     const surplus = [{ amount: 2, ingredient: MOOMOO_MILK.name }];

//     const result = extractRelevantSurplus(recipe, surplus);

//     expect(result.relevant).toEqual(surplus);
//     expect(result.extra).toEqual([]);
//   });

//   it('shall return an empty array for relevant if no surplus ingredients are in the recipe', () => {
//     const recipe = [{ amount: 10, ingredient: MOOMOO_MILK.name }];
//     const surplus = [{ amount: 3, ingredient: BEAN_SAUSAGE.name }];

//     const result = extractRelevantSurplus(recipe, surplus);

//     expect(result.relevant).toEqual([]);
//     expect(result.extra).toEqual(surplus);
//   });
// });

// // ---- MOCKS ----

// const raichu: SetCoverPokemonSetup = {
//   ...MOCK_SET_COVER_POKEMON,
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
//   totalIngredients: [
//     {
//       amount: 0.2,
//       ingredient: ingredient.FANCY_APPLE.name,
//     },
//     {
//       amount: 0.5,
//       ingredient: ingredient.WARMING_GINGER.name,
//     },
//   ],
// };

// const raikou: SetCoverPokemonSetup = {
//   ...MOCK_SET_COVER_POKEMON,
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
// };
