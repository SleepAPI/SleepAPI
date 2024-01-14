import { queryAsBoolean, queryAsNumber, queryParamsToString } from './routing-utils';

describe('queryAsBoolean', () => {
  it('shall convert true to true', () => {
    expect(queryAsBoolean(true)).toBe(true);
  });

  it('shall convert false to false', () => {
    expect(queryAsBoolean(false)).toBe(false);
  });

  it('shall convert "true" string to true', () => {
    expect(queryAsBoolean('true')).toBe(true);
  });

  it('shall convert "false" string to false', () => {
    expect(queryAsBoolean('true')).toBe(true);
  });

  it('shall convert undefined to false', () => {
    expect(queryAsBoolean(undefined)).toBe(false);
  });
});

describe('queryAsNumber', () => {
  it('shall convert 2 to 2', () => {
    expect(queryAsNumber(2)).toBe(2);
  });

  it('shall convert "2" string to 2', () => {
    expect(queryAsNumber('2')).toBe(2);
  });

  it('shall convert undefined to undefined', () => {
    expect(queryAsNumber(undefined)).toBe(undefined);
  });
});

describe('queryParamsToString', () => {
  it('shall handle empty params', () => {
    expect(queryParamsToString({})).toBe('');
  });

  it('shall handle all params', () => {
    const params = {
      level: 5,
      advanced: true,
      unlocked: false,
      lategame: true,
      nrOfMeals: 3,
    };
    expect(queryParamsToString(params)).toBe('-level5-advanced-lategame-nrOfMeals');
  });
});
