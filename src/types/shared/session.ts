import type { ActivityChallenge } from './explore'
import type { ActiveHabit } from './habit'
import type { CatPersona, ChatMessage } from './cat'
import type { Goal } from './goal'
import type { GrowthEvidence } from './evidence'
import type { ManorState } from './manor'
import type { MoodRecord, MoodResponse } from './mood'
import type { ShopItem, SpecialMission } from './reward'
import type { Task } from './task'
import type { UserPreferences, UserProfile } from './user'

export type AppSession = {
  isSignedIn: boolean
  user: UserProfile
  preferences: UserPreferences
  goals: Goal[]
  habits: ActiveHabit[]
  claimedMissionIds: SpecialMission['id'][]
  purchasedItemIds: ShopItem['id'][]
  joinedActivityIds: ActivityChallenge['id'][]
  evidenceRecords: GrowthEvidence[]
  manor: ManorState
  shopItems: ShopItem[]
  tasks: Task[]
  moods: MoodRecord[]
  moodResponse: MoodResponse
  selectedMood: string
  activePersona: CatPersona
  catBubble: string
  chatMessages: ChatMessage[]
}
