import type { CatPersona } from './cat'
import type { Tone } from './common'

export type ToolCard = {
  id: string
  title: string
  description: string
  status: '可体验' | '设计中' | '待接入'
}

export type ScenarioPractice = {
  id: 'ask-help' | 'say-no' | 'after-setback'
  title: string
  situation: string
  firstLine: string
  persona: CatPersona
  rewardFish: number
}

export type ActivityChallenge = {
  id: 'volunteer-spark' | 'campus-helper' | 'reflection-note'
  title: string
  area: string
  description: string
  tinyStep: string
  duration: string
  rewardFish: number
  tone: Tone
}
