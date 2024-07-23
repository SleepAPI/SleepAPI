import { Pokemon } from '../../domain/pokemon';

export function evolvesFrom(previousForm: Pokemon): Pokemon {
  return {
    ...previousForm,
    previousEvolutions: previousForm.previousEvolutions + 1,
    remainingEvolutions: previousForm.remainingEvolutions - 1,
  };
}

export function evolvesInto(nextForm: Pokemon): Pokemon {
  return {
    ...nextForm,
    previousEvolutions: nextForm.previousEvolutions - 1,
    remainingEvolutions: nextForm.remainingEvolutions + 1,
  };
}
