import { routeChatPersona } from './chatRouter'
import type { RouteResult, UserPreferences } from '../types/app'

export type AiProviderId = UserPreferences['provider']
export type AiModelId = UserPreferences['aiModel']

const providerLabels: Record<AiProviderId, string> = {
  mock: 'Mock AI',
  deepseek: 'DeepSeek',
  qwen: '通义千问',
}

export function getProviderLabel(provider: string) {
  if (provider === 'deepseek') return providerLabels.deepseek
  if (provider === 'qwen') return providerLabels.qwen
  return providerLabels.mock
}

export function getModelLabel(model: string) {
  if (model === 'deepseek-reasoner') return 'DeepSeek Reasoner'
  if (model === 'deepseek-chat') return 'DeepSeek Chat'
  if (model === 'qwen-plus') return '通义千问 Plus'
  return '默认模型'
}

export function classifyChatWithProvider(provider: AiProviderId, text: string): RouteResult {
  const route = routeChatPersona(text)

  if (provider === 'mock') {
    return route
  }

  return {
    ...route,
    message: `${route.message}（当前为 ${getProviderLabel(provider)} 接入占位，正式上线后由后端安全调用模型。）`,
  }
}
