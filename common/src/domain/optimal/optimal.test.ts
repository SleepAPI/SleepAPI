import { describe, expect, it } from 'vitest';
import { mockPokemon } from '../../vitest/mocks';
import { Mainskill } from '../mainskill';
import { ADAMANT, CAREFUL, QUIET } from '../nature/nature';
import type { Pokemon } from '../pokemon/pokemon';
import {
  BERRY_FINDING_S,
  HELPING_BONUS,
  HELPING_SPEED_M,
  HELPING_SPEED_S,
  INGREDIENT_FINDER_M,
  INGREDIENT_FINDER_S,
  INVENTORY_L,
  SKILL_TRIGGER_M,
  SKILL_TRIGGER_S
} from '../subskill/subskills';
import { Optimal } from './optimal';

describe('Optimal', () => {
  const baseSkill: Mainskill = new Mainskill({
    name: 'Charge Energy S',
    amount: [12, 16, 21, 26, 33, 43],
    unit: 'energy',
    maxLevel: 6,
    description: 'Restores ? Energy to the user.',
    RP: [400, 569, 785, 1083, 1496, 2066],
    modifier: { type: 'Base', critChance: 0 }
  });
  const mockedPokemon: Pokemon = { ...mockPokemon(), skill: baseSkill };

  it('should return correct optimal setup for berry production', () => {
    const optimalBerry = Optimal.berry(mockedPokemon);

    expect(optimalBerry).toEqual({
      subskills: [
        { level: 10, subskill: BERRY_FINDING_S },
        { level: 25, subskill: HELPING_SPEED_M },
        { level: 50, subskill: HELPING_SPEED_S },
        { level: 75, subskill: HELPING_BONUS },
        { level: 100, subskill: SKILL_TRIGGER_M }
      ],
      nature: ADAMANT,
      skillLevel: mockedPokemon.skill.maxLevel,
      carrySize: mockedPokemon.carrySize
    });
  });

  it('should return correct optimal setup for ingredient production', () => {
    const optimalIngredient = Optimal.ingredient(mockedPokemon);

    expect(optimalIngredient).toEqual({
      subskills: [
        { level: 10, subskill: INGREDIENT_FINDER_M },
        { level: 25, subskill: HELPING_SPEED_M },
        { level: 50, subskill: INGREDIENT_FINDER_S },
        { level: 75, subskill: INVENTORY_L },
        { level: 100, subskill: HELPING_SPEED_S }
      ],
      nature: QUIET,
      skillLevel: mockedPokemon.skill.maxLevel,
      carrySize: mockedPokemon.carrySize + mockedPokemon.previousEvolutions * 5
    });
  });

  it('should return correct optimal setup for skill production', () => {
    const optimalSkill = Optimal.skill(mockedPokemon);

    expect(optimalSkill).toEqual({
      subskills: [
        { level: 10, subskill: SKILL_TRIGGER_M },
        { level: 25, subskill: HELPING_SPEED_M },
        { level: 50, subskill: SKILL_TRIGGER_S },
        { level: 75, subskill: HELPING_SPEED_S },
        { level: 100, subskill: HELPING_BONUS }
      ],
      nature: CAREFUL,
      skillLevel: mockedPokemon.skill.maxLevel,
      carrySize: mockedPokemon.carrySize + mockedPokemon.previousEvolutions * 5
    });
  });

  describe('toMemberSettings', () => {
    it('should return correct team member settings for given level', () => {
      const optimalStats: Optimal = Optimal.berry(mockedPokemon, 2);

      const memberSettings = Optimal.toMemberSettings({
        stats: optimalStats,
        level: 50,
        externalId: 'test-id'
      });

      expect(memberSettings).toEqual({
        carrySize: mockedPokemon.carrySize,
        nature: ADAMANT,
        ribbon: 2,
        skillLevel: mockedPokemon.skill.maxLevel,
        subskills: new Set(optimalStats.subskills.slice(0, 3).map((subskill) => subskill.subskill.name)),
        level: 50,
        externalId: 'test-id'
      });
    });

    it('should return correct team member settings with no ribbon', () => {
      const optimalStats: Optimal = {
        subskills: [
          { level: 10, subskill: INGREDIENT_FINDER_M },
          { level: 25, subskill: HELPING_SPEED_M },
          { level: 50, subskill: INGREDIENT_FINDER_S },
          { level: 75, subskill: INVENTORY_L },
          { level: 100, subskill: HELPING_SPEED_S }
        ],
        nature: QUIET,
        skillLevel: mockedPokemon.skill.maxLevel,
        carrySize: mockedPokemon.carrySize + mockedPokemon.previousEvolutions * 5
      };

      const memberSettings = Optimal.toMemberSettings({
        stats: optimalStats,
        level: 75,
        externalId: 'test-id-2'
      });

      expect(memberSettings).toEqual({
        carrySize: mockedPokemon.carrySize + mockedPokemon.previousEvolutions * 5,
        nature: QUIET,
        ribbon: 0,
        skillLevel: mockedPokemon.skill.maxLevel,
        subskills: new Set(optimalStats.subskills.slice(0, 4).map((subskill) => subskill.subskill.name)),
        level: 75,
        externalId: 'test-id-2'
      });
    });
  });
});
