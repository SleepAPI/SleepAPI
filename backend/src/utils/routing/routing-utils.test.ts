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
  it('shall append level', () => {
    expect(queryParamsToString(30)).toBe('-level30');
  });
});
