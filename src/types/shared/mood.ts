import type { CatPersona } from './cat'
import type { Tone } from './common'

export type MoodSupportActionId = 'breathe' | 'tiny-step' | 'self-kindness'

export type MoodResponse = {
  mood: string
  persona: CatPersona
  companionLine: string
  recommendedEnergy: '低能量' | '中能量' | '高能量'
  manorTheme: 'warm' | 'calm' | 'bright' | 'comfort' | 'focus'
  manorHint: string
  supportActionIds: readonly MoodSupportActionId[]
}

export type MoodRecord = {
  id: number
  label: string
  intensity: number
  note: string
}

export type MoodSupportAction = {
  id: MoodSupportActionId
  title: string
  description: string
  resultMessage: string
  persona: CatPersona
  rewardFish: number
  tone: Tone
}
