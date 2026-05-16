import type { Tone } from './common'

export type SpecialMission = {
  id: 'weekly-actions' | 'daily-action' | 'mood-check' | 'habit-starter'
  title: string
  description: string
  target: number
  unit: string
  rewardLabel: string
  expiresIn: string
  tone: Tone
}

export type MissionProgress = SpecialMission & {
  current: number
  percent: number
  completed: boolean
  claimed: boolean
}

export type ShopItem = {
  id: string
  title: string
  description: string
  cost: number
  category: '庄园装饰' | '情绪道具' | '喵咪小物'
  effect: string
  tone: Tone
}
