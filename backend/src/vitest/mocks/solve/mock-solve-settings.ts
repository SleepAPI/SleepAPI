import { BEDTIME, WAKEUP } from '@src/vitest/mocks/time/mock-time.js';
import { SolveSettings } from 'sleepapi-common';

export function solveSettings(attrs?: Partial<SolveSettings>): SolveSettings {
  return {
    camp: false,
    bedtime: BEDTIME,
    wakeup: WAKEUP,
    level: 0,
    ...attrs
  };
}
