import type { Produce } from 'sleepapi-common';

export function produce(attrs?: Partial<Produce>): Produce {
  return {
    berries: [],
    ingredients: [],
    ...attrs
  };
}
