import * as allSpecialists from './all-pokemon';
import * as berrySpecialists from './berry-pokemon';
import * as ingredientSpecialists from './ingredient-pokemon';
import type { Pokemon } from './pokemon';
import * as skillSpecialists from './skill-pokemon';

export type Pokedex = Pokemon[];

export const OPTIMAL_POKEDEX: Pokedex = [];
export const INFERIOR_POKEDEX: Pokedex = [];
export const COMPLETE_POKEDEX: Pokedex = [];

function addToPokedex(mon: Pokemon) {
  if (mon.remainingEvolutions === 0) {
    OPTIMAL_POKEDEX.push(mon);
  } else {
    INFERIOR_POKEDEX.push(mon);
  }
  COMPLETE_POKEDEX.push(mon);
}

let allMon: keyof typeof allSpecialists;
let berryMon: keyof typeof berrySpecialists;
let ingredientMon: keyof typeof ingredientSpecialists;
let skillMon: keyof typeof skillSpecialists;

for (allMon in allSpecialists) {
  addToPokedex(allSpecialists[allMon]);
}

for (berryMon in berrySpecialists) {
  addToPokedex(berrySpecialists[berryMon]);
}

for (ingredientMon in ingredientSpecialists) {
  addToPokedex(ingredientSpecialists[ingredientMon]);
}

for (skillMon in skillSpecialists) {
  addToPokedex(skillSpecialists[skillMon]);
}
