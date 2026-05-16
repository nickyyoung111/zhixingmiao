import { Inject, Injectable } from '@nestjs/common'
import { AiProvider as PrismaAiProvider } from '@prisma/client'

import { PrismaService } from '../prisma/prisma.service.js'

type AiProvider = 'mock' | 'deepseek' | 'qwen'
type AiModel = 'deepseek-chat' | 'deepseek-reasoner' | 'qwen-plus'
type ResponseMode = 'brief' | 'detailed'

type QuotaTier = 'mock' | 'standard' | 'detailed' | 'reasoner'

type QuotaRule = {
  limit: number
  label: string
}

export type QuotaRequest = {
  userId: string
  provider: AiProvider
  model: AiModel
  responseMode: ResponseMode
}

type UsageLogPayload = QuotaRequest & {
  status: 'success' | 'failed' | 'blocked'
  promptChars: number
  outputChars?: number
  errorMessage?: string
}

export type AiQuotaState = {
  allowed: boolean
  tier: QuotaTier
  label: string
  limit: number
  used: number
  remaining: number
  resetsAt: string
}

const quotaRules: Record<QuotaTier, QuotaRule> = {
  mock: { limit: Number.POSITIVE_INFINITY, label: 'Mock AI' },
  standard: { limit: 20, label: '标准 AI 对话' },
  detailed: { limit: 5, label: '详细分析' },
  reasoner: { limit: 3, label: '深度思考' },
}

@Injectable()
export class AiQuotaService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async check(request: QuotaRequest): Promise<AiQuotaState> {
    const tier = this.resolveTier(request)
    const rule = quotaRules[tier]
    const resetsAt = this.getTomorrowStart().toISOString()

    if (!Number.isFinite(rule.limit)) {
      return {
        allowed: true,
        tier,
        label: rule.label,
        limit: rule.limit,
        used: 0,
        remaining: rule.limit,
        resetsAt,
      }
    }

    const { start, end } = this.getTodayRange()
    const used = await this.prisma.aiUsageLog.count({
      where: {
        userId: request.userId,
        quotaTier: tier,
        status: 'success',
        createdAt: {
          gte: start,
          lt: end,
        },
      },
    })

    if (used >= rule.limit) {
      return {
        allowed: false,
        tier,
        label: rule.label,
        limit: rule.limit,
        used,
        remaining: 0,
        resetsAt,
      }
    }

    return {
      allowed: true,
      tier,
      label: rule.label,
      limit: rule.limit,
      used,
      remaining: Math.max(0, rule.limit - used),
      resetsAt,
    }
  }

  async commit(request: QuotaRequest, promptChars: number, outputChars: number): Promise<AiQuotaState> {
    const checked = await this.check(request)
    if (!checked.allowed || !Number.isFinite(checked.limit)) return checked

    await this.record({
      ...request,
      status: 'success',
      promptChars,
      outputChars,
    })

    const nextUsed = checked.used + 1

    return {
      allowed: true,
      tier: checked.tier,
      label: checked.label,
      limit: checked.limit,
      used: nextUsed,
      remaining: Math.max(0, checked.limit - nextUsed),
      resetsAt: checked.resetsAt,
    }
  }

  async recordFailure(request: QuotaRequest, promptChars: number, errorMessage: string) {
    await this.record({
      ...request,
      status: 'failed',
      promptChars,
      errorMessage,
    })
  }

  async recordBlocked(request: QuotaRequest, promptChars: number) {
    await this.record({
      ...request,
      status: 'blocked',
      promptChars,
    })
  }

  private async record(payload: UsageLogPayload) {
    await this.prisma.aiUsageLog.create({
      data: {
        userId: payload.userId,
        provider: this.mapProvider(payload.provider),
        model: payload.model,
        responseMode: payload.responseMode,
        quotaTier: this.resolveTier(payload),
        status: payload.status,
        promptChars: payload.promptChars,
        outputChars: payload.outputChars ?? 0,
        errorMessage: payload.errorMessage,
      },
    })
  }

  private resolveTier(request: QuotaRequest): QuotaTier {
    if (request.provider === 'mock') return 'mock'
    if (request.model === 'deepseek-reasoner') return 'reasoner'
    if (request.responseMode === 'detailed') return 'detailed'
    return 'standard'
  }

  private mapProvider(provider: AiProvider) {
    const providerMap: Record<AiProvider, PrismaAiProvider> = {
      mock: PrismaAiProvider.MOCK,
      deepseek: PrismaAiProvider.DEEPSEEK,
      qwen: PrismaAiProvider.QWEN,
    }

    return providerMap[provider]
  }

  private getTodayRange() {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(start.getDate() + 1)

    return { start, end }
  }

  private getTomorrowStart() {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(now.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    return tomorrow
  }
}
