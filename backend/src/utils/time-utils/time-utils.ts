import { ScheduledEvent } from '@src/domain/event/event';
import { Time, TimePeriod } from '@src/domain/time/time';
import { roundDown } from '../calculator-utils/calculator-utils';

export function toMinutes(time: Time) {
  return time.hour * 60 + time.minute;
}

export function isAfterOrEqualWithinPeriod(params: {
  currentTime: Time;
  eventTime?: Time;
  period: TimePeriod;
}): boolean {
  const { currentTime, eventTime, period } = params;
  if (!eventTime) {
    return false;
  }

  const currentMinutes = timeToMinutesSinceStart(currentTime, period.start);
  const eventMinutes = timeToMinutesSinceStart(eventTime, period.start);
  const periodDuration = calculatePeriodDuration(period);

  return currentMinutes >= eventMinutes && currentMinutes <= periodDuration;
}

// used by isAfterOrEqualWithinPeriod
function timeToMinutesSinceStart(time: Time, startTime: Time): number {
  let minutesSinceStart = time.hour * 60 + time.minute - (startTime.hour * 60 + startTime.minute);
  if (minutesSinceStart < 0) {
    // Adjusts for crossing midnight
    minutesSinceStart += 24 * 60;
  }
  return minutesSinceStart;
}

// used by isAfterOrEqualWithinPeriod
function calculatePeriodDuration(period: TimePeriod): number {
  const startMinutes = period.start.hour * 60 + period.start.minute;
  const endMinutes = period.end.hour * 60 + period.end.minute;
  let duration = endMinutes - startMinutes;
  if (duration < 0) {
    // Adjusts for crossing midnight
    duration += 24 * 60;
  }
  return duration;
}

export function addTime(time1: Time, time2: Time): Time {
  let totalSeconds = time1.second + time2.second;
  let totalMinutes = time1.minute + time2.minute + Math.floor(totalSeconds / 60);
  let totalHours = time1.hour + time2.hour + Math.floor(totalMinutes / 60);

  totalSeconds %= 60;
  totalMinutes %= 60;
  totalHours %= 24;

  return {
    hour: totalHours,
    minute: totalMinutes,
    second: totalSeconds,
  };
}

export function timeWithinPeriod(time: Time, period: TimePeriod): boolean {
  const startTime = period.start;
  const endTime = period.end;

  // Convert times to a comparable format (seconds since midnight)
  const timeInSeconds = time.hour * 3600 + time.minute * 60 + time.second;
  const startTimeInSeconds = startTime.hour * 3600 + startTime.minute * 60 + startTime.second;
  const endTimeInSeconds = endTime.hour * 3600 + endTime.minute * 60 + endTime.second;

  // Normalize and compare when period does not span over midnight
  if (startTimeInSeconds < endTimeInSeconds) {
    return timeInSeconds >= startTimeInSeconds && timeInSeconds <= endTimeInSeconds;
  } else {
    // Handle period spanning over midnight
    return timeInSeconds >= startTimeInSeconds || timeInSeconds <= endTimeInSeconds;
  }
}

export function sortTimesForPeriod(time1: Time, time2: Time, period: TimePeriod): number {
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

export function isBefore(time1: Time, time2: Time): boolean {
  return (
    time1.hour < time2.hour ||
    (time1.hour === time2.hour && time1.minute < time2.minute) ||
    (time1.hour === time2.hour && time1.minute === time2.minute && time1.second < time2.second)
  );
}

export function isAfterOrEqual(time1: Time, time2: Time): boolean {
  return (
    time1.hour >= time2.hour ||
    (time1.hour === time2.hour && time1.minute >= time2.minute) ||
    (time1.hour === time2.hour && time1.minute === time2.minute && time1.second >= time2.second)
  );
}

export function sortEventsForPeriod<T extends ScheduledEvent>(dayPeriod: TimePeriod, events: T[]): T[] {
  return events.sort((a, b) => sortTimesForPeriod(a.time, b.time, dayPeriod));
}

/**
 * Calculates the sleep duration in hours, maximum 24 hours
 */
export function calculateDuration(params: { start: Time; end: Time }): Time {
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
    second: durationSecond,
  };
}

export function divideTimePeriod(period: TimePeriod, chunks: number): TimePeriod[] {
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
    second: chunkDurationInSeconds % 60,
  };

  const periods: TimePeriod[] = [];
  let currentStartTime = period.start;

  for (let i = 0; i < chunks; i++) {
    let currentEndTime = addTime(currentStartTime, chunkDuration);

    if (currentEndTime.hour === 24 && currentEndTime.minute === 0 && currentEndTime.second === 0) {
      currentEndTime = { hour: 0, minute: 0, second: 0 }; // Midnight adjustment
    }

    periods.push({ start: currentStartTime, end: currentEndTime });

    currentStartTime = currentEndTime;
  }

  return periods;
}

export function secondsToTime(seconds: number): Time {
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds %= 60;

  return {
    hour: hours,
    minute: minutes,
    second: seconds,
  };
}

export function parseTime(time: string): Time {
  const [hour, minute] = time.split(':').map((t) => +t);
  return {
    hour,
    minute,
    second: 0,
  };
}

export function prettifyTime(time: Time) {
  const hourString = String(time.hour).padStart(2, '0');
  const minuteString = String(time.minute).padStart(2, '0');
  const secondString = String(roundDown(time.second, 0)).padStart(2, '0');

  return `${hourString}:${minuteString}:${secondString}`;
}
