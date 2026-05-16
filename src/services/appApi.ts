import {
  completeMoodSupportAction as completeLocalMoodSupportAction,
  recordMood as recordLocalMood,
  createGoalPlan,
  activateHabitTemplate,
  purchaseShopItem,
  submitChat,
  toggleTask,
} from "./sessionActions";
import { httpApi } from "./httpApi";
import { mockApi } from "./mockApi";
import type {
  ApiResponse,
  AppSession,
  MoodSupportAction,
  Task,
  UserPreferences,
} from "../types/app";

type CreateTaskPayload = {
  title: string;
  area: string;
  energy: Task["energy"];
  dueLabel: string;
};

const apiMode = import.meta.env.VITE_API_MODE ?? "mock";

function asyncOk<T>(response: ApiResponse<T>) {
  return Promise.resolve(response);
}

const mockAdapter = {
  getCurrentSession() {
    return asyncOk(mockApi.getCurrentSession());
  },

  putSession(session: AppSession) {
    return asyncOk(mockApi.putSession(session));
  },

  postAuthSession(session: AppSession, payload: { mode: "login" | "guest" }) {
    return asyncOk(mockApi.postAuthSession(session, payload));
  },

  patchUserPreferences(session: AppSession, payload: Partial<UserPreferences>) {
    return asyncOk(mockApi.patchUserPreferences(session, payload));
  },

  createTask(session: AppSession, payload: CreateTaskPayload) {
    const numericIds = session.tasks
      .map((task) => Number(task.id))
      .filter(Number.isFinite);
    const taskId = numericIds.length === 0 ? 1 : Math.max(...numericIds) + 1;

    return asyncOk({
      ok: true,
      data: {
        ...session,
        tasks: [
          ...session.tasks,
          {
            id: taskId,
            title: payload.title,
            area: payload.area,
            energy: payload.energy,
            dueLabel: payload.dueLabel,
            done: false,
          },
        ],
        activePersona: "zhixing" as const,
        catBubble: "新任务已放进今日清单，我们按最小一步开始。",
      },
      message: "task_created",
    });
  },

  createGoalPlan(session: AppSession, goalText: string) {
    return asyncOk({
      ok: true,
      data: createGoalPlan(session, goalText),
      message: "goal_created",
    });
  },

  activateHabitTemplate(session: AppSession, templateId: string) {
    return asyncOk({
      ok: true,
      data: activateHabitTemplate(session, templateId),
      message: "habit_activated",
    });
  },

  completeTask(session: AppSession, taskId: Task["id"]) {
    return asyncOk({
      ok: true,
      data: toggleTask(session, taskId),
      message: "task_toggled",
    });
  },

  submitChat(session: AppSession, text: string) {
    return asyncOk({
      ok: true,
      data: submitChat(session, text),
      message: "chat_submitted",
    });
  },

  recordMood(session: AppSession, mood: string) {
    return asyncOk({
      ok: true,
      data: recordLocalMood(session, mood),
      message: "mood_recorded",
    });
  },

  completeMoodSupportAction(session: AppSession, actionId: MoodSupportAction["id"]) {
    return asyncOk({
      ok: true,
      data: completeLocalMoodSupportAction(session, actionId),
      message: "mood_support_completed",
    });
  },

  purchaseShopItem(session: AppSession, itemId: import("../types/app").ShopItem["id"]) {
    const nextSession = purchaseShopItem(session, itemId);
    const hasDecoration = nextSession.manor.buildings.some((building) => building.itemId === itemId);
    const decorationPlacements: Record<string, { label: string; positionX: number; positionY: number }> = {
      sunflower: { label: "向阳花圃", positionX: 14, positionY: 82 },
      "cozy-lamp": { label: "暖光小灯", positionX: 84, positionY: 42 },
      "calm-stone": { label: "平静石径", positionX: 52, positionY: 86 },
      "study-banner": { label: "学习旗帜", positionX: 20, positionY: 24 },
    };
    const placement = decorationPlacements[itemId];

    return asyncOk({
      ok: true,
      data: placement && !hasDecoration
        ? {
            ...nextSession,
            manor: {
              ...nextSession.manor,
              buildings: [
                ...nextSession.manor.buildings,
                {
                  id: `mock-decor-${itemId}`,
                  type: `decor:${itemId}`,
                  itemId,
                  label: placement.label,
                  variant: "decoration" as const,
                  level: 1,
                  positionX: placement.positionX,
                  positionY: placement.positionY,
                  unlockedAt: new Date().toISOString(),
                },
              ],
            },
          }
        : nextSession,
      message: "shop_item_purchased",
    });
  },

  updateManorBuilding(
    session: AppSession,
    buildingId: string,
    payload: { positionX?: number; positionY?: number; level?: number },
  ) {
    return asyncOk({
      ok: true,
      data: {
        ...session,
        manor: {
          ...session.manor,
          buildings: session.manor.buildings.map((building) =>
            building.id === buildingId
              ? {
                  ...building,
                  positionX: payload.positionX ?? building.positionX,
                  positionY: payload.positionY ?? building.positionY,
                  level: payload.level ?? building.level,
                }
              : building,
          ),
          updatedAt: new Date().toISOString(),
        },
        catBubble: "庄园布局已保存，换设备也能恢复这片小天地。",
      },
      message: "manor_building_updated",
    });
  },

  deleteSession() {
    return asyncOk(mockApi.deleteSession());
  },
};

export const usingBackendApi = apiMode === "backend";

export const appApi = usingBackendApi ? httpApi : mockAdapter;
