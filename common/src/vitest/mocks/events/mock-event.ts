import type { Event } from '../../../types/events/event-types';

export function event(attrs?: Partial<Event>): Event {
  const now = new Date();
  return {
    name: 'Test Event',
    description: 'Test event description',
    modifiers: [
      {
        type: 'PokemonInstanceDto',
        leftValue: 'pokemon.frequency',
        operation: '*',
        rightValue: 0.9
      }
    ],
    startDate: new Date(now.getTime() - 86400000), // Yesterday
    endDate: new Date(now.getTime() + 86400000), // Tomorrow
    ...attrs
  };
}
