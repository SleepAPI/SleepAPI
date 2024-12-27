import type { GetTierListQueryParams } from '@src/routes/tierlist-router/tierlist-router.js';
import { TierlistService } from '@src/services/api-service/tierlist/tierlist-service.js';
import * as tsoa from '@tsoa/runtime';
const { Controller, Route, Tags, Get, Queries } = tsoa;

@Route('api/tierlist')
@Tags('tierlist')
export default class TierlistController extends Controller {
  @Get('cooking')
  public async getCookingTierlist(@Queries() getTierListQueries: GetTierListQueryParams) {
    return TierlistService.getTierlist(getTierListQueries);
  }
}
