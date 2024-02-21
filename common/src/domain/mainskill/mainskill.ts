export interface MainSkill {
  name: string;
  amount: number; // level 6: amount of ings, amount of energy, amount of strength
  unit: 'energy' | 'ingredients' | 'helps' | 'dream shards' | 'strength' | 'pot size';
}

export const INGREDIENT_MAGNET_S: MainSkill = {
  name: 'Ingredient Magnet S',
  amount: 21,
  unit: 'ingredients',
};

export const CHARGE_STRENGTH_S: MainSkill = {
  name: 'Charge Strength S',
  amount: 2066,
  unit: 'strength',
};

export const CHARGE_STRENGTH_S_RANGE: MainSkill = {
  name: 'Charge Strength S Range',
  amount: (CHARGE_STRENGTH_S.amount * 2 + CHARGE_STRENGTH_S.amount * 0.5) / 2,
  unit: 'strength',
};

export const CHARGE_STRENGTH_M: MainSkill = {
  name: 'Charge Strength M',
  amount: 4546,
  unit: 'strength',
};

export const DREAM_SHARD_MAGNET_S: MainSkill = {
  name: 'Dream Shard Magnet S',
  amount: 1260,
  unit: 'dream shards',
};

export const DREAM_SHARD_MAGNET_S_RANGE: MainSkill = {
  name: 'Dream Shard Magnet S Range',
  amount: (DREAM_SHARD_MAGNET_S.amount * 2 + DREAM_SHARD_MAGNET_S.amount * 0.5) / 2,
  unit: 'dream shards',
};

export const ENERGIZING_CHEER_S: MainSkill = {
  name: 'Energizing Cheer S',
  amount: 50,
  unit: 'energy',
};

export const CHARGE_ENERGY_S: MainSkill = {
  name: 'Charge Energy S',
  amount: 43,
  unit: 'energy',
};

export const ENERGY_FOR_EVERYONE: MainSkill = {
  name: 'Energy For Everyone',
  amount: 18,
  unit: 'energy',
};

export const EXTRA_HELPFUL_S: MainSkill = {
  name: 'Extra Helpful S',
  amount: 10,
  unit: 'helps',
};

export const COOKING_POWER_UP_S: MainSkill = {
  name: 'Cooking Power-up S',
  amount: 27,
  unit: 'pot size',
};

export const METRONOME: MainSkill = {
  name: 'Metronome',
  amount: 0, // max level rolls max level amount of chosen skill
  unit: 'helps',
};

export const MAINSKILLS: MainSkill[] = [
  CHARGE_ENERGY_S,
  CHARGE_STRENGTH_M,
  CHARGE_STRENGTH_S,
  CHARGE_STRENGTH_S_RANGE,
  COOKING_POWER_UP_S,
  DREAM_SHARD_MAGNET_S,
  DREAM_SHARD_MAGNET_S_RANGE,
  ENERGIZING_CHEER_S,
  ENERGY_FOR_EVERYONE,
  EXTRA_HELPFUL_S,
  INGREDIENT_MAGNET_S,
  METRONOME,
];
