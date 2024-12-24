import { EnergyEvent } from './energy-event';

describe('EnergyEvent', () => {
  it('format shall list before and after if provided', () => {
    const energyEvent: EnergyEvent = new EnergyEvent({
      time: { hour: 6, minute: 0, second: 0 },
      description: 'Sleep',
      delta: 88,
      before: 12
    });
    expect(energyEvent.format()).toMatchInlineSnapshot(
      `"[06:00:00][Energy] (Sleep): Recovery: +88%, Energy: 12% -> 100%, Energy coefficient: 0.45"`
    );
  });
});
