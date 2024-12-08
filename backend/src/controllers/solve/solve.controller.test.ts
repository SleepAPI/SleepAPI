import { BadRequestError } from '@src/domain/error/api/api-error.js';
import { mocks } from '@src/vitest/index.js';
import { mimic } from '@src/vitest/mocks/index.js';
import * as common from 'sleepapi-common'; // Import the module to be mocked
import { nature } from 'sleepapi-common';
import { beforeEach, describe, expect, it } from 'vitest';
import SolveController from './solve.controller.js';

describe('solve.controller', () => {
  describe('enrichSolveSettings', () => {
    let controller: SolveController;

    beforeEach(() => {
      controller = new SolveController();
    });

    it('should enrich solve settings with valid inputs', () => {
      const settings = mocks.solveSettings();

      const enrichSolveSettings = controller._testAccess().enrichSolveSettings;
      const result = enrichSolveSettings(settings);

      expect(result).toEqual({
        camp: settings.camp,
        level: settings.level,
        bedtime: mocks.mockBedtime(),
        wakeup: mocks.mockWakeup()
      });
    });

    it('should throw BadRequestError for invalid sleep duration', () => {
      const settings = mocks.solveSettings({ wakeup: '12:00', bedtime: '12:01' });

      const enrichSolveSettings = controller._testAccess().enrichSolveSettings;

      expect(() => enrichSolveSettings(settings)).toThrowError(BadRequestError);
    });
  });

  describe('enrichMemberSettings', () => {
    let controller: SolveController;

    beforeEach(() => {
      controller = new SolveController();
    });

    it('should enrich member settings with valid inputs', () => {
      const settings = mocks.teamMemberSettings();

      const natureMock = mimic(common, 'getNature', () => nature.BASHFUL);

      const enrichMemberSettings = controller._testAccess().enrichMemberSettings;
      const result = enrichMemberSettings({ ...settings });

      expect(natureMock).toHaveBeenCalledWith(settings.nature);
      expect(result).toEqual({ ...settings, nature: nature.BASHFUL, subskills: new Set() });
    });
  });

  describe('resultToResponse', () => {
    let controller: SolveController;

    beforeEach(() => {
      controller = new SolveController();
    });

    it('should map result to response correctly', () => {
      const result = mocks.solveRecipeResultWithSettings();

      const mockedIngredientSet: common.IngredientSet[] = [
        mocks.mockIngredientSet({ amount: 10, ingredient: common.ingredient.FANCY_APPLE })
      ];
      const mockedPokemon = common.mockPokemon();

      const flatToIngredientSetMock = mimic(common, 'flatToIngredientSet', () => mockedIngredientSet);
      const getPokemonMock = mimic(common, 'getPokemon', () => mockedPokemon);

      const resultToResponse = controller._testAccess().resultToResponse;
      const response = resultToResponse(result);

      expect(response).toEqual({
        exhaustive: result.exhaustive,
        teams: result.teams.map((team) => ({
          producedIngredients: mockedIngredientSet,
          members: team.members.map((member) => ({
            producedIngredients: mockedIngredientSet,
            member: {
              pokemonWithIngredients: {
                pokemon: mockedPokemon,
                ingredientList: mockedIngredientSet
              },
              settings: member.settings
            }
          }))
        }))
      });

      expect(flatToIngredientSetMock).toHaveBeenCalledWith(new Int16Array());
      expect(getPokemonMock).toHaveBeenCalledWith('Mockemon');
    });
  });
});
