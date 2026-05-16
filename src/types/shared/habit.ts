import type { EnergyLevel } from './task'

export type HabitTemplate = {
  id: string
  title: string
  area: string
  cue: string
  tinyAction: string
  reward: string
  energy: EnergyLevel
}

export type ActiveHabit = {
  id: string | number
  templateId: string
  title: string
  streak: number
  createdAt: string
}
