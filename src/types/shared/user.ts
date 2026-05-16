export type UserProfile = {
  name: string
  level: number
  title: string
  streakDays: number
  fishCount: number
}

export type UserPreferences = {
  motionEnabled: boolean
  quietMode: boolean
  provider: 'mock' | 'deepseek' | 'qwen'
  aiModel: 'deepseek-chat' | 'deepseek-reasoner' | 'qwen-plus'
  responseMode: 'brief' | 'detailed'
}
