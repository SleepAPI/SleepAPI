import { Meal } from '../recipe/meal';

export interface Contribution {
  meal: Meal;
  percentage: number;
  contributedPower: number;
}

export interface CombinedContribution {
  contributions: Contribution[];
  averagePercentage: number;
  score: number;
}
