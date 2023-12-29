import { Response } from 'express';
import { SubskillSet } from '../../domain/stat/subskill';

export interface SelectedMealQueryParams {
  advanced?: boolean;
  unlocked?: boolean;
  lategame?: boolean;
  curry?: boolean;
  salad?: boolean;
  dessert?: boolean;
  csv?: boolean;
}

export interface FilteredQueryParams {
  limit30?: boolean;
  cyan?: boolean;
  taupe?: boolean;
  snowdrop?: boolean;
  e4e?: number;
  helpingbonus?: number;
  camp?: boolean;
  nature?: string;
  subskills?: SubskillSet;
  pretty?: boolean;
  csv?: boolean;
}

export interface FilteredWithMealsQueryParams {
  limit30?: boolean;
  cyan?: boolean;
  taupe?: boolean;
  snowdrop?: boolean;
  advanced?: boolean;
  unlocked?: boolean;
  lategame?: boolean;
  curry?: boolean;
  salad?: boolean;
  dessert?: boolean;
  pretty?: boolean;
  csv?: boolean;
}

interface QueryToCSVFileName {
  limit30?: boolean;
  advanced?: boolean;
  unlocked?: boolean;
  lategame?: boolean;
  nrOfMeals?: number;
}

export function queryAsBoolean(value: string | boolean | undefined): boolean {
  return (value + '').toLowerCase() === 'true';
}

export function queryAsNumber(value: string | number | undefined): number | undefined {
  return value ? +value : undefined;
}

export function queryParamsToString(params: QueryToCSVFileName): string {
  let result = '';
  const { limit30, advanced, unlocked, lategame, nrOfMeals } = params;
  if (queryAsBoolean(limit30)) {
    result += '-limit30';
  }
  if (queryAsBoolean(advanced)) {
    result += '-advanced';
  }
  if (queryAsBoolean(unlocked)) {
    result += '-unlocked';
  }
  if (queryAsBoolean(lategame)) {
    result += '-lategame';
  }
  if (queryAsNumber(nrOfMeals)) {
    result += '-nrOfMeals';
  }
  return result;
}

export function respondWithCSV(response: Response, data: string, filename: string) {
  response.set('Content-Disposition', `attachment; filename=${filename}.csv`);
  response.type('csv');
  response.end(data);
}
