import * as tsoa from '@tsoa/runtime';
import type { GetTierListQueryParams } from '../../routes/tierlist-router/tierlist-router';
import { TierlistService } from '../../services/api-service/tierlist/tierlist-service';
const { Controller, Route, Tags, Get, Queries } = tsoa;

@Route('api/tierlist')
@Tags('tierlist')
export default class TierlistController extends Controller {
  @Get('cooking')
  public async getCookingTierlist(@Queries() getTierListQueries: GetTierListQueryParams) {
    return TierlistService.getTierlist(getTierListQueries);
  }
}
