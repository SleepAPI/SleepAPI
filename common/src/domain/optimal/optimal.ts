import { ADAMANT, CAREFUL, Nature, QUIET } from '../nature/nature';
import { Pokemon } from '../pokemon/pokemon';
import {
  BERRY_FINDING_S,
  HELPING_BONUS,
  HELPING_SPEED_M,
  HELPING_SPEED_S,
  INGREDIENT_FINDER_M,
  INGREDIENT_FINDER_S,
  INVENTORY_L,
  SKILL_TRIGGER_M,
  SKILL_TRIGGER_S,
} from '../subskill/subskill';
import { SubskillInstanceExt } from '../types/pokemon-instance';

export interface Optimal {
  subskills: SubskillInstanceExt[];
  nature: Nature;
  carrySize: number;
  skillLevel: number;
  ribbon?: number;
}

class OptimalImpl {
  public berry(pokemon: Pokemon): Optimal {
    return {
      subskills: [
        { level: 10, subskill: BERRY_FINDING_S },
        { level: 25, subskill: HELPING_SPEED_M },
        { level: 50, subskill: HELPING_SPEED_S },
        { level: 75, subskill: HELPING_BONUS },
        { level: 100, subskill: SKILL_TRIGGER_M },
      ],
      nature: ADAMANT,
      skillLevel: pokemon.skill.maxLevel,
      carrySize: pokemon.carrySize,
    };
  }

  public ingredient(pokemon: Pokemon): Optimal {
    return {
      subskills: [
        { level: 10, subskill: INGREDIENT_FINDER_M },
        { level: 25, subskill: HELPING_SPEED_M },
        { level: 50, subskill: INGREDIENT_FINDER_S },
        { level: 75, subskill: INVENTORY_L },
        { level: 100, subskill: HELPING_SPEED_S },
      ],
      nature: QUIET,
      skillLevel: pokemon.skill.maxLevel,
      carrySize: pokemon.carrySize + pokemon.previousEvolutions * 5,
    };
  }
  public skill(pokemon: Pokemon): Optimal {
    return {
      subskills: [
        { level: 10, subskill: SKILL_TRIGGER_M },
        { level: 25, subskill: HELPING_SPEED_M },
        { level: 50, subskill: SKILL_TRIGGER_S },
        { level: 75, subskill: HELPING_SPEED_S },
        { level: 100, subskill: HELPING_BONUS },
      ],
      nature: CAREFUL,
      skillLevel: pokemon.skill.maxLevel,
      carrySize: pokemon.carrySize + pokemon.previousEvolutions * 5,
    };
  }
}

export const Optimal = new OptimalImpl();
