export type MealSlot = 'breakfast' | 'lunch' | 'dinner';

export type MealPlanChoice =
  | { kind: 'best' }
  | { kind: 'none' }
  | {
      kind: 'recipe';
      recipe: string;
    };

export type MealPlan = Record<MealSlot, MealPlanChoice>;

export const DEFAULT_MEAL_PLAN: MealPlan = {
  breakfast: { kind: 'best' },
  lunch: { kind: 'best' },
  dinner: { kind: 'best' }
};

export function defaultMealPlan(): MealPlan {
  return {
    breakfast: { kind: 'best' },
    lunch: { kind: 'best' },
    dinner: { kind: 'best' }
  };
}
