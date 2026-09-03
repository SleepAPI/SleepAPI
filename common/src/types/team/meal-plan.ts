export type MealSlot = 'breakfast' | 'lunch' | 'dinner';

export type MealPlanChoice =
  | { kind: 'best' }
  | { kind: 'none' }
  | {
      kind: 'recipe';
      recipe: string;
    };

export type DailyMealPlan = Record<MealSlot, MealPlanChoice>;

export type MealPlan = DailyMealPlan & {
  sunday?: DailyMealPlan;
};

export const DEFAULT_DAILY_MEAL_PLAN: DailyMealPlan = {
  breakfast: { kind: 'best' },
  lunch: { kind: 'best' },
  dinner: { kind: 'best' }
};

export const DEFAULT_MEAL_PLAN: MealPlan = {
  ...DEFAULT_DAILY_MEAL_PLAN,
  sunday: { ...DEFAULT_DAILY_MEAL_PLAN }
};

export function defaultDailyMealPlan(): DailyMealPlan {
  return {
    breakfast: { kind: 'best' },
    lunch: { kind: 'best' },
    dinner: { kind: 'best' }
  };
}

export function defaultMealPlan(): MealPlan {
  return {
    ...defaultDailyMealPlan(),
    sunday: defaultDailyMealPlan()
  };
}
