import { PokemonProduce } from '@src/domain/combination/produce';
import { SkillActivation } from '@src/domain/event/events/skill-event/skill-event';
import { nature, pokemon, subskill } from 'sleepapi-common';
import { extractTriggerSubskills } from '../stats/stats-calculator';
import { createSkillEvent } from './activation/skill-activation';

export function calculateSkillPercentage(
  pokemon: pokemon.Pokemon,
  subskills: subskill.SubSkill[],
  nature: nature.Nature
) {
  const triggerSubskills = extractTriggerSubskills(subskills);
  return (pokemon.skillPercentage / 100) * triggerSubskills * nature.skill;
}

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
