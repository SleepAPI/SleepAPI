import {
  CookingAssistSBulkUp,
  CookingPowerUpS,
  CookingPowerUpSMinus,
  TastyChanceS,
  type Mainskill
} from '../../types/mainskill';
import type { TeamScheduleShift, TeamScheduleType } from '../../types/team/team';

export type ConditionalScheduleType = Exclude<TeamScheduleType, 'time'>;

interface ConditionalScheduleDefinition {
  title: string;
  description: string;
  targetLabel: string;
  targetField: 'tastyChanceTarget' | 'potSizeTarget';
  defaultTarget: number;
  maximumTarget?: number;
  inputmode: 'decimal' | 'numeric';
  eligibleSkills: Mainskill[];
  requiresCooking: boolean;
  validateTarget: (target: number) => string;
}

/** Type-specific rules for the two-member, accumulate-then-return rotation policy.
 * Keep persisted target keys here so existing schedules do not need a migration.
 * Backend bonus readers are separately exhaustive over ConditionalScheduleType.
 */
export const conditionalScheduleDefinitions: Record<ConditionalScheduleType, ConditionalScheduleDefinition> = {
  'tasty-chance': {
    title: 'Extra tasty chance',
    description: 'Rotate after accumulated Extra Tasty chance reaches the target.',
    targetLabel: 'Extra Tasty chance %',
    targetField: 'tastyChanceTarget',
    defaultTarget: 30,
    maximumTarget: 70,
    inputmode: 'decimal',
    eligibleSkills: [TastyChanceS, CookingAssistSBulkUp],
    requiresCooking: true,
    validateTarget: (target) => (target > 70 ? 'Enter a chance of 70% or less.' : '')
  },
  'pot-size': {
    title: 'Pot size',
    description: 'Rotate after cooking pot size reaches the target.',
    targetLabel: 'Pot size',
    targetField: 'potSizeTarget',
    defaultTarget: 1,
    inputmode: 'numeric',
    eligibleSkills: [CookingPowerUpS, CookingPowerUpSMinus],
    requiresCooking: true,
    validateTarget: (target) => (Number.isSafeInteger(target) ? '' : 'Enter a whole number for pot size.')
  }
};

export function isConditionalSchedule(type: TeamScheduleType | undefined): type is ConditionalScheduleType {
  return type !== undefined && Object.hasOwn(conditionalScheduleDefinitions, type);
}

export function getConditionalScheduleDefinition(type: TeamScheduleType | undefined) {
  return isConditionalSchedule(type) ? conditionalScheduleDefinitions[type] : undefined;
}

export function getScheduleTarget(shift: TeamScheduleShift): number | undefined {
  const definition = getConditionalScheduleDefinition(shift.type);
  return definition ? shift[definition.targetField] : undefined;
}

export function withScheduleTarget(
  shift: TeamScheduleShift,
  type: TeamScheduleType,
  target?: number
): TeamScheduleShift {
  const next = { ...shift, type };
  for (const definition of Object.values(conditionalScheduleDefinitions)) delete next[definition.targetField];
  const definition = getConditionalScheduleDefinition(type);
  if (definition && target !== undefined) next[definition.targetField] = target;
  return next;
}

export function validateScheduleTarget(type: TeamScheduleType, target: number): string {
  const definition = getConditionalScheduleDefinition(type);
  if (!definition) return '';
  if (!Number.isFinite(target) || target < 1) return 'Enter a number of at least 1.';
  return definition.validateTarget(target);
}
