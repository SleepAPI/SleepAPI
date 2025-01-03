import { BEDTIME, WAKEUP } from '@src/bun/mocks/time/mock-time.js';
import type { SolveSettings } from 'sleepapi-common';

export function solveSettings(attrs?: Partial<SolveSettings>): SolveSettings {
  return {
    camp: false,
    bedtime: BEDTIME,
    wakeup: WAKEUP,
    level: 0,
    ...attrs
  };
}
