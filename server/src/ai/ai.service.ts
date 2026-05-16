import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AiProvider as PrismaAiProvider, CatPersona as PrismaCatPersona } from '@prisma/client'

import { PrismaService } from '../prisma/prisma.service.js'
import { AiQuotaService, type AiQuotaState } from './ai-quota.service.js'
import { buildPersonaFallbackReply, buildPersonaSystemPrompt } from './personas.js'
import { routePersona, type RouteResult } from './persona-router.js'

type CatPersona = 'zhixing' | 'encourage' | 'comfort'
type AiProvider = 'mock' | 'deepseek' | 'qwen'
type AiModel = 'deepseek-chat' | 'deepseek-reasoner' | 'qwen-plus'
type ResponseMode = 'brief' | 'detailed'

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

const providerLabels: Record<AiProvider, string> = {
  mock: 'Mock AI',
  deepseek: 'DeepSeek',
  qwen: '通义千问',
}

@Injectable()
export class AiService {
  constructor(
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(AiQuotaService) private readonly quota: AiQuotaService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async chat(text: string, provider: AiProvider = 'mock', model?: AiModel, responseMode: ResponseMode = 'brief', userId = 'anonymous') {
    const trimmed = text.trim()
    const route = routePersona(trimmed)

    if (!trimmed) {
      return this.withProvider(route, 'mock')
    }

    if (provider === 'mock' || route.riskLevel === 'crisis') {
      const result = this.withProvider(
        {
          ...route,
          message: buildPersonaFallbackReply(trimmed, route, responseMode),
        },
        'mock',
      )
      await this.saveChatPair(userId, trimmed, result.message, result.persona, 'mock')
      return result
    }

    const resolvedModel = this.resolveModel(provider, model)
    const quotaRequest = {
      userId,
      provider,
      model: resolvedModel,
      responseMode,
    }
    const quotaState = await this.quota.check(quotaRequest)

    if (!quotaState.allowed) {
      await this.quota.recordBlocked(quotaRequest, trimmed.length)
      const result = this.withProvider(
        {
          ...route,
          message: `${quotaState.label}今日免费额度已用完，明天会自动恢复。你现在仍可切换到 Mock AI，或改用简洁陪伴模式继续体验。`,
        },
        'mock',
        quotaState,
      )
      await this.saveChatPair(userId, trimmed, result.message, result.persona, 'mock', resolvedModel, responseMode, quotaState.tier)
      return result
    }

    let callError = ''
    const modelMessage = await this.callModel(provider, trimmed, route, resolvedModel, responseMode).catch((error: unknown) => {
      callError = error instanceof Error ? error.message : String(error)
      console.warn('AI provider call failed', {
        provider,
        reason: callError,
      })
      return undefined
    })

    if (!modelMessage) {
      await this.quota.recordFailure(quotaRequest, trimmed.length, callError || 'provider_call_failed')
      const result = this.withProvider(
        {
          ...route,
          message: `${buildPersonaFallbackReply(trimmed, route, responseMode)}（${providerLabels[provider]} 暂未配置或暂时不可用，已使用安全兜底回复。）`,
        },
        'mock',
        quotaState,
      )
      await this.saveChatPair(userId, trimmed, result.message, result.persona, 'mock', resolvedModel, responseMode, quotaState.tier)
      return result
    }

    const committedQuota = await this.quota.commit(quotaRequest, trimmed.length, modelMessage.length)
    const result = this.withProvider({ ...route, message: modelMessage }, provider, committedQuota)
    await this.saveChatPair(userId, trimmed, result.message, result.persona, provider, resolvedModel, responseMode, committedQuota.tier)
    return result
  }

  async getRecentMessages(userId: string) {
    const messages = await this.prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 12,
    })

    return messages.reverse().map((message) => ({
      id: message.id,
      role: message.role,
      persona: message.persona?.toLowerCase(),
      text: message.text,
      provider: message.provider?.toLowerCase(),
      model: message.model,
      responseMode: message.responseMode,
      quotaTier: message.quotaTier,
      createdAt: message.createdAt.toISOString(),
    }))
  }

  private async callModel(provider: AiProvider, text: string, route: RouteResult, model: AiModel, responseMode: ResponseMode = 'brief') {
    const apiKey = provider === 'deepseek'
      ? this.config.get<string>('DEEPSEEK_API_KEY')
      : this.config.get<string>('QWEN_API_KEY')

    if (!apiKey) {
      console.warn('AI provider key missing', { provider })
      return undefined
    }

    const endpoint = provider === 'deepseek'
      ? 'https://api.deepseek.com/chat/completions'
      : 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
    const maxTokens = responseMode === 'detailed' ? 1200 : 260
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: this.buildSystemPrompt(route, responseMode),
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.7,
        max_tokens: maxTokens,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      console.warn('AI provider returned non-OK status', {
        provider,
        status: response.status,
        errorText: errorText.slice(0, 240),
      })
      return undefined
    }

    const payload = (await response.json()) as ChatCompletionResponse
    return payload.choices?.[0]?.message?.content?.trim()
  }

  private async saveChatPair(
    userId: string,
    userText: string,
    catText: string,
    persona: CatPersona,
    provider: AiProvider,
    model?: AiModel,
    responseMode?: ResponseMode,
    quotaTier?: string,
  ) {
    await this.prisma.$transaction([
      this.prisma.chatMessage.create({
        data: {
          userId,
          role: 'user',
          text: userText,
          provider: this.mapProvider(provider),
          model,
          responseMode,
          quotaTier,
        },
      }),
      this.prisma.chatMessage.create({
        data: {
          userId,
          role: 'cat',
          persona: this.mapPersona(persona),
          text: catText,
          provider: this.mapProvider(provider),
          model,
          responseMode,
          quotaTier,
        },
      }),
    ])
  }

  private resolveModel(provider: AiProvider, requestedModel?: AiModel): AiModel {
    if (provider === 'deepseek') {
      return requestedModel === 'deepseek-reasoner' ? 'deepseek-reasoner' : 'deepseek-chat'
    }

    return 'qwen-plus'
  }

  private mapProvider(provider: AiProvider) {
    const providerMap: Record<AiProvider, PrismaAiProvider> = {
      mock: PrismaAiProvider.MOCK,
      deepseek: PrismaAiProvider.DEEPSEEK,
      qwen: PrismaAiProvider.QWEN,
    }

    return providerMap[provider]
  }

  private mapPersona(persona: CatPersona) {
    const personaMap: Record<CatPersona, PrismaCatPersona> = {
      zhixing: PrismaCatPersona.ZHIXING,
      encourage: PrismaCatPersona.ENCOURAGE,
      comfort: PrismaCatPersona.COMFORT,
    }

    return personaMap[persona]
  }

  private buildSystemPrompt(route: RouteResult, responseMode: ResponseMode) {
    return buildPersonaSystemPrompt(route, responseMode)
  }

  private withProvider(route: RouteResult, provider: AiProvider, quota?: AiQuotaState) {
    return {
      ...route,
      provider,
      providerLabel: providerLabels[provider],
      quota,
    }
  }
}
