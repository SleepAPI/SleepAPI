import { Controller, Get, Queries, Route, Tags } from 'tsoa';
import { GetTierListQueryParams } from '../../routes/tierlist-router/tierlist-router';
import { TierlistService } from '../../services/api-service/tierlist/tierlist-service';

@Route('api/tierlist')
@Tags('tierlist')
export default class TierlistController extends Controller {
  @Get('cooking')
  public async getCookingTierlist(@Queries() getTierListQueries: GetTierListQueryParams) {
    return TierlistService.getTierlist(getTierListQueries);
  }
}
