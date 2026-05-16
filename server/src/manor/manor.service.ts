import { Inject, Injectable, NotFoundException } from '@nestjs/common'

import { PrismaService } from '../prisma/prisma.service.js'

const coreBuildings = [
  { buildingType: 'study-tower', label: '学习塔', positionX: 20, positionY: 52 },
  { buildingType: 'mood-pond', label: '情绪池塘', positionX: 72, positionY: 66 },
  { buildingType: 'knowledge-garden', label: '知识菜园', positionX: 45, positionY: 70 },
] as const

const decorationPlacements: Record<string, { label: string; positionX: number; positionY: number }> = {
  sunflower: { label: '向阳花圃', positionX: 14, positionY: 82 },
  'cozy-lamp': { label: '暖光小灯', positionX: 84, positionY: 42 },
  'calm-stone': { label: '平静石径', positionX: 52, positionY: 86 },
  'study-banner': { label: '学习旗帜', positionX: 20, positionY: 24 },
}

type ManorBuildingRecord = {
  id: string
  buildingType: string
  level: number
  positionX: number
  positionY: number
  unlockedAt: Date
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function moodToTheme(moodType: string | undefined, vitality: number) {
  if (vitality >= 70 && moodType === '开心') return 'bright'
  if (moodType === '焦虑') return 'calm'
  if (moodType === '难过' || moodType === '沮丧但想继续') return 'comfort'
  if (moodType === '生气') return 'focus'
  if (moodType === '开心') return 'bright'
  return 'warm'
}

function toBuildingDto(building: ManorBuildingRecord) {
  const itemId = building.buildingType.startsWith('decor:')
    ? building.buildingType.slice('decor:'.length)
    : undefined
  const core = coreBuildings.find((item) => item.buildingType === building.buildingType)
  const decoration = itemId ? decorationPlacements[itemId] : undefined

  return {
    id: building.id,
    type: building.buildingType,
    itemId,
    label: core?.label ?? decoration?.label ?? '庄园装饰',
    variant: itemId ? 'decoration' : 'core',
    level: building.level,
    positionX: building.positionX,
    positionY: building.positionY,
    unlockedAt: building.unlockedAt.toISOString(),
  }
}

@Injectable()
export class ManorService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private async ensureCoreBuildings(userId: string) {
    const existing = await this.prisma.manorBuilding.findMany({
      where: {
        userId,
        buildingType: { in: coreBuildings.map((building) => building.buildingType) },
      },
      select: { buildingType: true },
    })
    const existingTypes = new Set(existing.map((building) => building.buildingType))
    const missing = coreBuildings.filter((building) => !existingTypes.has(building.buildingType))

    if (missing.length > 0) {
      await this.prisma.manorBuilding.createMany({
        data: missing.map((building) => ({
          userId,
          buildingType: building.buildingType,
          positionX: building.positionX,
          positionY: building.positionY,
        })),
      })
    }
  }

  private async ensurePurchasedDecorations(userId: string) {
    const purchases = await this.prisma.userShopItem.findMany({
      where: { userId },
      select: { shopItemId: true },
    })
    const decorationTypes = purchases
      .filter((purchase) => decorationPlacements[purchase.shopItemId])
      .map((purchase) => `decor:${purchase.shopItemId}`)

    if (decorationTypes.length === 0) return

    const existing = await this.prisma.manorBuilding.findMany({
      where: { userId, buildingType: { in: decorationTypes } },
      select: { buildingType: true },
    })
    const existingTypes = new Set(existing.map((building) => building.buildingType))
    const missing = decorationTypes.filter((buildingType) => !existingTypes.has(buildingType))

    if (missing.length > 0) {
      await this.prisma.manorBuilding.createMany({
        data: missing.map((buildingType) => {
          const itemId = buildingType.slice('decor:'.length)
          const placement = decorationPlacements[itemId]

          return {
            userId,
            buildingType,
            positionX: placement.positionX,
            positionY: placement.positionY,
          }
        }),
      })
    }
  }

  private async ensureManor(userId: string) {
    await this.ensureCoreBuildings(userId)
    await this.ensurePurchasedDecorations(userId)
  }

  async getManor(userId: string) {
    await this.ensureManor(userId)

    const [user, buildings, latestMood, totalTasks, completedTasks] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({ where: { id: userId } }),
      this.prisma.manorBuilding.findMany({
        where: { userId },
        orderBy: [{ buildingType: 'asc' }, { unlockedAt: 'asc' }],
      }),
      this.prisma.moodCheckin.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dailyTask.count({ where: { userId } }),
      this.prisma.dailyTask.count({ where: { userId, isCompleted: true } }),
    ])
    const completionBonus = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 45)
    const vitality = clamp(30 + user.level * 5 + user.streakDays * 2 + completionBonus, 0, 100)

    return {
      buildings: buildings.map(toBuildingDto),
      vitality,
      moodTone: latestMood?.moodType ?? '平静',
      theme: moodToTheme(latestMood?.moodType, vitality),
      updatedAt: new Date().toISOString(),
    }
  }

  async updateBuilding(userId: string, buildingId: string, dto: { positionX?: number; positionY?: number; level?: number }) {
    const building = await this.prisma.manorBuilding.findFirst({
      where: { id: buildingId, userId },
    })

    if (!building) {
      throw new NotFoundException('庄园对象不存在')
    }

    await this.prisma.manorBuilding.update({
      where: { id: building.id },
      data: {
        positionX: dto.positionX === undefined ? undefined : clamp(dto.positionX, 4, 96),
        positionY: dto.positionY === undefined ? undefined : clamp(dto.positionY, 6, 94),
        level: dto.level === undefined ? undefined : clamp(dto.level, 1, 9),
      },
    })

    return this.getManor(userId)
  }
}
