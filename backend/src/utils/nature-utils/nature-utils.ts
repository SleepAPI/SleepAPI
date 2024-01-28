import { NatureError } from '@src/domain/error/stat/stat-error';
import { nature } from 'sleepapi-common';

export function getNature(name: string) {
  const nat: nature.Nature | undefined = nature.NATURES.find(
    (nature) => nature.name.toUpperCase() === name.toUpperCase()
  );
  if (!nat) {
    throw new NatureError("Couldn't find nature with name: " + name.toUpperCase());
  }
  return nat;
}

export function getNatureNames() {
  return nature.NATURES.map((nature) => nature.name);
}
