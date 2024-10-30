import { MAX_SKILL_LEVEL } from '../../constants';
import { MAINSKILLS, Mainskill, createBaseSkill } from '../mainskill';

export const ENERGY_FOR_EVERYONE: Mainskill = createBaseSkill({
  name: 'Energy For Everyone',
  amount: [5, 7, 9, 11, 15, 18],
  unit: 'energy',
  maxLevel: MAX_SKILL_LEVEL - 1,
  description: 'Restores ? Energy to each helper Pokémon on your team.',
  RP: [1120, 1593, 2197, 3033, 4187, 5785],
});

MAINSKILLS.push(ENERGY_FOR_EVERYONE);