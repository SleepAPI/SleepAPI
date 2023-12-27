export interface MainSkill {
  name: string;
  amount: number; // level 6: amount of ings, amount of energy, amount of strength
}

export const INGREDIENT_MAGNET_S: MainSkill = {
  name: 'Ingredient Magnet S',
  amount: 21,
};

export const CHARGE_STRENGTH_S: MainSkill = {
  name: 'Charge Strength S',
  amount: 2066,
};

export const CHARGE_STRENGTH_S_RANGE: MainSkill = {
  name: 'Charge Strength S Range',
  amount: 2582.5, // average between min and max roll
};

export const CHARGE_STRENGTH_M: MainSkill = {
  name: 'Charge Strength M',
  amount: 4546,
};

export const DREAM_SHARD_MAGNET_S: MainSkill = {
  name: 'Dream Shard Magnet S',
  amount: 568,
};

export const DREAM_SHARD_MAGNET_S_RANGE: MainSkill = {
  name: 'Dream Shard Magnet S Range',
  amount: 710, // average between min and max roll
};

export const ENERGIZING_CHEER_S: MainSkill = {
  name: 'Energizing Cheer S',
  amount: 50,
};

export const CHARGE_ENERGY_S: MainSkill = {
  name: 'Charge Energy S',
  amount: 43,
};

export const ENERGY_FOR_EVERYONE: MainSkill = {
  name: 'Enery For Everyone',
  amount: 18,
};

export const EXTRA_HELPFUL_S: MainSkill = {
  name: 'Extra Helpful S',
  amount: 9,
};

export const COOKING_POWER_UP_S: MainSkill = {
  name: 'Cooking Power-up S',
  amount: 27,
};

export const METRONOME: MainSkill = {
  name: 'Metronome',
  amount: 0, // max level rolls max level amount of chosen skill
};
