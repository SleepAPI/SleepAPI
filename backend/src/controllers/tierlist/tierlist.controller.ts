import { Body, Controller, Get, Hidden, Post, Queries, Route } from 'tsoa';
import { CreateTierListRequestBody, GetTierListQueryParams } from '../../routes/tierlist-router/tierlist-router';
import { CookingTierlistService } from '../../services/routing-service/tierlist/cooking-tierlist-service';

@Route('tierlist')
export default class TierlistController extends Controller {
  @Post('cooking')
  @Hidden()
  public createCookingTierlist(@Body() body: CreateTierListRequestBody) {
    return CookingTierlistService.create(body);
  }

  @Get('cooking')
  public async getCookingTierlist(@Queries() getTierListQueries: GetTierListQueryParams) {
    return CookingTierlistService.getTierlist(getTierListQueries);
  }
}
