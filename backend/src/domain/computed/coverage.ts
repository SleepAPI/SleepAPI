import { Meal } from '../recipe/meal';

export interface Contribution {
  meal: Meal;
  percentage: number;
  contributedPower: number;
}

export interface CombinedContribution {
  bestMeals: Contribution[];
  averagePercentage: number;
  summedContributedPower: number;
}
