export type ManorBuilding = {
  id: string
  type: string
  itemId?: string
  label: string
  variant: 'core' | 'decoration'
  level: number
  positionX: number
  positionY: number
  unlockedAt: string
}

export type ManorState = {
  buildings: ManorBuilding[]
  vitality: number
  moodTone: string
  theme: 'warm' | 'calm' | 'bright' | string
  updatedAt: string
}
