export interface SubSkill {
  name: string;
  amount: number;
  rarity: 'gold' | 'silver' | 'white';
}

export const BERRY_FINDING_S: SubSkill = {
  name: 'Berry Finding S',
  amount: 1,
  rarity: 'gold',
};

export const ENERGY_RECOVERY_BONUS: SubSkill = {
  name: 'Energy Recovery Bonus',
  amount: 0.14,
  rarity: 'gold',
};

export const HELPING_BONUS: SubSkill = {
  name: 'Helping Bonus',
  amount: 0.05,
  rarity: 'gold',
};

export const HELPING_SPEED_S: SubSkill = {
  name: 'Helping Speed S',
  amount: 0.07,
  rarity: 'white',
};

export const HELPING_SPEED_M: SubSkill = {
  name: 'Helping Speed M',
  amount: 0.14,
  rarity: 'silver',
};

export const INGREDIENT_FINDER_S: SubSkill = {
  name: 'Ingredient Finder S',
  amount: 0.18,
  rarity: 'white',
};

export const INGREDIENT_FINDER_M: SubSkill = {
  name: 'Ingredient Finder M',
  amount: 0.36,
  rarity: 'silver',
};

export const INVENTORY_S: SubSkill = {
  name: 'Inventory Up S',
  amount: 6,
  rarity: 'white',
};

export const INVENTORY_M: SubSkill = {
  name: 'Inventory Up M',
  amount: 12,
  rarity: 'silver',
};

export const INVENTORY_L: SubSkill = {
  name: 'Inventory Up L',
  amount: 18,
  rarity: 'silver',
};

export const SKILL_LEVEL_UP_S: SubSkill = {
  name: 'Skill Level Up S',
  amount: 1,
  rarity: 'silver',
};

export const SKILL_LEVEL_UP_M: SubSkill = {
  name: 'Skill Level Up M',
  amount: 2,
  rarity: 'gold',
};

export const SKILL_TRIGGER_S: SubSkill = {
  name: 'Skill Trigger S',
  amount: 0.18,
  rarity: 'white',
};

export const SKILL_TRIGGER_M: SubSkill = {
  name: 'Skill Trigger M',
  amount: 0.36,
  rarity: 'silver',
};

export const SLEEP_EXP_BONUS: SubSkill = {
  name: 'Sleep EXP Bonus',
  amount: 0.14,
  rarity: 'gold',
};

export const DREAM_SHARD_BONUS: SubSkill = {
  name: 'Dream Shard Bonus',
  amount: 0.06,
  rarity: 'gold',
};

export const RESEARCH_EXP_BONUS: SubSkill = {
  name: 'Research EXP Bonus',
  amount: 0.06,
  rarity: 'gold',
};

export const SUBSKILLS: SubSkill[] = [
  BERRY_FINDING_S,
  DREAM_SHARD_BONUS,
  ENERGY_RECOVERY_BONUS,
  HELPING_BONUS,
  HELPING_SPEED_S,
  HELPING_SPEED_M,
  INGREDIENT_FINDER_S,
  INGREDIENT_FINDER_M,
  INVENTORY_S,
  INVENTORY_M,
  INVENTORY_L,
  RESEARCH_EXP_BONUS,
  SKILL_LEVEL_UP_M,
  SKILL_LEVEL_UP_S,
  SKILL_TRIGGER_M,
  SKILL_TRIGGER_S,
  SLEEP_EXP_BONUS,
];
