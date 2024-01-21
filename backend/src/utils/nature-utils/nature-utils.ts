import { NatureError } from '../../domain/error/stat/stat-error';
import { Nature, NATURES } from '../../domain/stat/nature';

export function getNature(name: string) {
  const nature: Nature | undefined = NATURES.find((nature) => nature.name.toUpperCase() === name.toUpperCase());
  if (!nature) {
    throw new NatureError("Couldn't find nature with name: " + name.toUpperCase());
  }
  return nature;
}

export function getNatureNames() {
  return NATURES.map((nature) => nature.name);
}
