import { CarrySizeUtils } from '../../utils/carry-size-utils/carry-size-utils';
import type { SubskillInstance } from '../instance/subskill-instance';
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
import type { TeamMemberSettings } from '../team';

export interface Optimal {
  subskills: SubskillInstance[];
  nature: Nature;
  carrySize: number;
  skillLevel: number;
  ribbon: number;
}

class OptimalImpl {
  public berry(pokemon: Pokemon, ribbon?: number, skillLevel?: number): Optimal {
    return {
      subskills: [
        { level: 10, subskill: BERRY_FINDING_S },
        { level: 25, subskill: HELPING_SPEED_M },
        { level: 50, subskill: HELPING_SPEED_S },
        { level: 70, subskill: HELPING_BONUS },
        { level: 80, subskill: SKILL_TRIGGER_M }
      ],
      nature: ADAMANT,
      skillLevel: skillLevel ?? pokemon.skill.maxLevel,
      carrySize: CarrySizeUtils.baseCarrySize(pokemon),
      ribbon: ribbon ?? 4
    };
  }

  public ingredient(pokemon: Pokemon, ribbon?: number, skillLevel?: number): Optimal {
    return {
      subskills: [
        { level: 10, subskill: INGREDIENT_FINDER_M },
        { level: 25, subskill: HELPING_SPEED_M },
        { level: 50, subskill: INGREDIENT_FINDER_S },
        { level: 70, subskill: INVENTORY_L },
        { level: 80, subskill: HELPING_SPEED_S }
      ],
      nature: QUIET,
      skillLevel: skillLevel ?? pokemon.skill.maxLevel,
      carrySize: CarrySizeUtils.baseCarrySize(pokemon),
      ribbon: ribbon ?? 4
    };
  }

  public skill(pokemon: Pokemon, ribbon?: number, skillLevel?: number): Optimal {
    return {
      subskills: [
        { level: 10, subskill: SKILL_TRIGGER_M },
        { level: 25, subskill: HELPING_SPEED_M },
        { level: 50, subskill: SKILL_TRIGGER_S },
        { level: 70, subskill: HELPING_SPEED_S },
        { level: 80, subskill: HELPING_BONUS }
      ],
      nature: CAREFUL,
      skillLevel: skillLevel ?? pokemon.skill.maxLevel,
      carrySize: CarrySizeUtils.baseCarrySize(pokemon),
      ribbon: ribbon ?? 4
    };
  }

  /**
   * Filters subskills on level
   * @returns {TeamMemberSettings}
   */
  public toMemberSettings(params: {
    stats: Optimal;
    level: number;
    externalId: string;
    sneakySnacking: boolean;
  }): TeamMemberSettings {
    const { stats, level, externalId, sneakySnacking } = params;

    const subskills = new Set<string>();
    for (const subskill of stats.subskills) {
      if (subskill.level <= level) {
        subskills.add(subskill.subskill.name);
      }
    }

    return {
      carrySize: stats.carrySize,
      nature: stats.nature,
      ribbon: stats.ribbon ?? 4,
      skillLevel: stats.skillLevel,
      subskills,
      level,
      externalId,
      sneakySnacking
    };
  }
}

export const Optimal = new OptimalImpl();
