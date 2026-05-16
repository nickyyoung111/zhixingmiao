import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { AiController } from './ai/ai.controller.js'
import { AiQuotaService } from './ai/ai-quota.service.js'
import { AiService } from './ai/ai.service.js'
import { AuthController } from './auth/auth.controller.js'
import { AuthService } from './auth/auth.service.js'
import { EvidenceController } from './evidence/evidence.controller.js'
import { EvidenceService } from './evidence/evidence.service.js'
import { GoalsController } from './goals/goals.controller.js'
import { GoalsService } from './goals/goals.service.js'
import { HabitsController } from './habits/habits.controller.js'
import { HabitsService } from './habits/habits.service.js'
import { HealthController } from './health.controller.js'
import { ManorController } from './manor/manor.controller.js'
import { ManorService } from './manor/manor.service.js'
import { MeController } from './users/me.controller.js'
import { MoodsController } from './moods/moods.controller.js'
import { MoodsService } from './moods/moods.service.js'
import { PrismaService } from './prisma/prisma.service.js'
import { RewardsController } from './rewards/rewards.controller.js'
import { RewardsService } from './rewards/rewards.service.js'
import { TasksController } from './tasks/tasks.controller.js'
import { TasksService } from './tasks/tasks.service.js'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [resolve(projectRoot, '.env'), '.env', 'zhixing-miao-web/.env'],
    }),
  ],
  controllers: [AiController, AuthController, EvidenceController, GoalsController, HabitsController, HealthController, ManorController, MeController, MoodsController, RewardsController, TasksController],
  providers: [AiQuotaService, AiService, AuthService, EvidenceService, GoalsService, HabitsService, ManorService, MoodsService, PrismaService, RewardsService, TasksService],
})
export class AppModule {}