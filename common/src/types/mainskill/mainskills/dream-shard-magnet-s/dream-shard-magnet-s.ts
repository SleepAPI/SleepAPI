import type { ActivationsType, AmountParams } from '../../mainskill';
import { Mainskill } from '../../mainskill';

export const DreamShardMagnetS = new (class extends Mainskill {
  name = 'Dream Shard Magnet S';
  RP = [880, 1251, 1726, 2383, 3290, 4546, 5843, 7303];
  shardAmounts = [240, 340, 480, 670, 920, 1260, 1800, 2500];
  image = 'shards';

  description = (params: AmountParams) => `Obtain ${this.shardAmounts[params.skillLevel - 1]} Dream Shards.`;
  activations: ActivationsType = {
    dreamShards: {
      unit: 'dream shards',
      amount: this.leveledAmount(this.shardAmounts)
    }
  };
})();

export const DreamShardMagnetSRange = new (class extends Mainskill {
  name = 'Dream Shard Magnet S';
  frontendComponentName = 'Dream Shard Magnet S Range';
  RP = [880, 1251, 1726, 2383, 3290, 4546, 5843, 7303];
  shardAmountsLow = [120, 170, 240, 335, 460, 630, 900, 1150];
  shardAmountsHigh = [480, 680, 960, 1340, 1840, 2520, 3600, 4600];
  shardAmountsMean = this.shardAmountsLow.map((low, i) => (low + this.shardAmountsHigh[i]) / 2);
  image = 'shards';
  description = (params: AmountParams) =>
    `Obtain ${this.shardAmountsLow[params.skillLevel - 1]} to ${this.shardAmountsHigh[params.skillLevel - 1]} Dream Shards.`;
  activations: ActivationsType = {
    mean: {
      unit: 'dream shards',
      amount: this.leveledAmount(this.shardAmountsMean)
    },
    low: {
      unit: 'dream shards',
      amount: this.leveledAmount(this.shardAmountsLow)
    },
    high: {
      unit: 'dream shards',
      amount: this.leveledAmount(this.shardAmountsHigh)
    }
  };
})();
