import { TimePeriod, nature } from 'sleepapi-common';

export interface SleepInfo {
  period: TimePeriod;
  nature: nature.Nature;
  incense: boolean;
  erb: number;
}
