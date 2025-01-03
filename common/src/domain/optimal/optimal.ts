import type { Nature } from '../nature/nature';
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
import type { TeamMemberSettingsExt } from '../team';
import type { SubskillInstanceExt } from '../types/pokemon-instance';

export interface Optimal {
  subskills: SubskillInstanceExt[];
  nature: Nature;
  carrySize: number;
  skillLevel: number;
  ribbon?: number;
}

class OptimalImpl {
  public berry(pokemon: Pokemon, ribbon?: number): Optimal {
    return {
      subskills: [
        { level: 10, subskill: BERRY_FINDING_S },
        { level: 25, subskill: HELPING_SPEED_M },
        { level: 50, subskill: HELPING_SPEED_S },
        { level: 75, subskill: HELPING_BONUS },
        { level: 100, subskill: SKILL_TRIGGER_M }
      ],
      nature: ADAMANT,
      skillLevel: pokemon.skill.maxLevel,
      carrySize: pokemon.carrySize,
      ribbon
    };
  }

  public ingredient(pokemon: Pokemon, ribbon?: number): Optimal {
    return {
      subskills: [
        { level: 10, subskill: INGREDIENT_FINDER_M },
        { level: 25, subskill: HELPING_SPEED_M },
        { level: 50, subskill: INGREDIENT_FINDER_S },
        { level: 75, subskill: INVENTORY_L },
        { level: 100, subskill: HELPING_SPEED_S }
      ],
      nature: QUIET,
      skillLevel: pokemon.skill.maxLevel,
      carrySize: pokemon.carrySize + pokemon.previousEvolutions * 5,
      ribbon
    };
  }
  public skill(pokemon: Pokemon, ribbon?: number): Optimal {
    return {
      subskills: [
        { level: 10, subskill: SKILL_TRIGGER_M },
        { level: 25, subskill: HELPING_SPEED_M },
        { level: 50, subskill: SKILL_TRIGGER_S },
        { level: 75, subskill: HELPING_SPEED_S },
        { level: 100, subskill: HELPING_BONUS }
      ],
      nature: CAREFUL,
      skillLevel: pokemon.skill.maxLevel,
      carrySize: pokemon.carrySize + pokemon.previousEvolutions * 5,
      ribbon
    };
  }

  /**
   * Filters subskills on level
   * @returns {TeamMemberSettingsExt}
   */
  public toMemberSettings(params: { stats: Optimal; level: number; externalId: string }): TeamMemberSettingsExt {
    const { stats, level, externalId } = params;

    const subskills = new Set<string>();
    for (const subskill of stats.subskills) {
      if (subskill.level <= level) {
        subskills.add(subskill.subskill.name);
      }
    }

    return {
      carrySize: stats.carrySize,
      nature: stats.nature,
      ribbon: stats.ribbon ?? 0,
      skillLevel: stats.skillLevel,
      subskills,
      level,
      externalId
    };
  }
}

export const Optimal = new OptimalImpl();
