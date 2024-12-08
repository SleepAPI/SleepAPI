import { SUBSKILLS } from '../../domain/subskill/subskills';

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

// TODO: test
export function limitSubSkillsToLevel(subskills: Set<string>, level: number): Set<string> {
  const numberOfElements = level < 10 ? 0 : Math.floor(level / 25) + 1;

  const result = new Set<string>();
  const iterator = subskills.values();

  for (let i = 0; i < numberOfElements; i++) {
    const next = iterator.next();
    if (next.done) break;
    result.add(next.value);
  }

  return result;
}
