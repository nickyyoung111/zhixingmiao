import { Body, Controller, Get, Headers, Inject, Post } from '@nestjs/common'

import { readGuestUserId } from '../auth/guest-token.js'
import { ok } from '../common/api-response.js'
import { CreateHabitDto } from './dto/create-habit.dto.js'
import { HabitsService } from './habits.service.js'

@Controller()
export class HabitsController {
  constructor(@Inject(HabitsService) private readonly habitsService: HabitsService) {}

  @Get('habit-templates')
  async templates() {
    const result = await this.habitsService.getTemplates()
    return ok(result, 'habit_templates_loaded')
  }

  @Get('habits')
  async list(
    @Headers('authorization') authorization?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const userId = readGuestUserId(authorization, userIdHeader)
    const result = await this.habitsService.getUserHabits(userId)
    return ok(result, 'habits_loaded')
  }

  @Post('habits')
  async create(
    @Body() dto: CreateHabitDto,
    @Headers('authorization') authorization?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const userId = readGuestUserId(authorization, userIdHeader)
    const result = await this.habitsService.activateHabit(userId, dto)
    return ok(result, 'habit_activated')
  }
}
