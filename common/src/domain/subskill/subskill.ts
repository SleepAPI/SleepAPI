export interface SubSkill {
  name: string;
  amount: number;
}

export const BERRY_FINDING_S: SubSkill = {
  name: 'Berry Finding S',
  amount: 1,
};

export const HELPING_SPEED_S: SubSkill = {
  name: 'Helping Speed S',
  amount: 0.07,
};

export const HELPING_SPEED_M: SubSkill = {
  name: 'Helping Speed M',
  amount: 0.14,
};

export const INGREDIENT_FINDER_S: SubSkill = {
  name: 'Ingredient Finder S',
  amount: 0.18,
};

export const INGREDIENT_FINDER_M: SubSkill = {
  name: 'Ingredient Finder M',
  amount: 0.36,
};

export const SKILL_TRIGGER_S: SubSkill = {
  name: 'Skill Trigger S',
  amount: 0.18,
};

export const SKILL_TRIGGER_M: SubSkill = {
  name: 'Skill Trigger M',
  amount: 0.36,
};

export const INVENTORY_S: SubSkill = {
  name: 'Inventory Up S',
  amount: 6,
};

export const INVENTORY_M: SubSkill = {
  name: 'Inventory Up M',
  amount: 12,
};

export const INVENTORY_L: SubSkill = {
  name: 'Inventory Up L',
  amount: 18,
};

export const ENERGY_RECOVERY_BONUS: SubSkill = {
  name: 'Energy Recovery Bonus',
  amount: 0.14,
};

export type SubskillSet = 'optimal' | 'neutral';

export const SUBSKILLS: SubSkill[] = [
  BERRY_FINDING_S,
  HELPING_SPEED_S,
  HELPING_SPEED_M,
  INGREDIENT_FINDER_S,
  INGREDIENT_FINDER_M,
  INVENTORY_S,
  INVENTORY_M,
  INVENTORY_L,
  SKILL_TRIGGER_M,
  SKILL_TRIGGER_S,
  ENERGY_RECOVERY_BONUS,
];
