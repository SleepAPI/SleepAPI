import { berry } from 'sleepapi-common';
import { emptyBerrySet } from './berry-calculator';

describe('emptyBerrySet', () => {
  it('shall give empty berries', () => {
    expect(emptyBerrySet(berry.BELUE)).toMatchInlineSnapshot(`
      {
        "amount": 0,
        "berry": {
          "name": "BELUE",
          "type": "steel",
          "value": 33,
        },
      }
    `);
  });
});
