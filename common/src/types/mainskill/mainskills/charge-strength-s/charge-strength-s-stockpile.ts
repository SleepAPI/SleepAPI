import type { ActivationsType, AmountParams } from '../../mainskill';
import { ModifiedMainskill } from '../../mainskill';
import { ChargeStrengthS } from './charge-strength-s';

export const ChargeStrengthSStockpile = new (class extends ModifiedMainskill {
  baseSkill = ChargeStrengthS;
  modifierName = 'Stockpile';
  RP = [600, 853, 1177, 1625, 2243, 3099, 3984];
  averageStrengthAmounts = [600, 853, 1177, 1625, 2243, 3099, 4497];
  critChance = 0.2674;
  image = 'stockpile_strength';
  readonly spitUpAmounts: Record<number, number[]> = {
    1: [600, 1020, 1500, 2040, 2640, 3300, 4020, 4920, 6480, 8880, 12120],
    2: [853, 1450, 2132, 2900, 3753, 4691, 5715, 6995, 9213, 12625, 17231],
    3: [1177, 2001, 2943, 4002, 5179, 6474, 7886, 9652, 12712, 17420, 23776],
    4: [1625, 2763, 4063, 5526, 7151, 8939, 10889, 13327, 17552, 24052, 32827],
    5: [2243, 3813, 5607, 7626, 9869, 12336, 15028, 18393, 24225, 33197, 45309],
    6: [3099, 5268, 7747, 10536, 13635, 17044, 20763, 25412, 33469, 45865, 62600],
    7: [4502, 7653, 11255, 15307, 19809, 24761, 30163, 36916, 48621, 66629, 90940]
  };

  description = (_params: AmountParams) =>
    `Stockpile or Spit Up is selected. When Spit Up triggers, Snorlax gains Strength from Stockpile's number.`;

  activations: ActivationsType = {
    strength: {
      unit: 'strength',
      amount: this.leveledAmount(this.averageStrengthAmounts)
      // TODO: I think we can remove this in sleepapi 2.0
      // Pi says: we use this in the frontend details component to show the per-proc amount, so maybe not yet
    }
  };

  getSpitUpStrength(skillLevel: number): number[] {
    return this.spitUpAmounts[skillLevel];
  }
})();
