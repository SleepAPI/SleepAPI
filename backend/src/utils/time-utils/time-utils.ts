import type { ScheduledEvent } from '@src/domain/event/event.js';
import { type Time, type TimePeriod } from 'sleepapi-common';
// TODO: can probably remove a lot in Sleep API 2.0import { MathUtils } from 'sleepapi-common';

class TimeUtilsImpl {
  private readonly SECONDS_IN_HOUR = 3600;
  private readonly SECONDS_IN_MINUTE = 60;
  private readonly SECONDS_IN_DAY = 24 * this.SECONDS_IN_HOUR;

  private timeToSeconds(time: Time): number {
    return time.hour * this.SECONDS_IN_HOUR + time.minute * this.SECONDS_IN_MINUTE + time.second;
  }

  public secondsToTime(seconds: number): Time {
    const safeSeconds = seconds % this.SECONDS_IN_DAY; // wrap 86400 to 0
    const s = Math.floor(safeSeconds % 60);
    const m = Math.floor((safeSeconds / 60) % 60);
    const h = Math.floor((safeSeconds / 3600) % 24);
    return { hour: h, minute: m, second: s };
  }

  public checkTimeout(params: { startTime: number; timeout: number }): boolean {
    const { startTime, timeout } = params;
    if (Date.now() - startTime >= timeout) {
      return true;
    }
    return false;
  }

  public toMinutes(time: Time) {
    return time.hour * 60 + time.minute;
  }

  public isAfterOrEqualWithinPeriod(params: { currentTime: Time; eventTime?: Time; period: TimePeriod }): boolean {
    const { currentTime, eventTime, period } = params;
    if (!eventTime) {
      return false;
    }

    const currentMinutes = this.timeToMinutesSinceStart(currentTime, period.start);
    const eventMinutes = this.timeToMinutesSinceStart(eventTime, period.start);
    const periodDuration = this.durationInMinutes(period);

    return currentMinutes >= eventMinutes && currentMinutes <= periodDuration;
  }

  public timeToMinutesSinceStart(time: Time, startTime: Time): number {
    let minutesSinceStart = time.hour * 60 + time.minute - (startTime.hour * 60 + startTime.minute);
    if (minutesSinceStart < 0) {
      // Adjusts for crossing midnight
      minutesSinceStart += 24 * 60;
    }
    return minutesSinceStart;
  }

  public durationInMinutes(period: TimePeriod): number {
    const startMinutes = period.start.hour * 60 + period.start.minute;
    const endMinutes = period.end.hour * 60 + period.end.minute;
    let duration = endMinutes - startMinutes;
    if (duration < 0) {
      // Adjusts for crossing midnight
      duration += 24 * 60;
    }
    return duration;
  }

  public addTime(time1: Time, time2: Time): Time {
    let totalSeconds = time1.second + time2.second;
    let totalMinutes = time1.minute + time2.minute + Math.floor(totalSeconds / 60);
    let totalHours = time1.hour + time2.hour + Math.floor(totalMinutes / 60);

    totalSeconds %= 60;
    totalMinutes %= 60;
    totalHours %= 24;

    const result: Time = {
      hour: totalHours,
      minute: totalMinutes,
      second: totalSeconds
    };

    return result;
  }

  public timeWithinPeriod(time: Time, period: TimePeriod): boolean {
    const timeInSeconds = this.timeToSeconds(time);
    const startTimeInSeconds = this.timeToSeconds(period.start);
    const endTimeInSeconds = this.timeToSeconds(period.end);

    if (startTimeInSeconds <= endTimeInSeconds) {
      return timeInSeconds >= startTimeInSeconds && timeInSeconds <= endTimeInSeconds;
    } else {
      return timeInSeconds >= startTimeInSeconds || timeInSeconds <= endTimeInSeconds;
    }
  }

  public getTimePeriodOverlap(a: TimePeriod, b: TimePeriod): TimePeriod[] {
    const aStartSec = this.timeToSeconds(a.start);
    const aEndSec = this.timeToSeconds(a.end);
    const bStartSec = this.timeToSeconds(b.start);
    const bEndSec = this.timeToSeconds(b.end);

    const aSegmentsInSeconds = this.splitTimePeriodAcrossMidnight(aStartSec, aEndSec);
    const bSegmentsInSeconds = this.splitTimePeriodAcrossMidnight(bStartSec, bEndSec);

    let overlaps: [number, number][] = [];

    for (const [aStart, aEnd] of aSegmentsInSeconds) {
      for (const [bStart, bEnd] of bSegmentsInSeconds) {
        const start = Math.max(aStart, bStart);
        const end = Math.min(aEnd, bEnd);
        if (start < end) {
          overlaps.push([start, end]);
        }
      }
    }

    overlaps = this.mergeContiguousTimePeriods(overlaps);

    return overlaps.map(([start, end]) => ({
      start: this.secondsToTime(start),
      end: this.secondsToTime(end)
    }));
  }

  private mergeContiguousTimePeriods(periods: [number, number][]): [number, number][] {
    if (periods.length <= 1) return periods;

    const sorted = [...periods].sort((a, b) => a[0] - b[0]);
    const merged: [number, number][] = [];

    let [start, end] = sorted[0];

    for (let i = 1; i < sorted.length; i++) {
      const [nextStart, nextEnd] = sorted[i];

      if (end === nextStart) {
        end = nextEnd;
      } else {
        merged.push([start, end]);
        start = nextStart;
        end = nextEnd;
      }
    }

    merged.push([start, end]);

    // wraparound if one ends at 86400 and the next starts at 0
    const wrapsAround = merged.length > 1 && merged[merged.length - 1][1] === this.SECONDS_IN_DAY && merged[0][0] === 0;

    if (wrapsAround) {
      const wrapMerged: [number, number] = [
        merged[merged.length - 1][0], // last segment start
        merged[0][1] // first segment end
      ];

      return [wrapMerged, ...merged.slice(1, -1)];
    }

    return merged;
  }

  public getLatestMinuteInOverlap(a: TimePeriod, b: TimePeriod): Time | undefined {
    const overlaps = this.getTimePeriodOverlap(a, b);

    if (overlaps.length === 0) return undefined;

    const latestSecond = Math.max(...overlaps.map((period) => this.timeToSeconds(period.end))) - 1;

    return {
      ...this.secondsToTime(latestSecond),
      second: 0
    };
  }

  public getEarliestMinuteInOverlap(a: TimePeriod, b: TimePeriod): Time | undefined {
    const overlaps = this.getTimePeriodOverlap(a, b);

    if (overlaps.length === 0) return undefined;

    return overlaps.map((period) => period.start).sort((time1, time2) => this.sortTimesForPeriod(time1, time2, b))[0];
  }

  public sortTimesForPeriod(time1: Time, time2: Time, period: TimePeriod): number {
    // Convert a time object to minutes since the start of the day for comparison
    const timeToMinutes = (time: Time) => time.hour * 60 + time.minute;

    // Convert period start and end to "minutes since start of the day"
    const periodStartMinutes = timeToMinutes(period.start);
    const periodEndMinutes = timeToMinutes(period.end);

    // Adjust times to account for periods that span midnight
    const adjustForPeriod = (timeMinutes: number) => {
      if (periodStartMinutes > periodEndMinutes) {
        // If the period spans midnight
        return timeMinutes < periodStartMinutes ? timeMinutes + 1440 : timeMinutes;
      }
      return timeMinutes;
    };

    // Adjust both times for comparison
    const adjustedTime1Minutes = adjustForPeriod(timeToMinutes(time1));
    const adjustedTime2Minutes = adjustForPeriod(timeToMinutes(time2));

    // Compare the adjusted times
    return adjustedTime1Minutes - adjustedTime2Minutes;
  }

  public isBefore(time1: Time, time2: Time): boolean {
    return (
      time1.hour < time2.hour ||
      (time1.hour === time2.hour && time1.minute < time2.minute) ||
      (time1.hour === time2.hour && time1.minute === time2.minute && time1.second < time2.second)
    );
  }

  public isAfterOrEqual(time1: Time, time2: Time): boolean {
    return (
      time1.hour >= time2.hour ||
      (time1.hour === time2.hour && time1.minute >= time2.minute) ||
      (time1.hour === time2.hour && time1.minute === time2.minute && time1.second >= time2.second)
    );
  }

  public sortEventsForPeriod<T extends ScheduledEvent>(dayPeriod: TimePeriod, events: T[]): T[] {
    return events.sort((a, b) => this.sortTimesForPeriod(a.time, b.time, dayPeriod));
  }

  /**
   * Calculates the sleep duration in hours, maximum 24 hours
   */
  public calculateDuration(params: { start: Time; end: Time }): Time {
    const { start, end } = params;

    let durationHour = end.hour - start.hour;
    let durationMinute = end.minute - start.minute;
    let durationSecond = end.second - start.second;

    // Adjust for negative seconds
    if (durationSecond < 0) {
      durationSecond += 60; // Add 60 seconds
      durationMinute -= 1; // Decrease minute by 1
    }

    // Adjust for negative minutes
    if (durationMinute < 0) {
      durationMinute += 60; // Add 60 minutes
      durationHour -= 1; // Decrease hour by 1
    }

    // Adjust for crossing midnight
    if (durationHour < 0) {
      durationHour += 24; // Add 24 hours
    }

    return {
      hour: durationHour,
      minute: durationMinute,
      second: durationSecond
    };
  }

  public divideTimePeriod(period: TimePeriod, chunks: number): TimePeriod[] {
    const startInSeconds = period.start.hour * 3600 + period.start.minute * 60 + period.start.second;
    const endInSeconds = period.end.hour * 3600 + period.end.minute * 60 + period.end.second;
    let totalDurationInSeconds = endInSeconds - startInSeconds;

    // Adjust for periods that span past midnight
    if (totalDurationInSeconds < 0) {
      totalDurationInSeconds += 24 * 3600; // Add a full day's seconds
    }

    const chunkDurationInSeconds = Math.floor(totalDurationInSeconds / chunks);

    const chunkDuration = {
      hour: Math.floor(chunkDurationInSeconds / 3600),
      minute: Math.floor((chunkDurationInSeconds % 3600) / 60),
      second: chunkDurationInSeconds % 60
    };

    const periods: TimePeriod[] = [];
    let currentStartTime = period.start;

    for (let i = 0; i < chunks; i++) {
      let currentEndTime = this.addTime(currentStartTime, chunkDuration);

      if (currentEndTime.hour === 24 && currentEndTime.minute === 0 && currentEndTime.second === 0) {
        currentEndTime = { hour: 0, minute: 0, second: 0 }; // Midnight adjustment
      }

      periods.push({ start: currentStartTime, end: currentEndTime });

      currentStartTime = currentEndTime;
    }

    return periods;
  }

  public getMySQLNow() {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
  }

  private splitTimePeriodAcrossMidnight(startSec: number, endSec: number): [number, number][] {
    // treat equal start and end as full 24-hour period
    if (startSec === endSec) {
      return [[0, this.SECONDS_IN_DAY]];
    }

    return startSec < endSec
      ? [[startSec, endSec]]
      : [
          [startSec, this.SECONDS_IN_DAY],
          [0, endSec]
        ];
  }
}

export const TimeUtils = new TimeUtilsImpl();
