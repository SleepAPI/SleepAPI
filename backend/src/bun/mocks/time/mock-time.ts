import { TimeUtils } from '@src/utils/time-utils/time-utils.js';
import type { Time } from 'sleepapi-common';

export function time(attrs?: Partial<Time>): Time {
  return {
    hour: 0,
    minute: 0,
    second: 0,
    ...attrs
  };
}

export const BEDTIME = '21:30';
export function bedtime(attrs?: Partial<Time>): Time {
  return {
    ...TimeUtils.parseTime(BEDTIME),
    ...attrs
  };
}
export const WAKEUP = '06:00';
export function wakeup(attrs?: Partial<Time>): Time {
  return {
    ...TimeUtils.parseTime(WAKEUP),
    ...attrs
  };
}
