import { Recipe } from 'sleepapi-common';

export interface Contribution {
  meal: Recipe;
  percentage: number;
  contributedPower: number;
}

export interface CombinedContribution {
  contributions: Contribution[];
  averagePercentage: number;
  score: number;
}
