import type { ActivationsType, AmountParams } from '../../mainskill';
import { Mainskill } from '../../mainskill';

export const ChargeStrengthS = new (class extends Mainskill {
  name = 'Charge Strength S';
  RP = [400, 569, 785, 1083, 1496, 2066, 2842];
  strengthAmounts = [400, 569, 785, 1083, 1496, 2066, 3212];
  image = 'strength';
  description = (params: AmountParams) =>
    `Increases Snorlax's Strength by ${this.strengthAmounts[params.skillLevel - 1]}.`;

  activations: ActivationsType = {
    strength: {
      unit: 'strength',
      amount: this.leveledAmount(this.strengthAmounts)
    }
  };
})();

export const ChargeStrengthSRange = new (class extends Mainskill {
  name = 'Charge Strength S';
  frontendComponentName = 'Charge Strength S Range';
  RP = [400, 569, 785, 1083, 1496, 2066, 2842];
  strengthAmountsLow = [200, 285, 393, 542, 748, 1033, 1606];
  strengthAmountsHigh = [800, 1138, 1570, 2166, 2992, 4132, 6424];
  strengthAmountsMean = this.strengthAmountsLow.map((low, i) => (low + this.strengthAmountsHigh[i]) / 2);
  image = 'strength';
  description = (params: AmountParams) =>
    `Increases Snorlax's Strength on average by anywhere from ${this.strengthAmountsLow[params.skillLevel - 1]} to ${this.strengthAmountsHigh[params.skillLevel - 1]}.`;
  activations: ActivationsType = {
    mean: {
      unit: 'strength',
      amount: this.leveledAmount(this.strengthAmountsMean)
    },
    low: {
      unit: 'strength',
      amount: this.leveledAmount(this.strengthAmountsLow)
    },
    high: {
      unit: 'strength',
      amount: this.leveledAmount(this.strengthAmountsHigh)
    }
  };
})();
