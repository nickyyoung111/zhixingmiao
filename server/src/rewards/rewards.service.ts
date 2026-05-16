import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { EvidenceCategory, ShopCategory, Tone } from '@prisma/client'

import { PrismaService } from '../prisma/prisma.service.js'

const shopItems = [
  {
    id: 'sunflower',
    title: '向阳花圃',
    description: '把今日完成感种进庄园角落。',
    cost: 12,
    category: ShopCategory.MANOR_DECORATION,
    effect: '庄园出现一片向阳花圃',
    tone: Tone.MANGO,
  },
  {
    id: 'cozy-lamp',
    title: '暖光小灯',
    description: '低落时点亮一盏温柔的小灯。',
    cost: 8,
    category: ShopCategory.MOOD_ITEM,
    effect: '安慰喵获得暖光陪伴提示',
    tone: Tone.SKY,
  },
  {
    id: 'calm-stone',
    title: '平静石径',
    description: '为焦虑时刻铺一段慢慢走的路。',
    cost: 10,
    category: ShopCategory.MOOD_ITEM,
    effect: '情绪池塘旁出现平静石径',
    tone: Tone.MINT,
  },
  {
    id: 'study-banner',
    title: '学习旗帜',
    description: '纪念一次认真完成的学习行动。',
    cost: 15,
    category: ShopCategory.CAT_ACCESSORY,
    effect: '学习塔升起一面小旗帜',
    tone: Tone.MANGO,
  },
] as const

function toShopItemDto(item: {
  id: string
  title: string
  description: string
  cost: number
  category: ShopCategory
  effect: string
  tone: Tone
}) {
  const categoryMap: Record<ShopCategory, '庄园装饰' | '情绪道具' | '喵咪小物'> = {
    [ShopCategory.MANOR_DECORATION]: '庄园装饰',
    [ShopCategory.MOOD_ITEM]: '情绪道具',
    [ShopCategory.CAT_ACCESSORY]: '喵咪小物',
  }

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    cost: item.cost,
    category: categoryMap[item.category],
    effect: item.effect,
    tone: item.tone.toLowerCase(),
  }
}

@Injectable()
export class RewardsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async ensureShopItems() {
    await Promise.all(
      shopItems.map((item) => this.prisma.shopItem.upsert({
        where: { id: item.id },
        update: {
          title: item.title,
          description: item.description,
          cost: item.cost,
          category: item.category,
          effect: item.effect,
          tone: item.tone,
          isActive: true,
        },
        create: {
          id: item.id,
          title: item.title,
          description: item.description,
          cost: item.cost,
          category: item.category,
          effect: item.effect,
          tone: item.tone,
        },
      })),
    )
  }

  async getShopItems() {
    await this.ensureShopItems()
    const items = await this.prisma.shopItem.findMany({
      where: { isActive: true },
      orderBy: { cost: 'asc' },
    })

    return items.map(toShopItemDto)
  }

  async getPurchasedItemIds(userId: string) {
    const purchases = await this.prisma.userShopItem.findMany({
      where: { userId },
      orderBy: { acquiredAt: 'asc' },
    })

    return purchases.map((purchase) => purchase.shopItemId)
  }

  async purchaseItem(userId: string, itemId: string) {
    await this.ensureShopItems()
    const item = await this.prisma.shopItem.findUnique({
      where: { id: itemId },
    })

    if (!item || !item.isActive) {
      throw new NotFoundException('商店物品不存在')
    }

    const existing = await this.prisma.userShopItem.findUnique({
      where: {
        userId_shopItemId: {
          userId,
          shopItemId: item.id,
        },
      },
    })

    if (existing) {
      const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } })
      return {
        item: toShopItemDto(item),
        user,
        purchasedItemIds: await this.getPurchasedItemIds(userId),
        evidenceRecord: null,
        catEvent: {
          persona: 'encourage',
          message: `「${item.title}」已经在你的成长庄园里啦。`,
        },
      }
    }

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } })
    if (user.fishCoin < item.cost) {
      throw new BadRequestException(`还差 ${item.cost - user.fishCoin} 条小鱼干才能兑换「${item.title}」。`)
    }

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.userShopItem.create({
        data: {
          userId,
          shopItemId: item.id,
        },
      })

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          fishCoin: { decrement: item.cost },
        },
      })

      const evidenceRecord = await tx.evidenceRecord.create({
        data: {
          userId,
          title: `兑换奖励：${item.title}`,
          category: EvidenceCategory.REWARD_CLAIMED,
          note: `用 ${item.cost} 条小鱼干兑换。${item.effect}。`,
          sourceType: 'shop_item',
          sourceId: item.id,
          fishEarned: 0,
        },
      })

      return { updatedUser, evidenceRecord }
    })

    return {
      item: toShopItemDto(item),
      user: result.updatedUser,
      purchasedItemIds: await this.getPurchasedItemIds(userId),
      evidenceRecord: result.evidenceRecord,
      catEvent: {
        persona: 'encourage',
        message: `兑换成功：「${item.title}」已加入成长庄园。${item.effect}。`,
      },
    }
  }
}
