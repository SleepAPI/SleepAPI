import { mocks } from '@src/bun/index.js';
import { BadRequestError } from '@src/domain/error/api/api-error.js';
import * as mealUtils from '@src/utils/meal-utils/meal-utils.js';
import { boozle } from 'bunboozle';
import * as common from 'sleepapi-common';
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
        bedtime: mocks.bedtime(),
        wakeup: mocks.wakeup()
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

      const natureMock = boozle(common, 'getNature', () => nature.BASHFUL);

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
      boozle(mealUtils, 'getMeal', () => mocks.recipe());

      const mockedIngredientSet: common.IngredientSet[] = [
        mocks.mockIngredientSet({ amount: 10, ingredient: common.ingredient.FANCY_APPLE })
      ];
      const mockedPokemon = common.mockPokemon();

      const flatToIngredientSetMock = boozle(common, 'flatToIngredientSet', () => mockedIngredientSet);
      const getPokemonMock = boozle(common, 'getPokemon', () => mockedPokemon);

      const resultToResponse = controller._testAccess().resultToResponse;
      const response = resultToResponse(result, 'fake-recipe');

      expect(response).toEqual({
        exhaustive: result.exhaustive,
        teams: result.teams.map((team) => ({
          producedIngredients: mockedIngredientSet,
          surplus: {},
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
