import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { EnergyLevel, GoalHorizon, GoalStatus } from '@prisma/client'

import { PrismaService } from '../prisma/prisma.service.js'
import { CreateGoalDto } from './dto/create-goal.dto.js'
import { UpdateGoalDto } from './dto/update-goal.dto.js'

const areaKeywords: Array<{ area: string; words: string[] }> = [
  { area: '学习成长', words: ['学习', '考试', '论文', '课程', '复盘', '阅读', '英语', '编程'] },
  { area: '社会情感', words: ['沟通', '朋友', '同伴', '表达', '协作', '社交', '关系'] },
  { area: '实践体验', words: ['志愿', '活动', '实践', '比赛', '项目', '实习'] },
]

function todayDateOnly() {
  const now = new Date()
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
}

function inferArea(text: string) {
  return areaKeywords.find((item) => item.words.some((word) => text.includes(word)))?.area ?? '自我管理'
}

function shortGoalTitle(goalText: string) {
  const normalized = goalText.trim().replace(/[。！？!?,，]/g, '')
  return normalized.length > 18 ? `${normalized.slice(0, 18)}...` : normalized
}

function plannedTaskTitle(goalText: string, index: number) {
  const base = shortGoalTitle(goalText)
  const templates = [
    `写下“${base}”的成功标准`,
    `拆出“${base}”的第一个 20 分钟行动`,
    `为“${base}”设置一次复盘提醒`,
  ]

  return templates[index]
}

function mapHorizon(horizon?: 'week' | 'month' | 'semester') {
  const horizonMap = {
    week: GoalHorizon.WEEK,
    month: GoalHorizon.MONTH,
    semester: GoalHorizon.SEMESTER,
  } as const

  return horizon ? horizonMap[horizon] : GoalHorizon.MONTH
}

function mapGoalStatus(status?: 'active' | 'paused' | 'archived') {
  const statusMap = {
    active: GoalStatus.ACTIVE,
    paused: GoalStatus.PAUSED,
    archived: GoalStatus.ARCHIVED,
  } as const

  return status ? statusMap[status] : undefined
}

function toGoalDto(goal: {
  id: string
  title: string
  category: string | null
  reason: string | null
  horizon: GoalHorizon
  progress: number
  status: GoalStatus
  createdAt: Date
}) {
  const horizonMap: Record<GoalHorizon, '本周' | '本月' | '本学期'> = {
    [GoalHorizon.WEEK]: '本周',
    [GoalHorizon.MONTH]: '本月',
    [GoalHorizon.SEMESTER]: '本学期',
  }

  return {
    id: goal.id,
    title: goal.title,
    category: goal.category,
    horizon: horizonMap[goal.horizon],
    reason: goal.reason ?? '目标已记录，知行喵会帮你拆成可以开始的小行动。',
    progress: goal.progress,
    status: goal.status.toLowerCase(),
    createdAt: goal.createdAt.toISOString().slice(0, 10),
  }
}

function toTaskDto(task: {
  id: string
  title: string
  area: string
  energyLevel: EnergyLevel
  isCompleted: boolean
  dueLabel: string | null
}) {
  return {
    id: task.id,
    title: task.title,
    area: task.area,
    energyLevel: task.energyLevel.toLowerCase(),
    isCompleted: task.isCompleted,
    dueLabel: task.dueLabel,
  }
}

@Injectable()
export class GoalsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getGoals(userId: string) {
    const goals = await this.prisma.goal.findMany({
      where: { userId, status: { not: GoalStatus.ARCHIVED } },
      orderBy: { createdAt: 'desc' },
      take: 12,
    })

    return goals.map(toGoalDto)
  }

  async createGoal(userId: string, dto: CreateGoalDto) {
    const title = dto.title.trim()
    if (!title) {
      throw new NotFoundException('目标标题不能为空')
    }

    const area = dto.category?.trim() || inferArea(title)
    const scheduledDate = todayDateOnly()
    const lastTask = await this.prisma.dailyTask.findFirst({
      where: { userId, scheduledDate },
      orderBy: { sortOrder: 'desc' },
    })
    const startOrder = lastTask?.sortOrder ?? 0

    const result = await this.prisma.$transaction(async (tx) => {
      const goal = await tx.goal.create({
        data: {
          userId,
          title,
          category: area,
          horizon: mapHorizon(dto.horizon),
          reason: '知行喵已把目标拆成能开始、能检查、能复盘的三步。',
          smartContent: {
            source: 'rules-v1',
            steps: ['定义成功标准', '启动 20 分钟行动', '安排复盘提醒'],
          },
        },
      })

      const tasks = await Promise.all(
        [0, 1, 2].map((index) => tx.dailyTask.create({
          data: {
            userId,
            goalId: goal.id,
            title: plannedTaskTitle(title, index),
            area,
            energyLevel: index === 1 ? EnergyLevel.MEDIUM : EnergyLevel.LOW,
            dueLabel: index === 2 ? '本周' : '今天',
            scheduledDate,
            sortOrder: startOrder + index + 1,
          },
        })),
      )

      return { goal, tasks }
    })

    return {
      goal: toGoalDto(result.goal),
      tasks: result.tasks.map(toTaskDto),
      catEvent: {
        persona: 'zhixing',
        message: '目标已经拆成三步行动啦。先做第一个低能量任务，让启动成本小一点。',
      },
    }
  }

  async updateGoal(userId: string, goalId: string, dto: UpdateGoalDto) {
    const goal = await this.prisma.goal.findFirst({
      where: { id: goalId, userId },
    })

    if (!goal) {
      throw new NotFoundException('目标不存在')
    }

    const updatedGoal = await this.prisma.goal.update({
      where: { id: goal.id },
      data: {
        title: dto.title?.trim(),
        category: dto.category?.trim(),
        horizon: dto.horizon ? mapHorizon(dto.horizon) : undefined,
        progress: dto.progress,
        status: mapGoalStatus(dto.status),
      },
    })

    return {
      goal: toGoalDto(updatedGoal),
      catEvent: {
        persona: 'zhixing',
        message: '目标状态已更新，我们继续按真实节奏推进。',
      },
    }
  }
}
