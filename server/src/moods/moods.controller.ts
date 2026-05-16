import { Body, Controller, Get, Headers, Inject, Param, Post } from '@nestjs/common'

import { readGuestUserId } from '../auth/guest-token.js'
import { ok } from '../common/api-response.js'
import { MoodsService } from './moods.service.js'

@Controller('moods')
export class MoodsController {
  constructor(@Inject(MoodsService) private readonly moodsService: MoodsService) {}

  @Get('recent')
  async recent(
    @Headers('authorization') authorization?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const userId = readGuestUserId(authorization, userIdHeader)
    const result = await this.moodsService.getRecentMoods(userId)
    return ok(result, 'moods_loaded')
  }

  @Post('checkins')
  async checkin(
    @Body() dto: { mood?: string },
    @Headers('authorization') authorization?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const userId = readGuestUserId(authorization, userIdHeader)
    const result = await this.moodsService.recordMood(userId, dto.mood ?? '')
    return ok(result, 'mood_recorded')
  }

  @Post('support-actions/:id')
  async supportAction(
    @Param('id') actionId: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const userId = readGuestUserId(authorization, userIdHeader)
    const result = await this.moodsService.completeSupportAction(userId, actionId)
    return ok(result, 'mood_support_completed')
  }
}
