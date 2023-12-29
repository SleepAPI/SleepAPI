export interface SubSkill {
  name: string;
  frequency: number;
  ingredient: number;
  skill: number;
  inventory: number;
}

export const BERRY_FINDING_S: SubSkill = {
  name: 'Berry Finding S',
  frequency: 0.0,
  ingredient: 0,
  skill: 0,
  inventory: 0,
};

export const HELPING_SPEED_S: SubSkill = {
  name: 'Helping Speed S',
  frequency: 0.07,
  ingredient: 0,
  skill: 0,
  inventory: 0,
};

export const HELPING_SPEED_M: SubSkill = {
  name: 'Helping Speed M',
  frequency: 0.14,
  ingredient: 0,
  skill: 0,
  inventory: 0,
};

export const INGREDIENT_FINDER_S: SubSkill = {
  name: 'Ingredient Finder S',
  frequency: 0,
  ingredient: 0.18,
  skill: 0,
  inventory: 0,
};

export const INGREDIENT_FINDER_M: SubSkill = {
  name: 'Ingredient Finder M',
  frequency: 0,
  ingredient: 0.36,
  skill: 0,
  inventory: 0,
};

export const SKILL_TRIGGER_S: SubSkill = {
  name: 'Skill Trigger S',
  frequency: 0,
  ingredient: 0,
  skill: 0.18,
  inventory: 0,
};

export const SKILL_TRIGGER_M: SubSkill = {
  name: 'Skill Trigger M',
  frequency: 0,
  ingredient: 0,
  skill: 0.36,
  inventory: 0,
};

export const INVENTORY_S: SubSkill = {
  name: 'Inventory Up S',
  frequency: 0,
  ingredient: 0,
  skill: 0,
  inventory: 6,
};

export const INVENTORY_M: SubSkill = {
  name: 'Inventory Up M',
  frequency: 0,
  ingredient: 0,
  skill: 0,
  inventory: 12,
};

export const INVENTORY_L: SubSkill = {
  name: 'Inventory Up L',
  frequency: 0,
  ingredient: 0,
  skill: 0,
  inventory: 18,
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
];
