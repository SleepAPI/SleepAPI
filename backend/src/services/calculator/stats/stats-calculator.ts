import { CustomStats } from '@src/domain/combination/custom';
import { subskillsForFilter } from '@src/utils/subskill-utils/subskill-utils';
import { MathUtils, mainskill, maxCarrySize, nature, pokemon, subskill } from 'sleepapi-common';

export function countErbUsers(erb: number, subskills: subskill.SubSkill[]) {
  const subskillErb = subskills.some(
    ({ name }) => name.toLowerCase() === subskill.ENERGY_RECOVERY_BONUS.name.toLowerCase()
  )
    ? 1
    : 0;

  return Math.max(Math.min(erb + subskillErb, 5), 0);
}

export function calculateSubskillCarrySize(subskills: subskill.SubSkill[]): number {
  const invS = subskills.some(({ name }) => name === subskill.INVENTORY_S.name) ? subskill.INVENTORY_S.amount : 0;
  const invM = subskills.some(({ name }) => name === subskill.INVENTORY_M.name) ? subskill.INVENTORY_M.amount : 0;
  const invL = subskills.some(({ name }) => name === subskill.INVENTORY_L.name) ? subskill.INVENTORY_L.amount : 0;
  return invS + invM + invL;
}

export function calculateRibbonCarrySize(ribbon: number) {
  let carrySize = 0;

  if (ribbon >= 1) {
    carrySize += 1;
  }
  if (ribbon >= 2) {
    carrySize += 2;
  }
  if (ribbon >= 3) {
    carrySize += 3;
  }
  if (ribbon >= 4) {
    carrySize += 2;
  }

  return carrySize;
}

// Calculate help speed subskills and clamp at 35% boost
export function calculateHelpSpeedSubskills(subskills: subskill.SubSkill[], nrOfHelpBonus: number) {
  const userAndTeamHelpBonus = subskills.some(({ name }) => name === subskill.HELPING_BONUS.name)
    ? nrOfHelpBonus + 1
    : nrOfHelpBonus;
  const helpBonus = subskill.HELPING_BONUS.amount * Math.min(5, userAndTeamHelpBonus);

  const helpM = subskills.some(({ name }) => name === subskill.HELPING_SPEED_M.name)
    ? subskill.HELPING_SPEED_M.amount
    : 0;
  const helpS = subskills.some(({ name }) => name === subskill.HELPING_SPEED_S.name)
    ? subskill.HELPING_SPEED_S.amount
    : 0;

  return MathUtils.round(Math.max(0.65, 1 - helpM - helpS - helpBonus), 2);
}

export function getOptimalStats(level: number, pokemon: pokemon.Pokemon): CustomStats {
  const supportSkills: mainskill.MainSkill[] = [
    // mainskill.COOKING_POWER_UP_S // in the future maybe
    mainskill.ENERGIZING_CHEER_S,
    mainskill.ENERGY_FOR_EVERYONE,
    mainskill.EXTRA_HELPFUL_S,
    mainskill.TASTY_CHANCE_S,
    mainskill.INGREDIENT_MAGNET_S,
    mainskill.METRONOME,
    mainskill.HELPER_BOOST,
  ];
  const inventoryLimit = maxCarrySize(pokemon);
  const ribbon = 4;
  const skillLevel = pokemon.skill.maxLevel;
  if (pokemon.specialty === 'skill' && supportSkills.includes(pokemon.skill)) {
    return {
      level,
      ribbon,
      nature: nature.SASSY,
      subskills: subskillsForFilter('skill', level, pokemon),
      skillLevel,
      inventoryLimit,
    };
  }

  return {
    level,
    ribbon,
    nature: nature.QUIET,
    subskills: subskillsForFilter('ingredient', level, pokemon),
    skillLevel,
    inventoryLimit,
  };
}
