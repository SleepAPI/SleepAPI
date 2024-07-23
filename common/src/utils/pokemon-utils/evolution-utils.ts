import { Pokemon } from '../../domain/pokemon';

export function evolvesFrom(previousForm: Pokemon): Pokemon {
  return {
    ...previousForm,
    remainingEvolutions: previousForm.remainingEvolutions - 1,
  };
}

export function evolvesInto(nextForm: Pokemon): Pokemon {
  return {
    ...nextForm,
    remainingEvolutions: nextForm.remainingEvolutions + 1,
  };
}
