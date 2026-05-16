import { Inject, Injectable } from '@nestjs/common'
import { EvidenceCategory } from '@prisma/client'

import { PrismaService } from '../prisma/prisma.service.js'

function toEvidenceDto(record: {
  id: string
  title: string
  category: EvidenceCategory
  note: string
  fishEarned: number
  createdAt: Date
}) {
  return {
    id: record.id,
    title: record.title,
    category: record.category,
    note: record.note,
    fishEarned: record.fishEarned,
    createdAt: record.createdAt.toISOString(),
  }
}

@Injectable()
export class EvidenceService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getRecords(userId: string) {
    const records = await this.prisma.evidenceRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return records.map(toEvidenceDto)
  }

  async getSummary(userId: string) {
    const [totalCount, totalFish, practiceCount, latestRecords] = await Promise.all([
      this.prisma.evidenceRecord.count({ where: { userId } }),
      this.prisma.evidenceRecord.aggregate({
        where: { userId },
        _sum: { fishEarned: true },
      }),
      this.prisma.evidenceRecord.count({
        where: {
          userId,
          category: { in: [EvidenceCategory.PRACTICE, EvidenceCategory.SCENARIO_PRACTICE] },
        },
      }),
      this.prisma.evidenceRecord.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
    ])

    return {
      totalCount,
      practiceCount,
      totalFishEarned: totalFish._sum.fishEarned ?? 0,
      latestRecords: latestRecords.map(toEvidenceDto),
    }
  }
}
