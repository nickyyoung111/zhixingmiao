import { Controller, Get, Headers, Inject, Param, Post } from '@nestjs/common'

import { readGuestUserId } from '../auth/guest-token.js'
import { ok } from '../common/api-response.js'
import { RewardsService } from './rewards.service.js'

@Controller()
export class RewardsController {
  constructor(@Inject(RewardsService) private readonly rewardsService: RewardsService) {}

  @Get('shop/items')
  async items() {
    const result = await this.rewardsService.getShopItems()
    return ok(result, 'shop_items_loaded')
  }

  @Get('shop/purchases')
  async purchases(
    @Headers('authorization') authorization?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const userId = readGuestUserId(authorization, userIdHeader)
    const result = await this.rewardsService.getPurchasedItemIds(userId)
    return ok(result, 'shop_purchases_loaded')
  }

  @Post('shop/items/:id/purchase')
  async purchase(
    @Param('id') itemId: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const userId = readGuestUserId(authorization, userIdHeader)
    const result = await this.rewardsService.purchaseItem(userId, itemId)
    return ok(result, 'shop_item_purchased')
  }
}
