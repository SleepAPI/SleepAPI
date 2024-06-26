import { BerrySet, berry } from 'sleepapi-common';

export function emptyBerrySet(berry: berry.Berry): BerrySet {
  return {
    amount: 0,
    berry,
  };
}
