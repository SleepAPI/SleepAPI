import { Response } from 'express';

interface QueryToCSVFileName {
  level?: number;
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

export function queryAsMandatoryNumber(key: string, value: string | number | undefined): number {
  if (!value) {
    throw new Error(`Missing query parameter value for [${key}]`);
  }
  return +value;
}

export function queryParamsToString(params: QueryToCSVFileName): string {
  let result = '';
  const { level, advanced, unlocked, lategame, nrOfMeals } = params;
  if (queryAsNumber(level)) {
    result += `-level${level}`;
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
