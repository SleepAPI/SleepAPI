import { PokemonProduce } from '@src/domain/combination/produce';
import { ProgrammingError } from '@src/domain/error/programming/programming-error';
import { SkillActivation, mainskill, pokemon } from 'sleepapi-common';
import { createSkillEvent } from './activation/skill-activation';

export function calculateSkillProcs(nrOfHelps: number, skillPercentage: number) {
  return nrOfHelps * skillPercentage;
}

export function calculateAverageNumberOfSkillProcsForHelps(params: {
  skillPercentage: number;
  helps: number;
  pokemonSpecialty: pokemon.PokemonSpecialty;
}): number {
  const { skillPercentage, helps, pokemonSpecialty } = params;

  // Calculate chance of zero procs
  const chanceOfZeroProcs = Math.pow(1 - skillPercentage, helps);

  // Skill specialists can bank 2 procs
  if (pokemonSpecialty !== 'skill') {
    return 1 - chanceOfZeroProcs;
  } else {
    const chanceOfOneProc = Math.pow(1 - skillPercentage, helps - 1) * skillPercentage * helps;
    const chanceOfTwoProcs = 1 - chanceOfZeroProcs - chanceOfOneProc;

    return 0 * chanceOfZeroProcs + 1 * chanceOfOneProc + 2 * chanceOfTwoProcs;
  }
}

export function scheduleSkillEvents(params: {
  skillLevel: number;
  pokemonWithAverageProduce: PokemonProduce;
  oddsOfNightSkillProc: number;
  nrOfDaySkillProcs: number;
  nrOfSkillCrits: number;
  nrOfDayHelps: number;
  uniqueHelperBoost: number;
}) {
  const {
    skillLevel,
    pokemonWithAverageProduce,
    oddsOfNightSkillProc: avgMorningSkillProcs,
    nrOfDaySkillProcs: avgDaytimeSkillProcs,
    nrOfSkillCrits: avgDailySkillCrits,
    nrOfDayHelps,
    uniqueHelperBoost,
  } = params;
  const skill = pokemonWithAverageProduce.pokemon.skill;

  const activationsWithAdjustedAmount = calculateHelpsToProcSchedule({
    oddsOfNightSkillProc: avgMorningSkillProcs,
    nrOfDaySkillProcs: avgDaytimeSkillProcs,
    nrOfDayHelps,
  });

  const avgDailySkillProcs = avgMorningSkillProcs + avgDaytimeSkillProcs;
  const avgCritChancePerProc = avgDailySkillCrits / avgDailySkillProcs;

  const skillActivations: SkillActivation[] = [];

  activationsWithAdjustedAmount.forEach(({ nrOfHelpsToActivate, adjustedAmount }) =>
    createSkillEvent({
      skill,
      skillLevel,
      nrOfHelpsToActivate,
      adjustedAmount,
      pokemonSet: pokemonWithAverageProduce,
      skillActivations,
      uniqueHelperBoost,
      avgCritChancePerProc,
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
