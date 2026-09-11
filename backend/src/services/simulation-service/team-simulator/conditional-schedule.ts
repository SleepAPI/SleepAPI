import {
  getScheduleTarget,
  getConditionalScheduleDefinition,
  isConditionalSchedule,
  type ConditionalScheduleType,
  type TeamScheduleShift
} from 'sleepapi-common';
import type { CookingState } from './cooking-state/cooking-state.js';

interface RotationBonusContext {
  cookingState?: CookingState;
  sunday: boolean;
}

// Each bonus supplies its own reader. A future non-cooking bonus can extend this
// context without being gated on the existence of cookingState.
const bonusReaders: Record<ConditionalScheduleType, (context: RotationBonusContext) => number | undefined> = {
  'tasty-chance': ({ cookingState }) => cookingState?.extraTastyChancePercentage(),
  'pot-size': ({ cookingState, sunday }) => cookingState?.currentPotSize(sunday)
};

export function scheduleTargetReached(shift: TeamScheduleShift, context: RotationBonusContext): boolean {
  if (!isConditionalSchedule(shift.type)) return false;
  const target = getScheduleTarget(shift);
  const bonus = bonusReaders[shift.type](context);
  return (
    target !== undefined &&
    bonus !== undefined &&
    bonus >= Math.min(target, getConditionalScheduleDefinition(shift.type)?.maximumTarget ?? Infinity)
  );
}
