import { recipe } from 'sleepapi-common';

export interface Contribution {
  meal: recipe.Recipe;
  percentage: number;
  contributedPower: number;
}

export interface CombinedContribution {
  contributions: Contribution[];
  averagePercentage: number;
  score: number;
}
