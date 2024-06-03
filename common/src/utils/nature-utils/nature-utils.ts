import { NATURES, Nature } from '../../domain/nature';

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
