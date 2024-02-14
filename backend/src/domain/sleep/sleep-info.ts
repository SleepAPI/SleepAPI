import { nature } from 'sleepapi-common';
import { TimePeriod } from '../time/time';

export interface SleepInfo {
  period: TimePeriod;
  nature: nature.Nature;
  incense: boolean;
  erb: number;
}
