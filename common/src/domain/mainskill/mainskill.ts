export type MainSkillType =
  | 'energy'
  | 'ingredients'
  | 'helps'
  | 'dream shards'
  | 'strength'
  | 'pot size'
  | 'chance'
  | 'metronome';
export interface MainSkill {
  name: string;
  amount: number[]; // level 6: amount of ings, amount of energy, amount of strength
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
];
export const METRONOME_FACTOR = MAINSKILLS.filter((s) => s !== METRONOME).length;
