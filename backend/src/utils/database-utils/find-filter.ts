import type { Knex } from 'knex';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export abstract class AbstractFilterOperator<T> {
  abstract apply(key: string, query: Knex.QueryBuilder): Knex.QueryBuilder;
}

class FilterLikeOperator extends AbstractFilterOperator<string> {
  constructor(public value: string) {
    super();
  }

  #caseInsensitive = false;

  caseInsensitive(): this {
    this.#caseInsensitive = true;
    return this;
  }

  apply(key: string, query: Knex.QueryBuilder): Knex.QueryBuilder {
    return this.#caseInsensitive
      ? query.whereRaw(`lower(${key}) like ?`, this.value.toLocaleLowerCase())
      : query.where(key, 'LIKE', this.value);
  }
}

class FilterNotLikeOperator extends AbstractFilterOperator<string> {
  constructor(public value: string) {
    super();
  }

  #caseInsensitive = false;

  caseInsensitive(): this {
    this.#caseInsensitive = true;
    return this;
  }

  apply(key: string, query: Knex.QueryBuilder): Knex.QueryBuilder {
    return this.#caseInsensitive ? query.not.whereILike(key, this.value) : query.not.whereLike(key, this.value);
  }
}

class FilterInOperator<T extends number | string> extends AbstractFilterOperator<T> {
  constructor(private values: Array<T>) {
    super();
  }

  apply(key: string, query: Knex.QueryBuilder): Knex.QueryBuilder {
    return query.whereIn(key, this.values);
  }
}

type ComparisonOperator = '>' | '<' | '<=' | '>=' | '!=' | '=';
class FilterComparisonOperator<T extends number | string | Date> extends AbstractFilterOperator<T> {
  constructor(
    private value: T,
    private operator: ComparisonOperator
  ) {
    super();
  }
  apply(key: string, query: Knex.QueryBuilder): Knex.QueryBuilder {
    return query.where(key, this.operator, this.value instanceof Date ? this.value.toISOString() : this.value);
  }
}

export function notLike(value: string) {
  return new FilterNotLikeOperator(value);
}

export function like(value: string) {
  return new FilterLikeOperator(value);
}

export function inArray<T extends string | number>(value: Array<T>) {
  return new FilterInOperator(value);
}

export function compare<T extends string | number | Date>(operator: ComparisonOperator, value: T) {
  return new FilterComparisonOperator(value, operator);
}

type FilterType<ITYPE> =
  NonNullable<ITYPE> extends (infer ISUBTYPE)[]
    ? AbstractFilterOperator<ISUBTYPE> | ISUBTYPE
    : AbstractFilterOperator<ITYPE> | ITYPE;

type OrFilter<ITYPE extends object> = {
  [P in keyof ITYPE]?: FilterType<ITYPE[P]> | Array<FilterType<ITYPE[P]>>;
};

export type Filter<ITYPE extends object> = {
  [P in keyof ITYPE]?: FilterType<ITYPE[P]> | Array<FilterType<ITYPE[P]>>;
} & { some?: OrFilter<ITYPE> };
