import { TierlistService } from '@src/services/tier-list/tierlist-service.js';
import type { TierlistSettings } from 'sleepapi-common';

export default class TierlistController {
  public async getCookingTierlist(request: TierlistSettings) {
    return TierlistService.getCookingTierlist(request);
  }
}
