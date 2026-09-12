import { TeamSimulatorUtils } from '@src/services/simulation-service/team-simulator/team-simulator-utils.js';
import { mocks } from '@src/vitest/index.js';
import type { PokemonWithIngredients, TeamMember, TeamMemberSettings } from 'sleepapi-common';
import { berry, commonMocks, GREENGRASS_EXPERT, ingredient, nature, Optimal } from 'sleepapi-common';
import { describe, expect, it } from 'vitest';

describe('calculateSkillPercentage', () => {
  const mockPokemonSet: PokemonWithIngredients = mocks.pokemonWithIngredients({
    pokemon: commonMocks.mockPokemon({ frequency: 3600, ingredientPercentage: 20, skillPercentage: 2 })
  });
  const member: TeamMember = mocks.teamMember({ pokemonWithIngredients: mockPokemonSet });

  it('shall calculate skill percentage for member', () => {
    expect(
      TeamSimulatorUtils.calculateSkillPercentage({ ...member, settings: { ...member.settings, nature: nature.SASSY } })
    ).toBe(0.024);
  });
});

describe('calculateIngredientPercentage', () => {
  const mockPokemonSet: PokemonWithIngredients = mocks.pokemonWithIngredients({
    pokemon: commonMocks.mockPokemon({ frequency: 3600, ingredientPercentage: 20, skillPercentage: 2 })
  });
  const member: TeamMember = mocks.teamMember({ pokemonWithIngredients: mockPokemonSet });

  it('shall calculate ingredient percentage for member', () => {
    expect(
      TeamSimulatorUtils.calculateIngredientPercentage({
        ...member,
        settings: { ...member.settings, nature: nature.QUIET }
      })
    ).toBe(0.24);
  });
});

describe('calculateHelpSpeedBeforeEnergy', () => {
  const mockPokemonSet: PokemonWithIngredients = mocks.pokemonWithIngredients({
    pokemon: commonMocks.mockPokemon({ frequency: 3600, ingredientPercentage: 20, skillPercentage: 2 })
  });
  const member: TeamMember = mocks.teamMember({ pokemonWithIngredients: mockPokemonSet });

  it('should calculate help speed without energy applied', () => {
    expect(
      TeamSimulatorUtils.calculateHelpSpeedBeforeEnergy({
        member: { ...member, settings: { ...member.settings, nature: nature.LONELY, level: 1 } },
        teamHelpingBonus: 0,
        settings: mocks.teamSettings()
      })
    ).toBe(3240);
  });
});

describe('calculateAverageProduce', () => {
  describe.todo('skill pokemon');
  describe.todo('berry pokemon');

  describe('ingredient Pokémon', () => {
    const mockTyranitar: PokemonWithIngredients = mocks.pokemonWithIngredients({
      pokemon: commonMocks.mockPokemon({
        frequency: 2700,
        ingredientPercentage: 26.6,
        skillPercentage: 5.2,
        specialty: 'ingredient',
        berry: berry.WIKI,
        previousEvolutions: 2,
        name: 'Mockitar',
        carrySize: 19
      }),
      ingredientList: [
        commonMocks.mockIngredientSet({ amount: 2, ingredient: ingredient.WARMING_GINGER }),
        commonMocks.mockIngredientSet({ amount: 5, ingredient: ingredient.WARMING_GINGER }),
        commonMocks.mockIngredientSet({ amount: 7, ingredient: ingredient.WARMING_GINGER })
      ]
    });
    const member: TeamMember = mocks.teamMember({ pokemonWithIngredients: mockTyranitar });

    it('should calculate average level 29 produce', () => {
      const optimalSettings = Optimal.ingredient(member.pokemonWithIngredients.pokemon);
      const settings: TeamMemberSettings = {
        carrySize: 0,
        ribbon: 0,
        skillLevel: 0,
        nature: optimalSettings.nature,
        subskills: new Set(optimalSettings.subskills.map((s) => s.subskill.name).slice(0, 2)),
        level: 29,
        externalId: 'optimal',
        sneakySnacking: false
      };

      const averageProduce60 = TeamSimulatorUtils.calculateAverageProduce({
        pokemonWithIngredients: { ...mockTyranitar, ingredientList: [mockTyranitar.ingredientList[0]] },
        settings
      });
      expect(averageProduce60.ingredients[5]).toEqual(0.868224024772644);
      expect(averageProduce60.berries[13]).toEqual(0.565887987613678);
    });

    it('should calculate average level 30 produce', () => {
      const optimalSettings = Optimal.ingredient(member.pokemonWithIngredients.pokemon);
      const settings: TeamMemberSettings = {
        carrySize: 0,
        ribbon: 0,
        skillLevel: 0,
        nature: optimalSettings.nature,
        subskills: new Set(optimalSettings.subskills.map((s) => s.subskill.name).slice(0, 2)),
        level: 30,
        externalId: 'optimal',
        sneakySnacking: false
      };

      const averageProduce60 = TeamSimulatorUtils.calculateAverageProduce({
        pokemonWithIngredients: { ...mockTyranitar, ingredientList: mockTyranitar.ingredientList.slice(0, 2) },
        settings
      });
      expect(averageProduce60.ingredients[5]).toEqual(1.5193920135498047);
      expect(averageProduce60.berries[13]).toEqual(0.565887987613678);
    });

    it('should calculate average level 60 produce', () => {
      const optimalSettings = Optimal.ingredient(member.pokemonWithIngredients.pokemon);
      const settings: TeamMemberSettings = {
        carrySize: 0,
        ribbon: 0,
        skillLevel: 0,
        nature: optimalSettings.nature,
        subskills: new Set(optimalSettings.subskills.map((s) => s.subskill.name).slice(0, 3)),
        level: 60,
        externalId: 'optimal',
        sneakySnacking: false
      };
      // ing% = 1.54 * 1.2 * 0.266 = 0.49 = 49%
      // (2+5+7 / 3) = 4.7 ings per ing drop
      // average ings of 2.3 / help
      // average berries of 1 x (1-0.49) = 0.51
      const averageProduce60 = TeamSimulatorUtils.calculateAverageProduce({ ...member, settings });
      expect(averageProduce60.ingredients[5]).toEqual(2.2939839363098145);
      expect(averageProduce60.berries[13]).toEqual(0.5084319710731506);
    });

    it('should calculate average level 75 produce', () => {
      const optimalSettings = Optimal.ingredient(member.pokemonWithIngredients.pokemon);
      const settings: TeamMemberSettings = {
        carrySize: 0,
        ribbon: 0,
        skillLevel: 0,
        nature: optimalSettings.nature,
        subskills: new Set(optimalSettings.subskills.map((s) => s.subskill.name).slice(0, 4)),
        level: 75,
        externalId: 'optimal',
        sneakySnacking: false
      };

      const averageProduce60 = TeamSimulatorUtils.calculateAverageProduce({ ...member, settings });
      expect(averageProduce60.ingredients[5]).toEqual(2.2939839363098145);
      expect(averageProduce60.berries[13]).toEqual(0.5084319710731506);
    });

    it('should calculate average level 100 produce', () => {
      const optimalSettings = Optimal.ingredient(member.pokemonWithIngredients.pokemon);
      const settings: TeamMemberSettings = {
        carrySize: 0,
        ribbon: 0,
        skillLevel: 0,
        nature: optimalSettings.nature,
        subskills: new Set(optimalSettings.subskills.map((s) => s.subskill.name)),
        level: 100,
        externalId: 'optimal',
        sneakySnacking: false
      };
      // ing% = 1.54 * 1.2 * 0.266 = 0.49 = 49%
      // (2+5+7 / 3) = 4.7 ings per ing drop
      // average ings of 2.3 / help
      // average berries of 1 x (1-0.49) = 0.51
      const averageProduce60 = TeamSimulatorUtils.calculateAverageProduce({ ...member, settings });
      expect(averageProduce60.ingredients[5]).toEqual(2.2939839363098145);
      expect(averageProduce60.berries[13]).toEqual(0.5084319710731506);
    });
  });
});

describe('prepareMembers', () => {
  const createMember = () =>
    mocks.teamMember({
      pokemonWithIngredients: mocks.pokemonWithIngredients({
        pokemon: commonMocks.mockPokemon({
          berry: berry.ORAN,
          frequency: 1800,
          skillPercentage: 0.2
        })
      }),
      settings: mocks.teamMemberSettings({ skillLevel: 3 })
    });

  it('returns members untouched when no event present', () => {
    const original = createMember();
    const [prepared] = TeamSimulatorUtils.prepareMembers({ members: [original] });

    expect(prepared).toBe(original);
  });

  it('applies frequency buff and skill level +1 for main berry pokemon', () => {
    const original = createMember();
    const event = GREENGRASS_EXPERT.bonuses({
      mainFavoriteBerry: berry.ORAN,
      subFavoriteBerries: [berry.MAGO],
      randomBonus: 'skill'
    });

    const [prepared] = TeamSimulatorUtils.prepareMembers({
      members: [original],
      event
    });

    expect(prepared.pokemonWithIngredients.pokemon.frequency).toBeCloseTo(1620); // 1800 * 0.9
    expect(prepared.settings.skillLevel).toBe(4);
    expect(prepared.pokemonWithIngredients.pokemon.skillPercentage).toBeCloseTo(0.25); // 0.2 * 1.25
    expect(original.pokemonWithIngredients.pokemon.frequency).toBe(1800);
    expect(original.settings.skillLevel).toBe(3);
  });

  it('applies no frequency change for sub berry pokemon', () => {
    const subBerryMember = mocks.teamMember({
      pokemonWithIngredients: mocks.pokemonWithIngredients({
        pokemon: commonMocks.mockPokemon({
          berry: berry.MAGO,
          frequency: 1800,
          skillPercentage: 0.2
        })
      }),
      settings: mocks.teamMemberSettings({ skillLevel: 3 })
    });

    const event = GREENGRASS_EXPERT.bonuses({
      mainFavoriteBerry: berry.ORAN,
      subFavoriteBerries: [berry.MAGO],
      randomBonus: 'skill'
    });

    const [prepared] = TeamSimulatorUtils.prepareMembers({
      members: [subBerryMember],
      event
    });

    expect(prepared.pokemonWithIngredients.pokemon.frequency).toBe(1800);
    expect(prepared.settings.skillLevel).toBe(3);
    expect(prepared.pokemonWithIngredients.pokemon.skillPercentage).toBeCloseTo(0.25); // 0.2 * 1.25
  });

  it('applies 15% frequency nerf for non-favored pokemon', () => {
    const unfavoredMember = mocks.teamMember({
      pokemonWithIngredients: mocks.pokemonWithIngredients({
        pokemon: commonMocks.mockPokemon({
          berry: berry.BELUE,
          frequency: 1800,
          skillPercentage: 0.2
        })
      }),
      settings: mocks.teamMemberSettings({ skillLevel: 3 })
    });

    const event = GREENGRASS_EXPERT.bonuses({
      mainFavoriteBerry: berry.ORAN,
      subFavoriteBerries: [berry.MAGO],
      randomBonus: 'skill'
    });

    const [prepared] = TeamSimulatorUtils.prepareMembers({
      members: [unfavoredMember],
      event
    });

    expect(prepared.pokemonWithIngredients.pokemon.frequency).toBeCloseTo(2070); // 1800 * 1.15
    expect(prepared.settings.skillLevel).toBe(3);
    expect(prepared.pokemonWithIngredients.pokemon.skillPercentage).toBe(0.2);
  });

  it('does not apply skill percentage boost when random bonus is not skill', () => {
    const original = createMember();
    const event = GREENGRASS_EXPERT.bonuses({
      mainFavoriteBerry: berry.ORAN,
      subFavoriteBerries: [berry.MAGO],
      randomBonus: 'berry'
    });

    const [prepared] = TeamSimulatorUtils.prepareMembers({
      members: [original],
      event
    });

    expect(prepared.pokemonWithIngredients.pokemon.skillPercentage).toBe(0.2);
  });
});

describe('countMembersWithSubskill', () => {
  const mockPokemonSet: PokemonWithIngredients = mocks.pokemonWithIngredients({
    pokemon: commonMocks.mockPokemon({ frequency: 3600, ingredientPercentage: 20, skillPercentage: 2 })
  });
  const member1: TeamMember = mocks.teamMember({
    pokemonWithIngredients: mockPokemonSet,
    settings: mocks.teamMemberSettings({ subskills: new Set(['subskill1', 'subskill2']) })
  });
  const member2: TeamMember = mocks.teamMember({
    pokemonWithIngredients: mockPokemonSet,
    settings: mocks.teamMemberSettings({ subskills: new Set(['subskill2', 'subskill3']) })
  });
  const member3: TeamMember = mocks.teamMember({
    pokemonWithIngredients: mockPokemonSet,
    settings: mocks.teamMemberSettings({ subskills: new Set(['subskill1', 'subskill3']) })
  });

  it('should count members with a specific subskill', () => {
    expect(TeamSimulatorUtils.countMembersWithSubskill([member1, member2, member3], 'subskill1')).toBe(2);
    expect(TeamSimulatorUtils.countMembersWithSubskill([member1, member2, member3], 'subskill2')).toBe(2);
    expect(TeamSimulatorUtils.countMembersWithSubskill([member1, member2, member3], 'subskill3')).toBe(2);
    expect(TeamSimulatorUtils.countMembersWithSubskill([member1, member2, member3], 'subskill4')).toBe(0);
  });
});
