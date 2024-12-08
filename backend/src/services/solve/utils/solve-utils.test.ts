import { calculateSimple, calculateTeam } from '@src/services/api-service/production/production-service.js';
import { SolveRecipeResult } from '@src/services/solve/solve-service.js';
import { SetCoverPokemonSetupWithSettings } from '@src/services/solve/types/set-cover-pokemon-setup-types.js';
import {
  bogusMembers,
  calculateProductionAll,
  calculateSupportPokemon,
  combineProduction,
  convertSimpleStatsToIngredientSets,
  createSettingsLookupTable,
  enrichSolutions,
  filterPokedex,
  groupProducersByIngredientIndex,
  hashPokemonSetIndexed,
  pokedexToMembers,
  pokemonProductionToRecipeSolutions
} from '@src/services/solve/utils/solve-utils.js';
import { splitArrayByCondition } from '@src/utils/database-utils/array-utils.js';
import { mocks } from '@src/vitest/index.js';
import { mockPokemonWithIngredientsIndexed } from '@src/vitest/mocks/index.js';
import { mockIngredientSet } from '@src/vitest/mocks/ingredient/mock-ingredient-set.js';
import { setCoverPokemonWithSettings } from '@src/vitest/mocks/solve/mock-set-cover-pokemon-with-settings.js';
import { mockMemberProduction } from '@src/vitest/mocks/team/mock-member-production.js';
import { mockTeamResults } from '@src/vitest/mocks/team/mock-team-result.js';
import { mockTeamSettingsExt } from '@src/vitest/mocks/team/mock-team-settings.js';
import {
  ENTEI,
  INGREDIENT_SUPPORT_MAINSKILLS,
  IngredientSet,
  OPTIMAL_POKEDEX,
  Pokedex,
  RAIKOU,
  SUICUNE,
  SolveSettingsExt,
  flatToIngredientSet,
  ingredient,
  ingredientSetToIntFlat,
  mockPokemon,
  prettifyIngredientDrop
} from 'sleepapi-common';
import { MockedFunction } from 'vitest';

describe('solve-utils', () => {
  vi.mock('@src/services/api-service/production/production-service.js', () => ({
    calculateSimple: vi.fn(),
    calculateTeam: vi.fn()
  }));

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('calculateProductionAll', () => {
    it('should calculate all pokemon, including user pokemon', () => {
      const mockedCalculateSimple = calculateSimple as MockedFunction<typeof calculateSimple>;
      const mockedCalculateTeam = calculateTeam as MockedFunction<typeof calculateTeam>;

      const userIncludedMembers = [
        mocks.mockTeamMemberExt({ settings: mocks.teamMemberSettingsExt({ externalId: 'user1' }) })
      ];
      const settings: SolveSettingsExt = { ...mockTeamSettingsExt(), level: 60 };

      mockedCalculateTeam.mockReturnValueOnce(
        mockTeamResults({ members: [mockMemberProduction({ externalId: userIncludedMembers[0].settings.externalId })] })
      );
      mockedCalculateSimple.mockReturnValue([mocks.mockSimpleTeamResult({ member: mocks.mockTeamMemberExt() })]);

      const result = calculateProductionAll({ userIncludedMembers, settings });

      const [supportMons] = splitArrayByCondition(OPTIMAL_POKEDEX, (pkmn) =>
        INGREDIENT_SUPPORT_MAINSKILLS.some((skill) => skill.isSkill(pkmn.skill))
      );

      expect(mockedCalculateTeam).toHaveBeenCalledOnce();

      // 1 call for all non-support mons and 1 call for every support mon
      expect(mockedCalculateSimple).toHaveBeenCalledTimes(supportMons.length + 1);

      expect(result.userProduction).toHaveLength(1);
    });
  });

  describe('filterPokedex', () => {
    it('should return COMPLETE_POKEDEX if input array has no helper boost Pokémon', () => {
      expect(filterPokedex([mocks.mockTeamMemberExt()])).toEqual(OPTIMAL_POKEDEX);
    });

    it('should return COMPLETE_POKEDEX if input array is empty', () => {
      expect(filterPokedex([])).toEqual(OPTIMAL_POKEDEX);
    });

    it('should remove helper boost pokemon in input array from COMPLETE_POKEDEX', () => {
      const filteredPokedex = filterPokedex([
        mocks.mockTeamMemberExt({ pokemonWithIngredients: mocks.mockPokemonWithIngredients({ pokemon: SUICUNE }) }),
        mocks.mockTeamMemberExt({ pokemonWithIngredients: mocks.mockPokemonWithIngredients({ pokemon: RAIKOU }) })
      ]);

      expect(filteredPokedex).toContain(ENTEI);
      expect(filteredPokedex).not.toContain(SUICUNE);
      expect(filteredPokedex).not.toContain(RAIKOU);
    });
  });

  describe('pokedexToMembers', () => {
    it('should convert a basic Pokémon to a team member', () => {
      const pokedex: Pokedex = [mockPokemon({ carrySize: 10, previousEvolutions: 2 })];
      const members = pokedexToMembers({ pokedex, level: 60, support: false });
      expect(members).toHaveLength(1);

      const member = members[0];
      expect(member.pokemonWithIngredients.pokemon).toBe(pokedex[0]);
      expect(member.pokemonWithIngredients.ingredientList).toHaveLength(3);
      expect(
        member.pokemonWithIngredients.ingredientList.every(
          (ing) => ing.ingredient === pokedex[0].ingredient0.ingredient
        )
      ).toBe(true);

      // settings
      expect(member.settings.carrySize).toMatchInlineSnapshot(`20`);
      expect(member.settings.nature.name).toMatchInlineSnapshot(`"Quiet"`);
      expect(member.settings.subskills.size).toBe(3);
      expect(member.settings.subskills).toMatchInlineSnapshot(`
        Set {
          "Ingredient Finder M",
          "Helping Speed M",
          "Ingredient Finder S",
        }
      `);
      expect(member.settings.level).toBe(60);
      expect(member.settings.externalId).toMatchInlineSnapshot(`"Mockemon"`);
      expect(member.settings.ribbon).toMatchInlineSnapshot(`4`);
      expect(member.settings.skillLevel).toEqual(pokedex[0].skill.maxLevel);
    });

    it('should provide as many subskills as the level allows', () => {
      const pokedex: Pokedex = [mockPokemon()];
      const level24Members = pokedexToMembers({ pokedex, level: 24, support: false });
      expect(level24Members).toHaveLength(1);
      expect(level24Members[0].settings.subskills.size).toBe(1);

      const level26Members = pokedexToMembers({ pokedex, level: 26, support: false });
      expect(level26Members).toHaveLength(1);
      expect(level26Members[0].settings.subskills.size).toBe(2);
    });

    it('should use skill setup for skill specialist support Pokémon', () => {
      const pokedex: Pokedex = [mockPokemon({ specialty: 'skill', skill: INGREDIENT_SUPPORT_MAINSKILLS[0] })];
      const supportMembers = pokedexToMembers({ pokedex, level: 50, support: true });
      expect(supportMembers).toHaveLength(1);
      expect(supportMembers[0].settings.subskills.size).toBe(3);
      const member = supportMembers[0];
      expect(member.settings.nature.name).toMatchInlineSnapshot(`"Careful"`);
      expect(member.settings.subskills).toMatchInlineSnapshot(`
        Set {
          "Skill Trigger M",
          "Helping Speed M",
          "Skill Trigger S",
        }
      `);
    });

    it('should return as many team members as were provided in the Pokédex', () => {
      const pokedex: Pokedex = [mockPokemon(), mockPokemon()];
      const members = pokedexToMembers({ pokedex, level: 50, support: true });
      expect(members).toHaveLength(2);
    });
  });

  describe('calculateSupportPokemon', () => {
    it('should calculate production one by one for each support member', () => {
      const supportPokemon1 = mocks.mockTeamMemberExt({
        settings: mocks.teamMemberSettingsExt({ externalId: 'supportPokemon1' })
      });
      const supportPokemon2 = mocks.mockTeamMemberExt({
        settings: mocks.teamMemberSettingsExt({ externalId: 'supportPokemon2' })
      });

      const mockedCalculateSimple = calculateSimple as MockedFunction<typeof calculateSimple>;

      mockedCalculateSimple.mockReturnValueOnce([mocks.mockSimpleTeamResult({ member: supportPokemon1 })]);
      mockedCalculateSimple.mockReturnValueOnce([mocks.mockSimpleTeamResult({ member: supportPokemon2 })]);

      const result = calculateSupportPokemon({
        supportMembers: [supportPokemon1, supportPokemon2],
        userMembers: [],
        settings: mockTeamSettingsExt()
      });
      expect(result).toHaveLength(2);
      expect(result[0].member.settings.externalId).toEqual(supportPokemon1.settings.externalId);
      expect(result[1].member.settings.externalId).toEqual(supportPokemon2.settings.externalId);

      expect(mockedCalculateSimple).toHaveBeenCalledTimes(2);
    });

    it('should not return supportMembers not returned by simulator', () => {
      const supportPokemon1 = mocks.mockTeamMemberExt({
        settings: mocks.teamMemberSettingsExt({ externalId: 'supportPokemon1' })
      });

      const mockedCalculateSimple = calculateSimple as MockedFunction<typeof calculateSimple>;

      mockedCalculateSimple.mockReturnValueOnce([]);

      const result = calculateSupportPokemon({
        supportMembers: [supportPokemon1],
        userMembers: [],
        settings: mockTeamSettingsExt()
      });
      expect(result).toHaveLength(0);
      expect(mockedCalculateSimple).toHaveBeenCalledOnce();
    });

    it("should include user's members in every simulation", () => {
      const userPokemon1 = mocks.mockTeamMemberExt({
        settings: mocks.teamMemberSettingsExt({ externalId: 'userPokemon1' })
      });
      const userPokemon2 = mocks.mockTeamMemberExt({
        settings: mocks.teamMemberSettingsExt({ externalId: 'userPokemon2' })
      });
      const supportPokemon1 = mocks.mockTeamMemberExt({
        settings: mocks.teamMemberSettingsExt({ externalId: 'supportPokemon1' })
      });
      const supportPokemon2 = mocks.mockTeamMemberExt({
        settings: mocks.teamMemberSettingsExt({ externalId: 'supportPokemon2' })
      });

      const mockedCalculateSimple = calculateSimple as MockedFunction<typeof calculateSimple>;

      mockedCalculateSimple.mockReturnValueOnce([mocks.mockSimpleTeamResult({ member: supportPokemon1 })]);
      mockedCalculateSimple.mockReturnValueOnce([mocks.mockSimpleTeamResult({ member: supportPokemon2 })]);

      const result = calculateSupportPokemon({
        supportMembers: [supportPokemon1, supportPokemon2],
        userMembers: [userPokemon1, userPokemon2],
        settings: mockTeamSettingsExt()
      });
      expect(result).toHaveLength(2);
      expect(result[0].member.settings.externalId).toEqual(supportPokemon1.settings.externalId);
      expect(result[1].member.settings.externalId).toEqual(supportPokemon2.settings.externalId);

      expect(mockedCalculateSimple).toHaveBeenCalledTimes(2);
      mockedCalculateSimple.mock.calls.forEach((call) => {
        expect(call[0]).toEqual(
          expect.objectContaining({
            members: expect.arrayContaining([
              expect.objectContaining({
                settings: expect.objectContaining({ externalId: userPokemon1.settings.externalId })
              }),
              expect.objectContaining({
                settings: expect.objectContaining({ externalId: userPokemon2.settings.externalId })
              })
            ])
          })
        );
      });

      const [callArgs] = mockedCalculateSimple.mock.calls[0];
      expect(callArgs.members).toHaveLength(5);
    });

    it('should include a bogus member for each empty space in the simulator', () => {
      const supportPokemon1 = mocks.mockTeamMemberExt({
        settings: mocks.teamMemberSettingsExt({ externalId: 'supportPokemon1' })
      });

      const mockedCalculateSimple = calculateSimple as MockedFunction<typeof calculateSimple>;

      mockedCalculateSimple.mockReturnValueOnce([mocks.mockSimpleTeamResult({ member: supportPokemon1 })]);

      const result = calculateSupportPokemon({
        supportMembers: [supportPokemon1],
        userMembers: [],
        settings: mockTeamSettingsExt()
      });
      expect(result).toHaveLength(1);
      expect(result[0].member.settings.externalId).toEqual(supportPokemon1.settings.externalId);

      const bogusMember = mocks.mockTeamMemberExt();

      expect(mockedCalculateSimple).toHaveBeenCalledTimes(1);
      expect(mockedCalculateSimple.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          members: [
            expect.objectContaining({
              settings: expect.objectContaining({ externalId: supportPokemon1.settings.externalId })
            }),
            expect.objectContaining({
              settings: expect.objectContaining({ externalId: bogusMember.settings.externalId })
            }),
            expect.objectContaining({
              settings: expect.objectContaining({ externalId: bogusMember.settings.externalId })
            }),
            expect.objectContaining({
              settings: expect.objectContaining({ externalId: bogusMember.settings.externalId })
            }),
            expect.objectContaining({
              settings: expect.objectContaining({ externalId: bogusMember.settings.externalId })
            })
          ]
        })
      );

      const [callArgs] = mockedCalculateSimple.mock.calls[0];
      expect(callArgs.members).toHaveLength(5);
    });
  });

  describe('convertSimpleStatsToIngredientSets', () => {
    it('should generate produce for every ingredient list based on provided SimpleTeamResults', () => {
      const ingredientListA: IngredientSet = { amount: 1, ingredient: ingredient.FANCY_APPLE };
      const ingredientListB: IngredientSet = { amount: 1, ingredient: ingredient.BEAN_SAUSAGE };
      const pokemon = mockPokemon({
        ingredient0: ingredientListA,
        ingredient30: [ingredientListA],
        ingredient60: [ingredientListA, ingredientListB]
      });
      const member = mocks.mockTeamMemberExt({
        pokemonWithIngredients: mocks.mockPokemonWithIngredients({ pokemon }),
        settings: mocks.teamMemberSettingsExt({ level: 60 })
      });
      const simpleResults = mocks.mockSimpleTeamResult({ member });

      const result = convertSimpleStatsToIngredientSets([simpleResults]);
      expect(result).toHaveLength(2); // AAA and AAB

      // flat converted to ingredient list can't determine how many elements it should be split into
      expect(prettifyIngredientDrop(flatToIngredientSet(result[0].pokemonSet.ingredients))).toMatchInlineSnapshot(
        `"3 Apple"`
      );
      expect(prettifyIngredientDrop(flatToIngredientSet(result[1].pokemonSet.ingredients))).toMatchInlineSnapshot(
        `"2 Apple, 1 Sausage"`
      );
    });

    it('should calculate the correct amount of ingredients', () => {
      const ingredientListA: IngredientSet = { amount: 1, ingredient: ingredient.FANCY_APPLE };
      const pokemon = mockPokemon({
        ingredient0: ingredientListA,
        ingredient30: [ingredientListA],
        ingredient60: [ingredientListA],
        ingredientPercentage: 100
      });
      const member = mocks.mockTeamMemberExt({
        pokemonWithIngredients: mocks.mockPokemonWithIngredients({ pokemon }),
        settings: mocks.teamMemberSettingsExt({ level: 60 })
      });
      const simpleResults = mocks.mockSimpleTeamResult({ member, totalHelps: 10 });

      const result = convertSimpleStatsToIngredientSets([simpleResults]);
      expect(result).toHaveLength(1);
      const memberResult = result[0];
      // average ingredient per help is 1 apple, that's 3.3 per meal window which gets Math.ceil to 4
      expect(flatToIngredientSet(memberResult.totalIngredients)).toMatchInlineSnapshot(`
        [
          {
            "amount": 4,
            "ingredient": {
              "longName": "Fancy Apple",
              "name": "Apple",
              "taxedValue": 23.7,
              "value": 90,
            },
          },
        ]
      `);
    });

    it('should support pokemon with no ingredients', () => {
      const simpleResults = mocks.mockSimpleTeamResult();
      const result = convertSimpleStatsToIngredientSets([simpleResults]);
      expect(result).toHaveLength(1);
      const member = result[0];
      expect(flatToIngredientSet(member.totalIngredients)).toMatchInlineSnapshot(`[]`);
      expect(flatToIngredientSet(member.pokemonSet.ingredients)).toMatchInlineSnapshot(`[]`);
    });
  });

  describe('groupProducersByIngredientIndex', () => {
    it('should group producers by ingredient produced', () => {
      const member1 = setCoverPokemonWithSettings({
        totalIngredients: ingredientSetToIntFlat([
          mockIngredientSet({ amount: 10, ingredient: ingredient.INGREDIENTS[0] })
        ])
      });
      const member2 = setCoverPokemonWithSettings({
        totalIngredients: ingredientSetToIntFlat([
          mockIngredientSet({ amount: 10, ingredient: ingredient.INGREDIENTS[1] })
        ])
      });

      const result = groupProducersByIngredientIndex([member1, member2]);
      expect(result).toHaveLength(ingredient.TOTAL_NUMBER_OF_INGREDIENTS);
      expect(result[0]).toHaveLength(1); // one producer of apple
    });

    it('should sort producers of same ingredient by amount DESC', () => {
      const member1 = setCoverPokemonWithSettings({
        totalIngredients: ingredientSetToIntFlat([
          mockIngredientSet({ amount: 5, ingredient: ingredient.INGREDIENTS[0] })
        ])
      });
      const member2 = setCoverPokemonWithSettings({
        totalIngredients: ingredientSetToIntFlat([
          mockIngredientSet({ amount: 10, ingredient: ingredient.INGREDIENTS[0] })
        ])
      });

      const result = groupProducersByIngredientIndex([member1, member2]);
      expect(result).toHaveLength(ingredient.TOTAL_NUMBER_OF_INGREDIENTS);
      expect(result[0]).toHaveLength(2); // two producers of apple
      expect(result[0][0].totalIngredients[0]).toBe(10);
      expect(result[0][1].totalIngredients[0]).toBe(5);
    });
  });

  describe('pokemonProductionToRecipeSolutions', () => {
    it('should convert an array of SetCoverPokemonWithSettings to a TeamSolution', () => {
      const array = setCoverPokemonWithSettings({
        totalIngredients: ingredientSetToIntFlat([
          mockIngredientSet({ amount: 10, ingredient: ingredient.FANCY_APPLE })
        ])
      });
      const result = pokemonProductionToRecipeSolutions([array]);

      expect(result.members).toHaveLength(1);
      expect(prettifyIngredientDrop(result.members[0].totalIngredients)).toMatchInlineSnapshot(`"10 Apple"`);
    });

    it("should combine the member's production correctly", () => {
      const firstPokemon = setCoverPokemonWithSettings({
        totalIngredients: ingredientSetToIntFlat([
          mockIngredientSet({ amount: 10, ingredient: ingredient.FANCY_APPLE })
        ])
      });
      const secondPokemon = setCoverPokemonWithSettings({
        totalIngredients: ingredientSetToIntFlat([
          mockIngredientSet({ amount: 10, ingredient: ingredient.FANCY_APPLE })
        ])
      });
      const result = pokemonProductionToRecipeSolutions([firstPokemon, secondPokemon]);

      expect(result.members).toHaveLength(2);
      expect(prettifyIngredientDrop(result.members[0].totalIngredients)).toMatchInlineSnapshot(`"10 Apple"`);
      expect(prettifyIngredientDrop(result.members[1].totalIngredients)).toMatchInlineSnapshot(`"10 Apple"`);
      expect(prettifyIngredientDrop(result.producedIngredients)).toMatchInlineSnapshot(`"20 Apple"`);
    });
  });

  describe('createSettingsLookupTable', () => {
    it('should create a valid Map from pokemonWithSettings array', () => {
      const member1 = mocks.setCoverPokemonWithSettings({
        pokemonSet: mocks.mockPokemonWithIngredientsIndexed({ pokemon: 'mcmomo' })
      });
      const member2 = mocks.setCoverPokemonWithSettings({
        pokemonSet: mocks.mockPokemonWithIngredientsIndexed({ pokemon: 'abunzu' })
      });

      const member1Key = hashPokemonSetIndexed(member1.pokemonSet);
      const member2Key = hashPokemonSetIndexed(member2.pokemonSet);

      const result = createSettingsLookupTable([member1, member2]);

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(2);

      // Validate each entry
      expect(result.get(member1Key)).toEqual(member1);
      expect(result.get(member2Key)).toEqual(member2);
    });

    it('should return an empty Map if input is empty', () => {
      const result = createSettingsLookupTable([]);
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });
  });

  describe('combineProduction', () => {
    it("should combine member's production", () => {
      const ings: IngredientSet[] = [{ amount: 10, ingredient: ingredient.FANCY_APPLE }];
      const member1 = setCoverPokemonWithSettings({ totalIngredients: ingredientSetToIntFlat(ings) });
      const member2 = setCoverPokemonWithSettings({ totalIngredients: ingredientSetToIntFlat(ings) });

      const [apple, ...rest] = combineProduction([member1, member2]);
      expect(apple).toMatchInlineSnapshot(`20`);
      expect(rest.every((ing) => ing === 0)).toBe(true);
    });

    it("should combine member's production if mismatching indices", () => {
      const ings1: IngredientSet[] = [{ amount: 10, ingredient: ingredient.FANCY_APPLE }];
      const ings2: IngredientSet[] = [{ amount: 10, ingredient: ingredient.MOOMOO_MILK }];
      const member1 = setCoverPokemonWithSettings({ totalIngredients: ingredientSetToIntFlat(ings1) });
      const member2 = setCoverPokemonWithSettings({ totalIngredients: ingredientSetToIntFlat(ings2) });

      const [apple, milk, ...rest] = combineProduction([member1, member2]);
      expect(apple).toMatchInlineSnapshot(`10`);
      expect(milk).toMatchInlineSnapshot(`10`);
      expect(rest.every((ing) => ing === 0)).toBe(true);
    });
  });

  describe('bogusMembers', () => {
    it('should create an array of mocked Pokémon', () => {
      const members = bogusMembers(1);
      expect(members).toHaveLength(1);
      const member = members[0];
      expect(member.pokemonWithIngredients.pokemon.name).toMatchInlineSnapshot(`"Mockemon"`);
      expect(member.settings).toMatchSnapshot();
    });

    it('should create an array of correct size', () => {
      const members = bogusMembers(17);
      expect(members).toHaveLength(17);
      expect(members.every((member) => member === members[0]));
    });

    it('should be able to create an empty array', () => {
      const members = bogusMembers(0);
      expect(members).toHaveLength(0);
    });
  });

  describe('hashPokemonSetIndexed', () => {
    it('should hash PokemonSetIndexed', () => {
      const ings: IngredientSet[] = [
        { amount: 10, ingredient: ingredient.FANCY_APPLE },
        { amount: 5, ingredient: ingredient.MOOMOO_MILK }
      ];
      const member = mockPokemonWithIngredientsIndexed({ ingredients: ingredientSetToIntFlat(ings) });
      expect(hashPokemonSetIndexed(member)).toMatchInlineSnapshot(`"Mockemon:10,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0"`);
    });
  });

  describe('enrichSolutions', () => {
    it('should add settings from cache', () => {
      const cachedSettings = setCoverPokemonWithSettings();
      const cache: Map<string, SetCoverPokemonSetupWithSettings> = new Map();
      cache.set('Mockemon:', cachedSettings);

      const solutions: SolveRecipeResult = mocks.solveRecipeResult();
      expect(solutions.teams).toHaveLength(1);

      const result = enrichSolutions(solutions, cache);
      expect(result.exhaustive).toBe(solutions.exhaustive);
      expect(result.teams).toEqual(
        solutions.teams.map((inputTeam) => ({
          members: inputTeam.members.map((inputMember) => ({
            pokemonSet: inputMember.pokemonSet,
            totalIngredients: inputMember.totalIngredients,
            settings: cachedSettings.settings
          })),
          producedIngredients: inputTeam.producedIngredients
        }))
      );
    });
  });
});
