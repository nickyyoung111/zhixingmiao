import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { CatPersona, EvidenceCategory } from '@prisma/client'

import { PrismaService } from '../prisma/prisma.service.js'

type MoodProfile = {
  intensity: number
  persona: CatPersona
  message: string
  recommendedEnergy: '低能量' | '中能量' | '高能量'
  manorTheme: 'warm' | 'calm' | 'bright' | 'comfort' | 'focus'
  manorHint: string
  supportActionIds: Array<'breathe' | 'tiny-step' | 'self-kindness'>
}

const moodProfiles: Record<string, MoodProfile> = {
  开心: {
    intensity: 7,
    persona: CatPersona.ENCOURAGE,
    message: '这份开心很珍贵，我们把它变成一个轻快的小行动。',
    recommendedEnergy: '中能量',
    manorTheme: 'bright',
    manorHint: '阳光会更亮一点，适合让学习塔和花园一起发光。',
    supportActionIds: ['tiny-step', 'self-kindness'],
  },
  平静: {
    intensity: 4,
    persona: CatPersona.ZHIXING,
    message: '平静很适合稳稳推进，先做一个低压力的小任务。',
    recommendedEnergy: '低能量',
    manorTheme: 'warm',
    manorHint: '情绪池塘保持清澈，庄园适合慢慢推进。',
    supportActionIds: ['tiny-step', 'breathe'],
  },
  焦虑: {
    intensity: 6,
    persona: CatPersona.COMFORT,
    message: '我看见你的焦虑了，先把事情拆小，不急着一次解决全部。',
    recommendedEnergy: '低能量',
    manorTheme: 'calm',
    manorHint: '池塘会放慢流动，先给焦虑留一段缓冲。',
    supportActionIds: ['breathe', 'tiny-step'],
  },
  难过: {
    intensity: 6,
    persona: CatPersona.COMFORT,
    message: '难过的时候先照顾自己，今天的任务可以降到很小很小。',
    recommendedEnergy: '低能量',
    manorTheme: 'comfort',
    manorHint: '庄园会收起强光，暖光小灯会更适合陪你待一会儿。',
    supportActionIds: ['self-kindness', 'breathe'],
  },
  生气: {
    intensity: 7,
    persona: CatPersona.COMFORT,
    message: '生气说明你在意边界，我们先缓一口气，再决定下一步。',
    recommendedEnergy: '低能量',
    manorTheme: 'focus',
    manorHint: '庄园会把注意力收束到边界和呼吸上。',
    supportActionIds: ['breathe', 'self-kindness'],
  },
  沮丧但想继续: {
    intensity: 6,
    persona: CatPersona.ENCOURAGE,
    message: '还能说出想继续，就已经很不容易。我们从一个 5 分钟小台阶开始。',
    recommendedEnergy: '低能量',
    manorTheme: 'comfort',
    manorHint: '暖光会贴近路边，提醒你继续一点点就够。',
    supportActionIds: ['tiny-step', 'self-kindness'],
  },
}

function fallbackMoodProfile(mood: string): MoodProfile {
  return {
    intensity: 5,
    persona: CatPersona.ZHIXING,
    message: '状态已记录，我们按现在真实的节奏来。',
    recommendedEnergy: '低能量',
    manorTheme: 'warm',
    manorHint: `${mood || '现在'}已经被记录，庄园会按你的节奏回应。`,
    supportActionIds: ['breathe', 'tiny-step'],
  }
}

function toMoodResponse(mood: string, profile: MoodProfile) {
  return {
    mood,
    persona: profile.persona.toLowerCase(),
    companionLine: profile.message,
    recommendedEnergy: profile.recommendedEnergy,
    manorTheme: profile.manorTheme,
    manorHint: profile.manorHint,
    supportActionIds: profile.supportActionIds,
  }
}

const supportActions: Record<string, { title: string; persona: CatPersona; rewardFish: number; message: string }> = {
  breathe: {
    title: '一分钟呼吸',
    persona: CatPersona.COMFORT,
    rewardFish: 1,
    message: '我们先一起慢慢呼吸一分钟，任务可以等你稳一点再开始。',
  },
  'tiny-step': {
    title: '找一个小台阶',
    persona: CatPersona.ZHIXING,
    rewardFish: 1,
    message: '很好，先找一个 5 分钟的小台阶。完成它，就是今天重新启动的证据。',
  },
  'self-kindness': {
    title: '给自己一句好话',
    persona: CatPersona.COMFORT,
    rewardFish: 1,
    message: '你已经在努力照顾自己了。先把这句话收下：我可以慢一点，但我没有停下。',
  },
}

function toMoodDto(mood: {
  id: string
  moodType: string
  intensity: number
  note: string | null
  aiAdvice: string | null
  createdAt: Date
}) {
  return {
    id: mood.id,
    label: mood.moodType,
    intensity: mood.intensity,
    note: mood.note ?? mood.aiAdvice ?? '情绪已记录。',
    createdAt: mood.createdAt.toISOString(),
  }
}

@Injectable()
export class MoodsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getRecentMoods(userId: string) {
    const moods = await this.prisma.moodCheckin.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    return moods.map(toMoodDto)
  }

  async recordMood(userId: string, mood: string) {
    const moodType = mood.trim()
    if (!moodType) {
      throw new NotFoundException('情绪不能为空')
    }

    const profile = moodProfiles[moodType] ?? fallbackMoodProfile(moodType)

    const checkin = await this.prisma.moodCheckin.create({
      data: {
        userId,
        moodType,
        intensity: profile.intensity,
        note: profile.message,
        aiAdvice: profile.message,
      },
    })
    const moods = await this.getRecentMoods(userId)

    return {
      mood: toMoodDto(checkin),
      moods,
      catEvent: {
        persona: profile.persona.toLowerCase(),
        message: profile.message,
      },
      moodResponse: toMoodResponse(moodType, profile),
    }
  }

  async completeSupportAction(userId: string, actionId: string) {
    const action = supportActions[actionId]
    if (!action) {
      throw new NotFoundException('情绪支持动作不存在')
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const supportLog = await tx.moodSupportLog.create({
        data: {
          userId,
          actionId,
          title: action.title,
          persona: action.persona,
          rewardFish: action.rewardFish,
        },
      })

      const user = await tx.user.update({
        where: { id: userId },
        data: {
          fishCoin: { increment: action.rewardFish },
          intimacy: { increment: 1 },
        },
      })

      const evidenceRecord = await tx.evidenceRecord.create({
        data: {
          userId,
          title: `完成情绪照顾：${action.title}`,
          category: EvidenceCategory.MOOD_SUPPORT,
          note: action.message,
          sourceType: 'mood_support',
          sourceId: supportLog.id,
          fishEarned: action.rewardFish,
        },
      })

      return { user, evidenceRecord }
    })

    return {
      user: result.user,
      evidenceRecord: result.evidenceRecord,
      catEvent: {
        persona: action.persona.toLowerCase(),
        message: action.message,
      },
    }
  }
}
