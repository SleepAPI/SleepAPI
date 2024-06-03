import { SUBSKILLS } from '../../domain/subskill/subskill';

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
