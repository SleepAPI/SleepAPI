import { MainskillError } from '@src/domain/error/stat/stat-error.js';
import { MAINSKILLS } from 'sleepapi-common';

export function getMainskillNames() {
  return MAINSKILLS.map((ms) => ms.name);
}

export function getMainskill(name: string) {
  const found = MAINSKILLS.find((ms) => ms.name.toLowerCase() === name.toLowerCase());
  if (!found) {
    throw new MainskillError(`Can't find Main skill with name ${name}`);
  }
  return found;
}
