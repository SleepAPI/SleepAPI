import { MainskillError } from '@src/domain/error/stat/stat-error';
import { mainskill } from 'sleepapi-common';

export function getMainskillNames() {
  return mainskill.MAINSKILLS.map((ms) => ms.name);
}

export function getMainskill(name: string) {
  const found = mainskill.MAINSKILLS.find((ms) => ms.name.toLowerCase() === name.toLowerCase());
  if (!found) {
    throw new MainskillError(`Can't find Main skill with name ${name}`);
  }
  return found;
}
