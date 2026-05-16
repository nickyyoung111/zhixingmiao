import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { EnergyLevel } from '@prisma/client'

import { PrismaService } from '../prisma/prisma.service.js'
import { CreateHabitDto } from './dto/create-habit.dto.js'

const habitTemplates = [
  {
    id: 'study-review',
    title: '学习复盘 10 分钟',
    area: '学习成长',
    cue: '晚饭后打开笔记',
    tinyAction: '写下今天学到的 3 个关键词',
    reward: '给自己记 1 条成长证据',
    energy: EnergyLevel.LOW,
  },
  {
    id: 'body-wakeup',
    title: '身体唤醒 5 分钟',
    area: '自我管理',
    cue: '起床后喝水前',
    tinyAction: '做 3 组伸展或原地走动',
    reward: '点亮庄园里的晨光',
    energy: EnergyLevel.LOW,
  },
  {
    id: 'kind-message',
    title: '给同伴一句鼓励',
    area: '社会情感',
    cue: '午休前看一眼联系人',
    tinyAction: '发出一句真诚感谢或鼓励',
    reward: '获得 1 枚友善小鱼干',
    energy: EnergyLevel.LOW,
  },
  {
    id: 'practice-log',
    title: '实践记录快照',
    area: '实践体验',
    cue: '活动结束当天',
    tinyAction: '记录时间、地点、收获各一句',
    reward: '生成一条成长档案素材',
    energy: EnergyLevel.MEDIUM,
  },
] as const

function todayDateOnly() {
  const now = new Date()
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
}

function toTemplateDto(template: {
  id: string
  title: string
  area: string
  cue: string
  tinyAction: string
  reward: string
  energy: EnergyLevel
}) {
  return {
    id: template.id,
    title: template.title,
    area: template.area,
    cue: template.cue,
    tinyAction: template.tinyAction,
    reward: template.reward,
    energy: template.energy.toLowerCase(),
  }
}

function toHabitDto(habit: {
  id: string
  templateId: string | null
  name: string
  currentStreak: number
  createdAt: Date
}) {
  return {
    id: habit.id,
    templateId: habit.templateId ?? '',
    title: habit.name,
    streak: habit.currentStreak,
    createdAt: habit.createdAt.toISOString().slice(0, 10),
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
export class HabitsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async ensureTemplates() {
    await Promise.all(
      habitTemplates.map((template) => this.prisma.habitTemplate.upsert({
        where: { id: template.id },
        update: {
          title: template.title,
          area: template.area,
          cue: template.cue,
          tinyAction: template.tinyAction,
          reward: template.reward,
          energy: template.energy,
          isActive: true,
        },
        create: {
          id: template.id,
          title: template.title,
          area: template.area,
          cue: template.cue,
          tinyAction: template.tinyAction,
          reward: template.reward,
          energy: template.energy,
        },
      })),
    )
  }

  async getTemplates() {
    await this.ensureTemplates()
    const templates = await this.prisma.habitTemplate.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
    })

    return templates.map(toTemplateDto)
  }

  async getUserHabits(userId: string) {
    const habits = await this.prisma.habit.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 12,
    })

    return habits.map(toHabitDto)
  }

  async activateHabit(userId: string, dto: CreateHabitDto) {
    await this.ensureTemplates()
    const template = await this.prisma.habitTemplate.findUnique({
      where: { id: dto.templateId },
    })

    if (!template || !template.isActive) {
      throw new NotFoundException('习惯模板不存在')
    }

    const scheduledDate = todayDateOnly()
    const lastTask = await this.prisma.dailyTask.findFirst({
      where: { userId, scheduledDate },
      orderBy: { sortOrder: 'desc' },
    })
    const startOrder = lastTask?.sortOrder ?? 0

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.habit.deleteMany({
        where: { userId, templateId: template.id },
      })

      const habit = await tx.habit.create({
        data: {
          userId,
          templateId: template.id,
          name: template.title,
          category: template.area,
          targetDays: 21,
        },
      })

      const taskPlans = [
        {
          title: `第 1 天：${template.tinyAction}`,
          dueLabel: '今天',
        },
        {
          title: `第 2 天：重复「${template.title}」并记录感受`,
          dueLabel: '明天',
        },
        {
          title: `第 3 天：完成后领取「${template.reward}」`,
          dueLabel: '本周',
        },
      ]

      const tasks = await Promise.all(
        taskPlans.map((plan, index) => tx.dailyTask.create({
          data: {
            userId,
            title: plan.title,
            area: template.area,
            energyLevel: template.energy,
            dueLabel: plan.dueLabel,
            scheduledDate,
            sortOrder: startOrder + index + 1,
          },
        })),
      )

      return { habit, tasks }
    })

    return {
      habit: toHabitDto(result.habit),
      tasks: result.tasks.map(toTaskDto),
      catEvent: {
        persona: 'encourage',
        message: `习惯「${template.title}」已经开启，我先帮你排好 3 天连续行动。`,
      },
    }
  }
}
