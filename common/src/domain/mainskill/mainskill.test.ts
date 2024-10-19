import { STOCKPILE_STOCKS } from 'src/domain/mainskill';
import { describe, expect, it } from 'vitest';

describe('Stockpile (Charge Strength S)', () => {
  it('shall match match RP and strength', () => {
    const spitPercent = 0.3;
    const stockPercent = 1 - spitPercent;

    for (let level = 1; level <= 7; ++level) {
      const stackStrength = STOCKPILE_STOCKS[level];

      const netChance: number[] = [];
      for (let i = 0; i < 10; ++i) {
        netChance.push(spitPercent * Math.pow(stockPercent, i));
      }
      netChance.push(Math.pow(stockPercent, 10));
      // netChance.forEach((x) => console.log(x));
      // console.log();

      const expectedTriggerCounts: number[] = [];
      for (let i = 0; i <= 10; ++i) {
        expectedTriggerCounts.push(netChance[i] * (i + 1));
      }
      // expectedTriggerCounts.forEach((x) => console.log(x));
      // console.log();

      const expectedTriggerSum = expectedTriggerCounts.reduce((acc, val) => acc + val, 0);

      const normalizedTriggerCounts: number[] = [];
      for (let i = 0; i <= 10; ++i) {
        normalizedTriggerCounts.push(expectedTriggerCounts[i] / expectedTriggerSum);
      }
      // normalizedTriggerCounts.forEach((x) => console.log(x));
      // console.log();

      const weightedValues: number[] = [];
      for (let i = 0; i <= 10; ++i) {
        weightedValues.push((stackStrength[i] / (i + 1)) * normalizedTriggerCounts[i]);
      }
      // weightedValues.forEach((x) => console.log(x));
      // console.log();

      const sum = weightedValues.reduce((acc, val) => acc + val, 0);
      // console.log(sum);
      const difference = sum - stackStrength[0];
      // console.log(difference);
      const percentage = (difference / stackStrength[0]) * 100;
      console.log(percentage);

      expect(percentage).toBeLessThan(0.2);
    }
  });
});
