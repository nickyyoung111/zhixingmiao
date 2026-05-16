import { Body, Controller, Get, Headers, Inject, Param, Patch, Post } from '@nestjs/common'

import { readGuestUserId } from '../auth/guest-token.js'
import { ok } from '../common/api-response.js'
import { CreateGoalDto } from './dto/create-goal.dto.js'
import { UpdateGoalDto } from './dto/update-goal.dto.js'
import { GoalsService } from './goals.service.js'

@Controller('goals')
export class GoalsController {
  constructor(@Inject(GoalsService) private readonly goalsService: GoalsService) {}

  @Get()
  async list(
    @Headers('authorization') authorization?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const userId = readGuestUserId(authorization, userIdHeader)
    const result = await this.goalsService.getGoals(userId)
    return ok(result, 'goals_loaded')
  }

  @Post()
  async create(
    @Body() dto: CreateGoalDto,
    @Headers('authorization') authorization?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const userId = readGuestUserId(authorization, userIdHeader)
    const result = await this.goalsService.createGoal(userId, dto)
    return ok(result, 'goal_created')
  }

  @Patch(':id')
  async update(
    @Param('id') goalId: string,
    @Body() dto: UpdateGoalDto,
    @Headers('authorization') authorization?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const userId = readGuestUserId(authorization, userIdHeader)
    const result = await this.goalsService.updateGoal(userId, goalId, dto)
    return ok(result, 'goal_updated')
  }
}
