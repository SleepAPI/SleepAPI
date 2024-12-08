import { Produce } from 'sleepapi-common';

export function mockProduce(attrs?: Partial<Produce>): Produce {
  return {
    berries: [],
    ingredients: [],
    ...attrs
  };
}
