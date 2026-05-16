import { Body, Controller, Get, Headers, Inject, Param, Patch } from '@nestjs/common'

import { readGuestUserId } from '../auth/guest-token.js'
import { ok } from '../common/api-response.js'
import { UpdateManorBuildingDto } from './dto/update-manor-building.dto.js'
import { ManorService } from './manor.service.js'

@Controller('manor')
export class ManorController {
  constructor(@Inject(ManorService) private readonly manorService: ManorService) {}

  @Get()
  async getManor(
    @Headers('authorization') authorization?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const userId = readGuestUserId(authorization, userIdHeader)
    const manor = await this.manorService.getManor(userId)
    return ok(manor)
  }

  @Patch('buildings/:id')
  async updateBuilding(
    @Param('id') buildingId: string,
    @Body() dto: UpdateManorBuildingDto,
    @Headers('authorization') authorization?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const userId = readGuestUserId(authorization, userIdHeader)
    const manor = await this.manorService.updateBuilding(userId, buildingId, dto)
    return ok(manor, 'manor_building_updated')
  }
}
