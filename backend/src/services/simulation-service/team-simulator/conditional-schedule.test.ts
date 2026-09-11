import { describe, expect, it, vi } from 'vitest';
import type { TeamScheduleShift } from 'sleepapi-common';
import type { CookingState } from './cooking-state/cooking-state.js';
import { scheduleTargetReached } from './conditional-schedule.js';

const shift: TeamScheduleShift = {
  slotIndex: 0,
  externalId: 'a',
  startTime: '06:00',
  type: 'tasty-chance',
  tastyChanceTarget: 30
};
const cookingState = {
  extraTastyChancePercentage: () => 30,
  currentPotSize: vi.fn((sunday: boolean) => (sunday ? 200 : 100))
} as unknown as CookingState;

describe('rotation bonus readers', () => {
  it('switches at the target and returns when the bonus falls below it', () => {
    expect(scheduleTargetReached(shift, { cookingState, sunday: false })).toBe(true);
    expect(scheduleTargetReached({ ...shift, tastyChanceTarget: 31 }, { cookingState, sunday: false })).toBe(false);
  });
  it('uses Sunday capacity for pot targets', () => {
    const pot: TeamScheduleShift = { ...shift, type: 'pot-size', potSizeTarget: 150 };
    expect(scheduleTargetReached(pot, { cookingState, sunday: false })).toBe(false);
    expect(scheduleTargetReached(pot, { cookingState, sunday: true })).toBe(true);
  });
  it('does not switch when the bonus state or target is missing', () => {
    expect(scheduleTargetReached(shift, { sunday: false })).toBe(false);
    expect(scheduleTargetReached({ ...shift, tastyChanceTarget: undefined }, { cookingState, sunday: false })).toBe(
      false
    );
  });
});
