import { PokemonProduce } from '@src/domain/combination/produce';
import { ProgrammingError } from '@src/domain/error/programming/programming-error';
import { SkillActivation } from '@src/domain/event/events/skill-event/skill-event';
import { mainskill } from 'sleepapi-common';
import { createSkillEvent } from './activation/skill-activation';

export function calculateSkillProcs(nrOfHelps: number, skillPercentage: number) {
  return nrOfHelps * skillPercentage;
}

export function calculateOddsAtLeastOneSkillProc(params: { skillPercentage: number; helps: number }): number {
  const { skillPercentage, helps } = params;
  const probabilityOfNoSuccess = Math.pow(1 - skillPercentage, helps);
  const probabilityOfAtLeastOneSuccess = 1 - probabilityOfNoSuccess;

  return probabilityOfAtLeastOneSuccess;
}

export function scheduleSkillEvents(params: {
  skillLevel: number;
  pokemonWithAverageProduce: PokemonProduce;
  oddsOfNightSkillProc: number;
  nrOfDaySkillProcs: number;
  nrOfDayHelps: number;
  uniqueHelperBoost: number;
}) {
  const {
    skillLevel,
    pokemonWithAverageProduce,
    oddsOfNightSkillProc,
    nrOfDaySkillProcs,
    nrOfDayHelps,
    uniqueHelperBoost,
  } = params;
  const skill = pokemonWithAverageProduce.pokemon.skill;

  const activationsWithAdjustedAmount = calculateHelpsToProcSchedule({
    oddsOfNightSkillProc,
    nrOfDaySkillProcs,
    nrOfDayHelps,
  });

  const skillActivations: SkillActivation[] = [];

  activationsWithAdjustedAmount.forEach(({ nrOfHelpsToActivate, adjustedAmount }) =>
    createSkillEvent({
      skill,
      skillLevel,
      nrOfHelpsToActivate,
      adjustedAmount,
      pokemonWithAverageProduce,
      skillActivations,
      uniqueHelperBoost,
    })
  );

  return skillActivations;
}

export function calculateHelpsToProcSchedule(params: {
  oddsOfNightSkillProc: number;
  nrOfDaySkillProcs: number;
  nrOfDayHelps: number;
}): { nrOfHelpsToActivate: number; adjustedAmount: number }[] {
  const { oddsOfNightSkillProc, nrOfDaySkillProcs, nrOfDayHelps } = params;

  const nrOfHelpsBeforeSkillActivates = nrOfDayHelps / nrOfDaySkillProcs;
  const nrOfFullSkillProcs = Math.floor(nrOfDaySkillProcs);

  // add nightly partial activation at 0 helps
  const activationsWithAdjustedAmount: { nrOfHelpsToActivate: number; adjustedAmount: number }[] = [
    {
      nrOfHelpsToActivate: 0,
      adjustedAmount: oddsOfNightSkillProc,
    },
  ];

  let currentHelps = 0;
  let remainingDecimal = 0;
  for (let i = 1; i <= nrOfFullSkillProcs; i++) {
    const avgHelpsPerSkillProc = nrOfHelpsBeforeSkillActivates;
    const avgHelpsWithStoredDecimal = avgHelpsPerSkillProc + remainingDecimal;

    const roundedHelps = Math.floor(avgHelpsWithStoredDecimal);
    const stored = avgHelpsWithStoredDecimal - roundedHelps;
    remainingDecimal = stored;
    currentHelps += roundedHelps;

    activationsWithAdjustedAmount.push({ adjustedAmount: 1, nrOfHelpsToActivate: currentHelps });
  }
  // final partial proc
  activationsWithAdjustedAmount.push({
    adjustedAmount: nrOfDaySkillProcs - nrOfFullSkillProcs,
    nrOfHelpsToActivate: Math.floor(nrOfDayHelps),
  });
  return activationsWithAdjustedAmount;
}

// TODO: since this takes level this could probably just calculate the whole helper boost amount from level + unique, instead of only unique, since we'll be adding this outside anyway
export function calculateHelperBoostHelpsFromUnique(unique: number, level: number) {
  if (unique < 1 || unique > 5 || level < 1 || level > 6) {
    throw new ProgrammingError('Invalid input: unique should be between 1 and 5, level should be between 1 and 6');
  }

  const rowIndex = unique - 1;
  const colIndex = level - 1;

  return mainskill.HELPER_BOOST_UNIQUE_BOOST_TABLE[rowIndex][colIndex];
}
