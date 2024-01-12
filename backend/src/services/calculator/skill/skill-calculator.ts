import { Pokemon } from '../../../domain/pokemon/pokemon';
import { Nature } from '../../../domain/stat/nature';
import { SubSkill } from '../../../domain/stat/subskill';
import { extractTriggerSubskills } from '../stats/stats-calculator';

export function calculateSkillPercentage(pokemon: Pokemon, subskills: SubSkill[], nature: Nature) {
  const triggerSubskills = extractTriggerSubskills(subskills);
  return (pokemon.skillPercentage / 100) * triggerSubskills * nature.skill;
}

export function calculateSkillProcs(nrOfHelps: number, skillPercentage: number) {
  return nrOfHelps * skillPercentage;
}
