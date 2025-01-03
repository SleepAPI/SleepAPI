import { CookingTierlist } from '@src/services/tier-list/cooking-tier-list.js';
import type { TierlistSettings } from 'sleepapi-common';

class TierlistServiceImpl {
  public getCookingTierlist(request: TierlistSettings) {
    return CookingTierlist.get(request);
  }

  public async seed() {
    await CookingTierlist.seed({ camp: false, level: 30 });
    await CookingTierlist.seed({ camp: true, level: 30 });
    await CookingTierlist.seed({ camp: false, level: 60 });
    await CookingTierlist.seed({ camp: true, level: 60 });
  }
}

export const TierlistService = new TierlistServiceImpl();
