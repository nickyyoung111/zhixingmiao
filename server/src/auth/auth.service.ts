import { Inject, Injectable } from '@nestjs/common'

import { PrismaService } from '../prisma/prisma.service.js'
import { TasksService } from '../tasks/tasks.service.js'
import { GuestSessionDto } from './dto/guest-session.dto.js'

@Injectable()
export class AuthService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
    @Inject(TasksService)
    private readonly tasksService: TasksService,
  ) {}

  async createOrRestoreGuestSession(dto: GuestSessionDto) {
    const existingUser = dto.userId
      ? await this.prisma.user.findUnique({ where: { id: dto.userId }, include: { preferences: true } })
      : null

    const user = existingUser
      ? existingUser
      : await this.prisma.user.create({
          data: {
            nickname: dto.nickname?.trim() || '体验用户',
            preferences: {
              create: {},
            },
          },
          include: { preferences: true },
        })

    await this.tasksService.ensureTodayTasks(user.id)

    return {
      tokenType: 'guest',
      accessToken: `guest:${user.id}`,
      user,
    }
  }
}