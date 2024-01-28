import { nature, pokemon, subskill } from 'sleepapi-common';
import { extractTriggerSubskills } from '../stats/stats-calculator';

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
