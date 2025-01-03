import { mocks } from '@src/bun/index.js';
import { TeamSimulatorUtils } from '@src/services/simulation-service/team-simulator/team-simulator-utils.js';
import { TimeUtils } from '@src/utils/time-utils/time-utils.js';
import { describe, expect, it } from 'bun:test';
import type { PokemonWithIngredients, TeamMemberExt, TeamMemberSettingsExt } from 'sleepapi-common';
import { berry, ingredient, mockPokemon, nature, Optimal } from 'sleepapi-common';

describe('calculateSkillPercentage', () => {
  const mockPokemonSet: PokemonWithIngredients = mocks.pokemonWithIngredients({
    pokemon: mockPokemon({ frequency: 3600, ingredientPercentage: 20, skillPercentage: 2 })
  });
  const member: TeamMemberExt = mocks.teamMemberExt({ pokemonWithIngredients: mockPokemonSet });

  it('shall calculate skill percentage for member', () => {
    expect(
      TeamSimulatorUtils.calculateSkillPercentage({ ...member, settings: { ...member.settings, nature: nature.SASSY } })
    ).toBe(0.024);
  });
});

describe('calculateIngredientPercentage', () => {
  const mockPokemonSet: PokemonWithIngredients = mocks.pokemonWithIngredients({
    pokemon: mockPokemon({ frequency: 3600, ingredientPercentage: 20, skillPercentage: 2 })
  });
  const member: TeamMemberExt = mocks.teamMemberExt({ pokemonWithIngredients: mockPokemonSet });

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
    pokemon: mockPokemon({ frequency: 3600, ingredientPercentage: 20, skillPercentage: 2 })
  });
  const member: TeamMemberExt = mocks.teamMemberExt({ pokemonWithIngredients: mockPokemonSet });

  it('should calculate help speed without energy applied', () => {
    expect(
      TeamSimulatorUtils.calculateHelpSpeedBeforeEnergy({
        member: { ...member, settings: { ...member.settings, nature: nature.LONELY, level: 1 } },
        helpingBonus: 0,
        settings: { bedtime: TimeUtils.parseTime('06:00'), wakeup: TimeUtils.parseTime('21:30'), camp: false }
      })
    ).toBe(3240);
  });
});

describe('uniqueMembersWithBerry', () => {
  const mockPokemonSet: PokemonWithIngredients = mocks.pokemonWithIngredients({
    pokemon: mockPokemon({ frequency: 3600, ingredientPercentage: 20, skillPercentage: 2 })
  });
  const member: TeamMemberExt = mocks.teamMemberExt({ pokemonWithIngredients: mockPokemonSet });

  it('shall calculate the unique members in team for given berry', () => {
    expect(TeamSimulatorUtils.uniqueMembersWithBerry({ berry: berry.BELUE, members: [member, member, member] })).toBe(
      1
    );
  });
});

describe('calculateAverageProduce', () => {
  describe.todo('skill pokemon');
  describe.todo('berry pokemon');

  describe('ingredient Pokémon', () => {
    const mockTyranitar: PokemonWithIngredients = mocks.pokemonWithIngredients({
      pokemon: mockPokemon({
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
        mocks.mockIngredientSet({ amount: 2, ingredient: ingredient.WARMING_GINGER }),
        mocks.mockIngredientSet({ amount: 5, ingredient: ingredient.WARMING_GINGER }),
        mocks.mockIngredientSet({ amount: 7, ingredient: ingredient.WARMING_GINGER })
      ]
    });
    const member: TeamMemberExt = mocks.teamMemberExt({ pokemonWithIngredients: mockTyranitar });

    it('should calculate average level 29 produce', () => {
      const optimalSettings = Optimal.ingredient(member.pokemonWithIngredients.pokemon);
      const settings: TeamMemberSettingsExt = {
        carrySize: 0,
        ribbon: 0,
        skillLevel: 0,
        nature: optimalSettings.nature,
        subskills: new Set(optimalSettings.subskills.map((s) => s.subskill.name).slice(0, 2)),
        level: 29,
        externalId: 'optimal'
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
      const settings: TeamMemberSettingsExt = {
        carrySize: 0,
        ribbon: 0,
        skillLevel: 0,
        nature: optimalSettings.nature,
        subskills: new Set(optimalSettings.subskills.map((s) => s.subskill.name).slice(0, 2)),
        level: 30,
        externalId: 'optimal'
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
      const settings: TeamMemberSettingsExt = {
        carrySize: 0,
        ribbon: 0,
        skillLevel: 0,
        nature: optimalSettings.nature,
        subskills: new Set(optimalSettings.subskills.map((s) => s.subskill.name).slice(0, 3)),
        level: 60,
        externalId: 'optimal'
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
      const settings: TeamMemberSettingsExt = {
        carrySize: 0,
        ribbon: 0,
        skillLevel: 0,
        nature: optimalSettings.nature,
        subskills: new Set(optimalSettings.subskills.map((s) => s.subskill.name).slice(0, 4)),
        level: 75,
        externalId: 'optimal'
      };

      const averageProduce60 = TeamSimulatorUtils.calculateAverageProduce({ ...member, settings });
      expect(averageProduce60.ingredients[5]).toEqual(2.2939839363098145);
      expect(averageProduce60.berries[13]).toEqual(0.5084319710731506);
    });

    it('should calculate average level 100 produce', () => {
      const optimalSettings = Optimal.ingredient(member.pokemonWithIngredients.pokemon);
      const settings: TeamMemberSettingsExt = {
        carrySize: 0,
        ribbon: 0,
        skillLevel: 0,
        nature: optimalSettings.nature,
        subskills: new Set(optimalSettings.subskills.map((s) => s.subskill.name)),
        level: 100,
        externalId: 'optimal'
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
