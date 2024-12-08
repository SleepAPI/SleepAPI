import { TimeUtils } from '@src/utils/time-utils/time-utils.js';
import { Time } from 'sleepapi-common';

export function mockTime(attrs?: Partial<Time>): Time {
  return {
    hour: 0,
    minute: 0,
    second: 0,
    ...attrs
  };
}

export const BEDTIME = '21:30';
export function mockBedtime(attrs?: Partial<Time>): Time {
  return {
    ...TimeUtils.parseTime(BEDTIME),
    ...attrs
  };
}
export const WAKEUP = '06:00';
export function mockWakeup(attrs?: Partial<Time>): Time {
  return {
    ...TimeUtils.parseTime(WAKEUP),
    ...attrs
  };
}
