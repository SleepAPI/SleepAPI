import type { PokemonInstance, Subskill } from '../../types';
import { SUBSKILLS } from '../../types/subskill/subskills';

export function getSubskillNames() {
  return SUBSKILLS.map((subskill) => subskill.name);
}

export function getSubskill(name: string) {
  const found = SUBSKILLS.find((s) => s.name.toLowerCase() === name.toLowerCase());
  if (!found) {
    throw new Error(`Can't find Subskill with name ${name}`);
  }
  return found;
}

export function limitSubSkillsToLevel(subskills: Set<string>, level: number): Set<string> {
  const numberOfElements = level < 10 ? 0 : level < 25 ? 1 : level < 50 ? 2 : level < 70 ? 3 : level < 80 ? 4 : 5;

  const result = new Set<string>();
  const iterator = subskills.values();

  for (let i = 0; i < numberOfElements; i++) {
    const next = iterator.next();
    if (next.done) break;
    result.add(next.value);
  }

  return result;
}

export function filterMembersWithSubskill(members: PokemonInstance[], subskill: Subskill) {
  return members.filter((member) =>
    member.subskills.some((s) => s.subskill.name === subskill.name && s.level <= member.level)
  );
}
