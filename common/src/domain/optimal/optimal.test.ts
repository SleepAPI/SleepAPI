import { describe, expect, it } from 'vitest';
import { Mainskill } from '../mainskill';
import { ADAMANT, CAREFUL, QUIET } from '../nature/nature';
import type { Pokemon } from '../pokemon/pokemon';
import { MOCK_POKEMON } from '../pokemon/pokemon';
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
} from '../subskill/subskill';
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
  const mockPokemon: Pokemon = { ...MOCK_POKEMON, skill: baseSkill };

  it('should return correct optimal setup for berry production', () => {
    const optimalBerry = Optimal.berry(mockPokemon);

    expect(optimalBerry).toEqual({
      subskills: [
        { level: 10, subskill: BERRY_FINDING_S },
        { level: 25, subskill: HELPING_SPEED_M },
        { level: 50, subskill: HELPING_SPEED_S },
        { level: 75, subskill: HELPING_BONUS },
        { level: 100, subskill: SKILL_TRIGGER_M }
      ],
      nature: ADAMANT,
      skillLevel: mockPokemon.skill.maxLevel,
      carrySize: mockPokemon.carrySize
    });
  });

  it('should return correct optimal setup for ingredient production', () => {
    const optimalIngredient = Optimal.ingredient(mockPokemon);

    expect(optimalIngredient).toEqual({
      subskills: [
        { level: 10, subskill: INGREDIENT_FINDER_M },
        { level: 25, subskill: HELPING_SPEED_M },
        { level: 50, subskill: INGREDIENT_FINDER_S },
        { level: 75, subskill: INVENTORY_L },
        { level: 100, subskill: HELPING_SPEED_S }
      ],
      nature: QUIET,
      skillLevel: mockPokemon.skill.maxLevel,
      carrySize: mockPokemon.carrySize + mockPokemon.previousEvolutions * 5
    });
  });

  it('should return correct optimal setup for skill production', () => {
    const optimalSkill = Optimal.skill(mockPokemon);

    expect(optimalSkill).toEqual({
      subskills: [
        { level: 10, subskill: SKILL_TRIGGER_M },
        { level: 25, subskill: HELPING_SPEED_M },
        { level: 50, subskill: SKILL_TRIGGER_S },
        { level: 75, subskill: HELPING_SPEED_S },
        { level: 100, subskill: HELPING_BONUS }
      ],
      nature: CAREFUL,
      skillLevel: mockPokemon.skill.maxLevel,
      carrySize: mockPokemon.carrySize + mockPokemon.previousEvolutions * 5
    });
  });
});
