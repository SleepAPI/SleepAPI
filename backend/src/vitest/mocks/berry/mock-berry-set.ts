import { mockberry } from '@src/vitest/mocks/berry/mock-berry.js';
import { BerrySet } from 'sleepapi-common';

export function mockBerrySet(attrs?: Partial<BerrySet>): BerrySet {
  return {
    amount: 0,
    berry: mockberry(),
    level: 0,
    ...attrs
  };
}
