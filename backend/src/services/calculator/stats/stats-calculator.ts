import { MathUtils, subskill } from 'sleepapi-common';

// TODO: why are most of these not in stat-utils in common?
export function countErbUsers(erb: number, subskills: Set<string>) {
  const subskillErb = subskills.has(subskill.ENERGY_RECOVERY_BONUS.name) ? 1 : 0;
  return Math.max(Math.min(erb + subskillErb, 5), 0);
}

export function calculateSubskillCarrySize(subskills: Set<string>): number {
  const invS = subskills.has(subskill.INVENTORY_S.name) ? subskill.INVENTORY_S.amount : 0;
  const invM = subskills.has(subskill.INVENTORY_M.name) ? subskill.INVENTORY_M.amount : 0;
  const invL = subskills.has(subskill.INVENTORY_L.name) ? subskill.INVENTORY_L.amount : 0;
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
export function calculateHelpSpeedSubskills(subskills: Set<string>, nrOfHelpBonus: number) {
  const userAndTeamHelpBonus = subskills.has(subskill.HELPING_BONUS.name) ? nrOfHelpBonus + 1 : nrOfHelpBonus;
  const helpBonus = subskill.HELPING_BONUS.amount * Math.min(5, userAndTeamHelpBonus);

  const helpM = subskills.has(subskill.HELPING_SPEED_M.name) ? subskill.HELPING_SPEED_M.amount : 0;
  const helpS = subskills.has(subskill.HELPING_SPEED_S.name) ? subskill.HELPING_SPEED_S.amount : 0;

  return MathUtils.round(Math.max(0.65, 1 - helpM - helpS - helpBonus), 2);
}

// export function getOptimalStats(level: number, pokemon: pokemon.Pokemon, camp: boolean): CustomStats {
//   const supportSkills: Mainskill[] = [
//     // mainskill.COOKING_POWER_UP_S // in the future maybe
//     mainskill.ENERGIZING_CHEER_S,
//     mainskill.ENERGY_FOR_EVERYONE,
//     mainskill.EXTRA_HELPFUL_S,
//     mainskill.TASTY_CHANCE_S,
//     mainskill.INGREDIENT_MAGNET_S,
//     mainskill.METRONOME,
//     mainskill.HELPER_BOOST,
//   ];

//   const ribbon = 4;
//   const optimal = Optimal.specialty

//   if (pokemon.specialty === 'skill' && supportSkills.includes(pokemon.skill)) {
//     const subskills = Optimal.skill(pokemon) subskillsForFilter('skill', level, pokemon);
//     const inventoryLimit = InventoryUtils.calculateCarrySize({
//       baseWithEvolutions: maxCarrySize(pokemon),
//       subskills,
//       ribbon,
//       level,
//       camp,
//     });
//     return {
//       level,
//       ribbon,
//       nature: nature.CAREFUL,
//       subskills,
//       skillLevel,
//       inventoryLimit,
//     };
//   }

//   const subskills = subskillsForFilter('ingredient', level, pokemon);
//   const inventoryLimit = InventoryUtils.calculateCarrySize({
//     baseWithEvolutions: maxCarrySize(pokemon),
//     subskills,
//     ribbon,
//     level,
//     camp,
//   });
//   return {
//     level,
//     ribbon,
//     nature: nature.QUIET,
//     subskills,
//     skillLevel,
//     inventoryLimit,
//   };
// }
