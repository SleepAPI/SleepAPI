import { Time } from '../time/time';

export type EventType = 'sleep' | 'energy' | 'help' | 'inventory' | 'info' | 'skill';
export abstract class ScheduledEvent {
  abstract time: Time;
  abstract type: EventType;
  abstract description: string;

  abstract format(): string;
}
