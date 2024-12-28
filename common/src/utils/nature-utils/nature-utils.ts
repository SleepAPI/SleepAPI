import type { Nature } from '../../domain/nature';
import { NATURES } from '../../domain/nature';

export function getNature(name: string) {
  const nat: Nature | undefined = NATURES.find((nature) => nature.name.toUpperCase() === name.toUpperCase());
  if (!nat) {
    throw new Error("Couldn't find nature with name: " + name.toUpperCase());
  }
  return nat;
}

export function getNatureNames() {
  return NATURES.map((nature) => nature.name);
}

export function invertNatureFrequency(nature: Nature) {
  let result = 1;
  if (nature.frequency === 0.9) {
    result = 1.1;
  } else if (nature.frequency === 1.1) {
    result = 0.9;
  }
  return result;
}
