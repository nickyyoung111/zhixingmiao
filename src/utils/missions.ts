import { specialMissions } from '../data/mockData'
import type { AppSession, MissionProgress, SpecialMission } from '../types/app'

function clampProgress(current: number, target: number) {
  return Math.min(current, target)
}

function currentForMission(session: AppSession, mission: SpecialMission) {
  const completedCount = session.tasks.filter((task) => task.done).length

  switch (mission.id) {
    case 'weekly-actions':
    case 'daily-action':
      return completedCount
    case 'mood-check':
      return session.selectedMood ? 1 : 0
    case 'habit-starter':
      return session.habits.length
    default:
      return 0
  }
}

export function getMissionProgress(session: AppSession): MissionProgress[] {
  return specialMissions.map((mission) => {
    const current = clampProgress(currentForMission(session, mission), mission.target)
    const percent = Math.round((current / mission.target) * 100)

    return {
      ...mission,
      current,
      percent,
      completed: current >= mission.target,
      claimed: session.claimedMissionIds.includes(mission.id),
    }
  })
}
