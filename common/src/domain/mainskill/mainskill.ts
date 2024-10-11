export type MainSkillType =
  | 'energy'
  | 'ingredients'
  | 'helps'
  | 'dream shards'
  | 'strength'
  | 'pot size'
  | 'chance'
  | 'metronome'
  | 'stockpile';
export interface MainSkill {
  name: string;
  amount: number[];
  unit: MainSkillType;
  maxLevel: number;
  description: string;
  RP: number[];
}
export const MAX_SKILL_LEVEL = 7;

export const INGREDIENT_MAGNET_S: MainSkill = {
  name: 'Ingredient Magnet S',
  amount: [6, 8, 11, 14, 17, 21, 24],
  unit: 'ingredients',
  maxLevel: MAX_SKILL_LEVEL,
  description: 'Gets you ? ingredients chosen at random.',
  RP: [880, 1251, 1726, 2383, 3290, 4546, 5843],
};

export const CHARGE_STRENGTH_S: MainSkill = {
  name: 'Charge Strength S',
  amount: [400, 569, 785, 1083, 1496, 2066, 3002],
  unit: 'strength',
  maxLevel: MAX_SKILL_LEVEL,
  description: "Increases Snorlax's Strength by ?.",
  RP: [400, 569, 785, 1083, 1496, 2066, 2656],
};

export const CHARGE_STRENGTH_S_RANGE: MainSkill = {
  name: 'Charge Strength S Range',
  amount: [
    (CHARGE_STRENGTH_S.amount[0] * 2 + CHARGE_STRENGTH_S.amount[0] * 0.5) / 2,
    (CHARGE_STRENGTH_S.amount[1] * 2 + CHARGE_STRENGTH_S.amount[1] * 0.5) / 2,
    (CHARGE_STRENGTH_S.amount[2] * 2 + CHARGE_STRENGTH_S.amount[2] * 0.5) / 2,
    (CHARGE_STRENGTH_S.amount[3] * 2 + CHARGE_STRENGTH_S.amount[3] * 0.5) / 2,
    (CHARGE_STRENGTH_S.amount[4] * 2 + CHARGE_STRENGTH_S.amount[4] * 0.5) / 2,
    (CHARGE_STRENGTH_S.amount[5] * 2 + CHARGE_STRENGTH_S.amount[5] * 0.5) / 2,
    (CHARGE_STRENGTH_S.amount[6] * 2 + CHARGE_STRENGTH_S.amount[6] * 0.5) / 2,
  ],
  unit: 'strength',
  maxLevel: MAX_SKILL_LEVEL,
  description: "Increases Snorlax's Strength on average by ?.",
  RP: [400, 569, 785, 1083, 1496, 2066, 2656],
};

export const CHARGE_STRENGTH_M: MainSkill = {
  name: 'Charge Strength M',
  amount: [880, 1251, 1726, 2383, 3290, 4546, 6409],
  unit: 'strength',
  maxLevel: MAX_SKILL_LEVEL,
  description: "Increases Snorlax's Strength by ?.",
  RP: [880, 1251, 1726, 2383, 3290, 4546, 5843],
};

export const DREAM_SHARD_MAGNET_S: MainSkill = {
  name: 'Dream Shard Magnet S',
  amount: [240, 340, 480, 670, 920, 1260, 1800],
  unit: 'dream shards',
  maxLevel: MAX_SKILL_LEVEL,
  description: 'Obtain ? Dream Shards.',
  RP: [400, 569, 785, 1083, 1496, 2066, 2656],
};

export const DREAM_SHARD_MAGNET_S_RANGE: MainSkill = {
  name: 'Dream Shard Magnet S Range',
  amount: [
    (DREAM_SHARD_MAGNET_S.amount[0] * 2 + DREAM_SHARD_MAGNET_S.amount[0] * 0.5) / 2,
    (DREAM_SHARD_MAGNET_S.amount[1] * 2 + DREAM_SHARD_MAGNET_S.amount[1] * 0.5) / 2,
    (DREAM_SHARD_MAGNET_S.amount[2] * 2 + DREAM_SHARD_MAGNET_S.amount[2] * 0.5) / 2,
    (DREAM_SHARD_MAGNET_S.amount[3] * 2 + DREAM_SHARD_MAGNET_S.amount[3] * 0.5) / 2,
    (DREAM_SHARD_MAGNET_S.amount[4] * 2 + DREAM_SHARD_MAGNET_S.amount[4] * 0.5) / 2,
    (DREAM_SHARD_MAGNET_S.amount[5] * 2 + DREAM_SHARD_MAGNET_S.amount[5] * 0.5) / 2,
    (DREAM_SHARD_MAGNET_S.amount[6] * 2 + DREAM_SHARD_MAGNET_S.amount[6] * 0.5) / 2,
  ],
  unit: 'dream shards',
  maxLevel: MAX_SKILL_LEVEL,
  description: 'Obtain ? Dream Shards on average.',
  RP: [400, 569, 785, 1083, 1496, 2066, 2656],
};

export const ENERGIZING_CHEER_S: MainSkill = {
  name: 'Energizing Cheer S',
  amount: [14, 17, 22, 28, 38, 50],
  unit: 'energy',
  maxLevel: MAX_SKILL_LEVEL - 1,
  description: 'Restores ? Energy to one random Pokémon on your team.',
  RP: [880, 1251, 1726, 2383, 3290, 4546],
};

export const CHARGE_ENERGY_S: MainSkill = {
  name: 'Charge Energy S',
  amount: [12, 16, 21, 26, 33, 43],
  unit: 'energy',
  maxLevel: MAX_SKILL_LEVEL - 1,
  description: 'Restores ? Energy to the user.',
  RP: [400, 569, 785, 1083, 1496, 2066],
};

export const ENERGY_FOR_EVERYONE: MainSkill = {
  name: 'Energy For Everyone',
  amount: [5, 7, 9, 11, 15, 18],
  unit: 'energy',
  maxLevel: MAX_SKILL_LEVEL - 1,
  description: 'Restores ? Energy to each helper Pokémon on your team.',
  RP: [1120, 1593, 2197, 3033, 4187, 5785],
};

export const EXTRA_HELPFUL_S: MainSkill = {
  name: 'Extra Helpful S',
  amount: [5, 6, 7, 8, 9, 10, 11],
  unit: 'helps',
  maxLevel: MAX_SKILL_LEVEL,
  description: 'Instantly gets you x? the usual help from a helper Pokémon.',
  RP: [880, 1251, 1726, 2383, 3290, 4546, 5843],
};

export const COOKING_POWER_UP_S: MainSkill = {
  name: 'Cooking Power-up S',
  amount: [7, 10, 12, 17, 22, 27, 32],
  unit: 'pot size',
  maxLevel: MAX_SKILL_LEVEL,
  description: 'Gives your pot room for ? more ingredients next time you cook.',
  RP: [880, 1251, 1726, 2383, 3290, 4546, 5843],
};

export const METRONOME: MainSkill = {
  name: 'Metronome',
  amount: [1, 2, 3, 4, 5, 6], // max level rolls max level amount of chosen skill
  unit: 'metronome',
  maxLevel: MAX_SKILL_LEVEL - 1,
  description: 'Uses one randomly chosen main skill.',
  RP: [880, 1251, 1726, 2383, 3290, 4546],
};

export const TASTY_CHANCE_S: MainSkill = {
  name: 'Tasty Chance S',
  amount: [4, 5, 6, 7, 8, 10],
  unit: 'chance',
  maxLevel: MAX_SKILL_LEVEL - 1,
  description:
    'Raises your Extra Tasty rate by ?%. The effect lasts until you cook an Extra Tasty dish or change sites.',
  RP: [880, 1251, 1726, 2383, 3290, 4546],
};

export const HELPER_BOOST: MainSkill = {
  name: 'Helper Boost',
  amount: [2, 3, 3, 4, 4, 5],
  unit: 'helps',
  maxLevel: MAX_SKILL_LEVEL - 1,
  description:
    'Instantly gets your x? the usual help from all Pokémon on your team. Meet certain conditions to boost effect.',
  RP: [2800, 3902, 5273, 6975, 9317, 12438],
};
export const HELPER_BOOST_UNIQUE_BOOST_TABLE: number[][] = [
  // Skill level 1 to 6
  [0, 0, 0, 0, 0, 0], // unique: 1
  [0, 0, 0, 0, 1, 1], // unique: 2
  [1, 1, 2, 2, 3, 3], // unique: 3
  [2, 2, 3, 3, 4, 4], // unique: 4
  [4, 4, 5, 5, 6, 6], // unique: 5
];

export const STOCKPILE_CHARGE_STRENGTH_S: MainSkill = {
  name: 'Stockpile (Charge Strength S',
  amount: [1, 1, 1, 1, 1, 1, 1],
  unit: 'stockpile',
  maxLevel: MAX_SKILL_LEVEL,
  description:
    "Stockpile or Spit Up is selected. When Spit Up triggers, Snorlax gains Strength from Stockpile's number.",
  RP: [600, 853, 1177, 1625, 2243, 3099, 3984],
};
export const STOCKPILE_STOCKS: Record<number, number[]> = {
  1: [600, 1020, 1500, 2040, 2640, 3300, 4020, 4920, 6180, 7980, 10980],
  2: [853, 1450, 2132, 2900, 3753, 4691, 5715, 6995, 8786, 11345, 15610],
  3: [1177, 2001, 2943, 4002, 5179, 6474, 7886, 9652, 12124, 15655, 21540],
  4: [1625, 2763, 4063, 5526, 7151, 8939, 10889, 13327, 16740, 21615, 29740],
  5: [2243, 3813, 5607, 7626, 9869, 12336, 15028, 18393, 23103, 29832, 41047],
  6: [3099, 5268, 7747, 10536, 13635, 17044, 20763, 25412, 31920, 41217, 56712],
  7: [4502, 7653, 11255, 15307, 19809, 24761, 30163, 36916, 46370, 59876, 82386],
};

export const MAINSKILLS: MainSkill[] = [
  CHARGE_ENERGY_S,
  ENERGIZING_CHEER_S,
  ENERGY_FOR_EVERYONE,
  CHARGE_STRENGTH_M,
  CHARGE_STRENGTH_S,
  CHARGE_STRENGTH_S_RANGE,
  DREAM_SHARD_MAGNET_S,
  DREAM_SHARD_MAGNET_S_RANGE,
  EXTRA_HELPFUL_S,
  HELPER_BOOST,
  COOKING_POWER_UP_S,
  TASTY_CHANCE_S,
  INGREDIENT_MAGNET_S,
  METRONOME,
  STOCKPILE_CHARGE_STRENGTH_S,
];
export const METRONOME_FACTOR = MAINSKILLS.filter((s) => s !== METRONOME).length;
