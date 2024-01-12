import { Pokemon } from '../../../domain/pokemon/pokemon';
import { BERRY_FINDING_S, SubSkill } from '../../../domain/stat/subskill';

export function calculateNrOfBerriesPerDrop(pokemon: Pokemon, subskills: SubSkill[]) {
  let base = 1;
  if (pokemon.specialty === 'berry') {
    base += 1;
  }
  if (subskills.includes(BERRY_FINDING_S)) {
    base += 1;
  }
  return base;
}
