export function queryAsBoolean(value: string | boolean | undefined): boolean {
  return (value + '').toLowerCase() === 'true';
}

export function queryAsNumber(value: string | number | undefined): number | undefined {
  return value ? +value : undefined;
}

export function queryParamsToString(level: number): string {
  let result = '';
  if (queryAsNumber(level)) {
    result += `-level${level}`;
  }

  return result;
}
