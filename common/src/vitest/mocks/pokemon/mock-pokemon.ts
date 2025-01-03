import { createBaseSkill } from '../../../domain';
import { BELUE } from '../../../domain/berry/berries';
import { BALANCED_GENDER } from '../../../domain/gender/gender';
import { SLOWPOKE_TAIL } from '../../../domain/ingredient/ingredients';
import type { Pokemon } from '../../../domain/pokemon/pokemon';

export const mockMainskill = createBaseSkill({
  amount: [0],
  description: 'mock skill',
  maxLevel: 1,
  name: 'mock skill',
  RP: [0],
  unit: 'metronome'
});

export function mockPokemon(attrs?: Partial<Pokemon>): Pokemon {
  return {
    name: 'Mockemon',
    specialty: 'berry',
    frequency: 0,
    ingredientPercentage: 0,
    skillPercentage: 0,
    berry: BELUE,
    genders: BALANCED_GENDER,
    carrySize: 0,
    previousEvolutions: 0,
    remainingEvolutions: 0,
    ingredient0: { amount: 0, ingredient: SLOWPOKE_TAIL },
    ingredient30: [{ amount: 0, ingredient: SLOWPOKE_TAIL }],
    ingredient60: [{ amount: 0, ingredient: SLOWPOKE_TAIL }],
    skill: mockMainskill,
    ...attrs
  };
}
