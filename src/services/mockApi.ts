import { initialSession } from '../data/mockData'
import type { ApiResponse, AppSession, UserPreferences } from '../types/app'

const STORAGE_KEY = 'zhixing-miao-session-v1'

function cloneSession(session: AppSession): AppSession {
  return JSON.parse(JSON.stringify(session)) as AppSession
}

function normalizeSession(session: Partial<AppSession>): AppSession {
  const base = cloneSession(initialSession)

  return {
    ...base,
    ...session,
    user: { ...base.user, ...session.user },
    preferences: { ...base.preferences, ...session.preferences },
    goals: session.goals ?? base.goals,
    habits: session.habits ?? base.habits,
    claimedMissionIds: session.claimedMissionIds ?? base.claimedMissionIds,
    purchasedItemIds: session.purchasedItemIds ?? base.purchasedItemIds,
    joinedActivityIds: session.joinedActivityIds ?? base.joinedActivityIds,
    evidenceRecords: session.evidenceRecords ?? base.evidenceRecords,
    manor: session.manor ?? base.manor,
    shopItems: session.shopItems ?? base.shopItems,
    tasks: session.tasks ?? base.tasks,
    moods: session.moods ?? base.moods,
    moodResponse: {
      ...base.moodResponse,
      ...session.moodResponse,
      supportActionIds: session.moodResponse?.supportActionIds ?? base.moodResponse.supportActionIds,
    },
    chatMessages: session.chatMessages ?? base.chatMessages,
  }
}

function ok<T>(data: T, message?: string): ApiResponse<T> {
  return { ok: true, data, message }
}

function readStoredSession(): AppSession {
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (!stored) return cloneSession(initialSession)

  try {
    return normalizeSession(JSON.parse(stored) as Partial<AppSession>)
  } catch {
    return cloneSession(initialSession)
  }
}

function writeStoredSession(session: AppSession): AppSession {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  return session
}

export const mockApi = {
  getCurrentSession(): ApiResponse<AppSession> {
    return ok(readStoredSession())
  },

  putSession(session: AppSession): ApiResponse<AppSession> {
    return ok(writeStoredSession(session))
  },

  postAuthSession(session: AppSession, payload: { mode: 'login' | 'guest' }): ApiResponse<AppSession> {
    const nextSession = {
      ...session,
      isSignedIn: true,
      catBubble: payload.mode === 'login' ? '欢迎回来，今天继续从轻一点的任务开始。' : '游客体验已开启，所有数据先存在本地原型里。',
    }

    return ok(writeStoredSession(nextSession), 'signed_in')
  },

  patchUserPreferences(session: AppSession, payload: Partial<UserPreferences>): ApiResponse<AppSession> {
    const nextSession = {
      ...session,
      preferences: { ...session.preferences, ...payload },
    }

    return ok(writeStoredSession(nextSession), 'preferences_updated')
  },

  deleteSession(): ApiResponse<AppSession> {
    const nextSession = cloneSession(initialSession)
    return ok(writeStoredSession(nextSession), 'session_reset')
  },
}
