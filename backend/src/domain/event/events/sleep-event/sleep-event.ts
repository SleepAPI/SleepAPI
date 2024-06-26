import { Time, TimePeriod } from '@src/domain/time/time';
import { TimeUtils } from '@src/utils/time-utils/time-utils';
import { MathUtils } from 'sleepapi-common';
import { EventType, ScheduledEvent } from '../../event';

export class SleepEvent extends ScheduledEvent {
  time: Time;
  type: EventType = 'sleep';
  description: string;

  period: TimePeriod;
  sleepState: 'start' | 'end';

  constructor(params: { time: Time; description: string; period: TimePeriod; sleepState: 'start' | 'end' }) {
    const { time, description, period, sleepState } = params;
    super();

    this.time = time;
    this.description = description;

    this.period = period;
    this.sleepState = sleepState;
  }

  format(): string {
    const duration = TimeUtils.calculateDuration(this.period);
    const durationInMinute = TimeUtils.toMinutes(duration);
    const minutesInPerfectSleepScore = 8.5 * 60;
    const sleepScore = MathUtils.round(Math.min(durationInMinute / minutesInPerfectSleepScore, 1) * 100, 0);

    let result =
      `[${TimeUtils.prettifyTime(this.time)}][Sleep] (${this.description}): ` +
      `Duration ${TimeUtils.prettifyTime(duration)}`;
    if (this.sleepState === 'end') {
      result += `, Score (${sleepScore})`;
    }

    return result;
  }
}
