import { initialSession } from "../data/mockData";
import { createMoodResponse } from "./moodResponses";
import type {
  ApiResponse,
  AppSession,
  ActiveHabit,
  ChatMessage,
  EnergyLevel,
  Goal,
  GrowthEvidence,
  ManorState,
  MoodResponse,
  MoodSupportAction,
  RouteResult,
  ShopItem,
  Task,
  UserPreferences,
  UserProfile,
} from "../types/app";

const TOKEN_KEY = "zhixing-miao-backend-token";
const SESSION_CACHE_KEY = "zhixing-miao-backend-session-cache-v1";
const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001/api/v1";

type BackendPreferences = {
  motionEnabled?: boolean;
  quietMode?: boolean;
  provider?: string;
};

type BackendUser = {
  id: string;
  nickname: string;
  level: number;
  fishCoin: number;
  streakDays: number;
  preferences?: BackendPreferences | null;
};

type BackendTask = {
  id: string;
  title: string;
  area: string;
  energyLevel: "low" | "medium" | "high";
  isCompleted: boolean;
  dueLabel: string | null;
};

type BackendEvidenceRecord = {
  id: string;
  title: string;
  category: string;
  note: string | null;
  createdAt: string;
  fishEarned: number;
};

type BackendMoodRecord = {
  id: string;
  label: string;
  intensity: number;
  note: string;
  createdAt: string;
};

type BackendGoal = {
  id: string;
  title: string;
  category?: string | null;
  horizon: Goal["horizon"];
  reason: string;
  progress: number;
  status: string;
  createdAt: string;
};

type BackendHabit = {
  id: string;
  templateId: string;
  title: string;
  streak: number;
  createdAt: string;
};

type BackendShopItem = ShopItem;

type BackendManorState = ManorState;

type PurchaseShopItemResult = {
  item: BackendShopItem;
  user?: BackendUser;
  purchasedItemIds: string[];
  evidenceRecord?: BackendEvidenceRecord | null;
  catEvent: {
    persona: AppSession["activePersona"];
    message: string;
  };
};

type GuestSessionResult = {
  tokenType: "guest";
  accessToken: string;
  user: BackendUser;
};

type CompleteTaskResult = {
  task: BackendTask;
  user?: BackendUser;
  evidenceRecord?: BackendEvidenceRecord | null;
  catEvent: {
    persona: AppSession["activePersona"];
    message: string;
  };
};

type RecordMoodResult = {
  mood: BackendMoodRecord;
  moods: BackendMoodRecord[];
  moodResponse?: MoodResponse;
  catEvent: {
    persona: AppSession["activePersona"];
    message: string;
  };
};

type CompleteMoodSupportResult = {
  user?: BackendUser;
  evidenceRecord?: BackendEvidenceRecord | null;
  catEvent: {
    persona: AppSession["activePersona"];
    message: string;
  };
};

type CreateTaskPayload = {
  title: string;
  area: string;
  energy: EnergyLevel;
  dueLabel: string;
};

type CreateGoalResult = {
  goal: BackendGoal;
  tasks: BackendTask[];
  catEvent: {
    persona: AppSession["activePersona"];
    message: string;
  };
};

type ActivateHabitResult = {
  habit: BackendHabit;
  tasks: BackendTask[];
  catEvent: {
    persona: AppSession["activePersona"];
    message: string;
  };
};

type BackendChatResult = RouteResult & {
  provider: UserPreferences["provider"];
  providerLabel: string;
  quota?: {
    allowed: boolean;
    tier: string;
    label: string;
    limit: number;
    used: number;
    remaining: number;
    resetsAt: string;
  };
};

type BackendChatMessage = {
  id: string;
  role: ChatMessage["role"];
  persona?: string | null;
  text: string;
  createdAt: string;
};

type AiModel = UserPreferences["aiModel"];
type ResponseMode = UserPreferences["responseMode"];

function ok<T>(data: T, message?: string): ApiResponse<T> {
  return { ok: true, data, message };
}

function readCachedSession() {
  const stored = window.localStorage.getItem(SESSION_CACHE_KEY);
  if (!stored) return initialSession;

  try {
    const cached = JSON.parse(stored) as Partial<AppSession>;

    return {
      ...initialSession,
      ...cached,
      user: { ...initialSession.user, ...cached.user },
      preferences: { ...initialSession.preferences, ...cached.preferences },
      goals: cached.goals ?? initialSession.goals,
      habits: cached.habits ?? initialSession.habits,
      evidenceRecords: cached.evidenceRecords ?? initialSession.evidenceRecords,
      manor: cached.manor ?? initialSession.manor,
      shopItems: cached.shopItems ?? initialSession.shopItems,
      tasks: cached.tasks ?? initialSession.tasks,
      moods: cached.moods ?? initialSession.moods,
      moodResponse: {
        ...initialSession.moodResponse,
        ...cached.moodResponse,
        supportActionIds:
          cached.moodResponse?.supportActionIds ?? initialSession.moodResponse.supportActionIds,
      },
      chatMessages: cached.chatMessages ?? initialSession.chatMessages,
    };
  } catch {
    return initialSession;
  }
}

function writeCachedSession(session: AppSession) {
  window.localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(session));
  return session;
}

function readToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

function readGuestUserId() {
  const token = readToken();
  return token?.startsWith("guest:") ? token.slice("guest:".length) : undefined;
}

async function request<T>(path: string, init: RequestInit = {}) {
  const token = readToken();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, { ...init, headers });
  const payload = (await response
    .json()
    .catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.message ?? `请求失败：${response.status}`);
  }

  return payload.data;
}

function mapEnergy(energyLevel: BackendTask["energyLevel"]): EnergyLevel {
  const energyMap: Record<BackendTask["energyLevel"], EnergyLevel> = {
    low: "低能量",
    medium: "中能量",
    high: "高能量",
  };

  return energyMap[energyLevel];
}

function mapEnergyToBackend(energy: EnergyLevel): BackendTask["energyLevel"] {
  const energyMap: Record<EnergyLevel, BackendTask["energyLevel"]> = {
    低能量: "low",
    中能量: "medium",
    高能量: "high",
  };

  return energyMap[energy];
}

function mapTask(task: BackendTask): Task {
  return {
    id: task.id,
    title: task.title,
    area: task.area,
    energy: mapEnergy(task.energyLevel),
    done: task.isCompleted,
    dueLabel: task.dueLabel ?? "今天",
  };
}

function mapGoal(goal: BackendGoal): Goal {
  return {
    id: goal.id,
    title: goal.title,
    horizon: goal.horizon,
    reason: goal.reason,
    progress: goal.progress,
    createdAt: goal.createdAt,
  };
}

function mapHabit(habit: BackendHabit): ActiveHabit {
  return {
    id: habit.id,
    templateId: habit.templateId,
    title: habit.title,
    streak: habit.streak,
    createdAt: habit.createdAt,
  };
}

function mapProvider(
  provider: string | undefined,
): UserPreferences["provider"] {
  const normalized = provider?.toLowerCase();
  return normalized === "deepseek" || normalized === "qwen"
    ? normalized
    : "mock";
}

function mapModel(model: string | undefined, provider: UserPreferences["provider"]): AiModel {
  if (provider === "qwen") return "qwen-plus";
  return model === "deepseek-reasoner" ? "deepseek-reasoner" : "deepseek-chat";
}

function mapResponseMode(mode: string | undefined): ResponseMode {
  return mode === "detailed" ? "detailed" : "brief";
}

function mapPreferences(
  preferences?: BackendPreferences | null,
  fallback: UserPreferences = initialSession.preferences,
): UserPreferences {
  const provider = mapProvider(preferences?.provider ?? fallback.provider);

  return {
    motionEnabled: preferences?.motionEnabled ?? fallback.motionEnabled,
    quietMode: preferences?.quietMode ?? fallback.quietMode,
    provider,
    aiModel: mapModel(fallback.aiModel, provider),
    responseMode: mapResponseMode(fallback.responseMode),
  };
}

function mapUser(user: BackendUser): UserProfile {
  return {
    name: user.nickname,
    level: user.level,
    title: "成长练习生",
    streakDays: user.streakDays,
    fishCount: user.fishCoin,
  };
}

function mapEvidence(record: BackendEvidenceRecord): GrowthEvidence {
  const categoryMap: Record<string, GrowthEvidence["category"]> = {
    ACTION_COMPLETED: "行动完成",
    PRACTICE: "实践体验",
    MOOD_SUPPORT: "情绪照顾",
    SCENARIO_PRACTICE: "沟通练习",
    REWARD_CLAIMED: "奖励领取",
  };

  return {
    id: record.id,
    title: record.title,
    category: categoryMap[record.category] ?? "行动完成",
    note: record.note ?? "行动证据已记录。",
    createdAt: record.createdAt.slice(0, 10),
    fishEarned: record.fishEarned,
  };
}

function mapMoods(records: BackendMoodRecord[]) {
  return records.map((record, index) => ({
    id: index + 1,
    label: record.label,
    intensity: record.intensity,
    note: record.note,
  }));
}

function mapPersona(persona: string | null | undefined): ChatMessage["persona"] | undefined {
  const normalized = persona?.toLowerCase();
  return normalized === "zhixing" || normalized === "encourage" || normalized === "comfort"
    ? normalized
    : undefined;
}

function mapChatMessages(messages: BackendChatMessage[]): ChatMessage[] {
  return messages.map((message, index) => ({
    id: index + 1,
    role: message.role,
    persona: mapPersona(message.persona),
    text: message.text,
  }));
}

function mergeBackendSession(
  current: AppSession,
  user: BackendUser,
  tasks: BackendTask[],
  patch: Partial<AppSession> = {},
): AppSession {
  return writeCachedSession({
    ...current,
    ...patch,
    isSignedIn: true,
    user: mapUser(user),
    preferences: mapPreferences(user.preferences, current.preferences),
    tasks: tasks.map(mapTask),
  });
}

function nextChatId(messages: ChatMessage[]) {
  const ids = messages.map((message) => message.id).filter(Number.isFinite);
  return ids.length === 0 ? 1 : Math.max(...ids) + 1;
}

async function loadSignedInSession(current: AppSession) {
  const [user, tasks, goals, habits, evidenceRecords, manor, shopItems, purchasedItemIds, moods, chatHistory] = await Promise.all([
    request<BackendUser>("/me"),
    request<BackendTask[]>("/tasks/today"),
    request<BackendGoal[]>("/goals"),
    request<BackendHabit[]>("/habits"),
    request<BackendEvidenceRecord[]>("/evidence-records"),
    request<BackendManorState>("/manor"),
    request<BackendShopItem[]>("/shop/items"),
    request<string[]>("/shop/purchases"),
    request<BackendMoodRecord[]>("/moods/recent"),
    request<BackendChatMessage[]>("/ai/chat/history"),
  ]);
  const latestMood = moods[0];

  return mergeBackendSession(current, user, tasks, {
    goals: goals.map(mapGoal),
    habits: habits.map(mapHabit),
    evidenceRecords: evidenceRecords.map(mapEvidence),
    manor,
    shopItems,
    purchasedItemIds,
    moods: mapMoods(moods),
    selectedMood: latestMood?.label ?? current.selectedMood,
    moodResponse: latestMood
      ? createMoodResponse(latestMood.label, latestMood.note)
      : current.moodResponse,
    chatMessages: mapChatMessages(chatHistory),
  });
}

export const httpApi = {
  async getCurrentSession(): Promise<ApiResponse<AppSession>> {
    if (!readToken()) {
      return ok(readCachedSession());
    }

    return ok(await loadSignedInSession(readCachedSession()));
  },

  async putSession(session: AppSession): Promise<ApiResponse<AppSession>> {
    return ok(writeCachedSession(session));
  },

  async postAuthSession(
    session: AppSession,
    payload: { mode: "login" | "guest" },
  ): Promise<ApiResponse<AppSession>> {
    const result = await request<GuestSessionResult>("/auth/guest", {
      method: "POST",
      body: JSON.stringify({
        userId: readGuestUserId(),
        nickname: session.user.name,
      }),
    });

    window.localStorage.setItem(TOKEN_KEY, result.accessToken);
    const [tasks, goals, habits, evidenceRecords, manor, shopItems, purchasedItemIds, moods, chatHistory] = await Promise.all([
      request<BackendTask[]>("/tasks/today"),
      request<BackendGoal[]>("/goals"),
      request<BackendHabit[]>("/habits"),
      request<BackendEvidenceRecord[]>("/evidence-records"),
      request<BackendManorState>("/manor"),
      request<BackendShopItem[]>("/shop/items"),
      request<string[]>("/shop/purchases"),
      request<BackendMoodRecord[]>("/moods/recent"),
      request<BackendChatMessage[]>("/ai/chat/history"),
    ]);
    const latestMood = moods[0];
    const message =
      payload.mode === "login"
        ? "欢迎回来，今日任务已经从后端同步。"
        : "游客体验已连接后端，今日任务会保存到数据库。";

    return ok(
      mergeBackendSession(session, result.user, tasks, {
        catBubble: message,
        goals: goals.map(mapGoal),
        habits: habits.map(mapHabit),
        evidenceRecords: evidenceRecords.map(mapEvidence),
        manor,
        shopItems,
        purchasedItemIds,
        moods: mapMoods(moods),
        selectedMood: latestMood?.label ?? session.selectedMood,
        moodResponse: latestMood
          ? createMoodResponse(latestMood.label, latestMood.note)
          : session.moodResponse,
        chatMessages: mapChatMessages(chatHistory),
      }),
      "signed_in",
    );
  },

  async patchUserPreferences(
    session: AppSession,
    payload: Partial<UserPreferences>,
  ): Promise<ApiResponse<AppSession>> {
    const user = await request<BackendUser>("/me/preferences", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    return ok(
      writeCachedSession({
        ...session,
        user: mapUser(user),
        preferences: mapPreferences(user.preferences, {
          ...session.preferences,
          ...payload,
        }),
        catBubble: "偏好已同步到后端，刷新页面也会保留。",
      }),
      "preferences_updated",
    );
  },

  async createTask(
    session: AppSession,
    payload: CreateTaskPayload,
  ): Promise<ApiResponse<AppSession>> {
    const result = await request<CompleteTaskResult>("/tasks", {
      method: "POST",
      body: JSON.stringify({
        title: payload.title,
        area: payload.area,
        energyLevel: mapEnergyToBackend(payload.energy),
        dueLabel: payload.dueLabel,
      }),
    });

    return ok(
      writeCachedSession({
        ...session,
        tasks: [...session.tasks, mapTask(result.task)],
        activePersona: result.catEvent.persona,
        catBubble: result.catEvent.message,
      }),
      "task_created",
    );
  },

  async createGoalPlan(
    session: AppSession,
    goalText: string,
  ): Promise<ApiResponse<AppSession>> {
    const result = await request<CreateGoalResult>("/goals", {
      method: "POST",
      body: JSON.stringify({ title: goalText }),
    });

    return ok(
      writeCachedSession({
        ...session,
        goals: [mapGoal(result.goal), ...session.goals].slice(0, 4),
        tasks: [...result.tasks.map(mapTask), ...session.tasks].slice(0, 8),
        activePersona: result.catEvent.persona,
        catBubble: result.catEvent.message,
      }),
      "goal_created",
    );
  },

  async activateHabitTemplate(
    session: AppSession,
    templateId: string,
  ): Promise<ApiResponse<AppSession>> {
    const result = await request<ActivateHabitResult>("/habits", {
      method: "POST",
      body: JSON.stringify({ templateId }),
    });

    return ok(
      writeCachedSession({
        ...session,
        habits: [
          mapHabit(result.habit),
          ...session.habits.filter((habit) => habit.templateId !== result.habit.templateId),
        ].slice(0, 4),
        tasks: [...result.tasks.map(mapTask), ...session.tasks].slice(0, 8),
        activePersona: result.catEvent.persona,
        catBubble: result.catEvent.message,
      }),
      "habit_activated",
    );
  },

  async completeTask(
    session: AppSession,
    taskId: Task["id"],
  ): Promise<ApiResponse<AppSession>> {
    const currentTask = session.tasks.find((task) => task.id === taskId);
    const action = currentTask?.done ? "reopen" : "complete";
    const result = await request<CompleteTaskResult>(
      `/tasks/${taskId}/${action}`,
      { method: "POST" },
    );
    const evidenceRecords = result.evidenceRecord
      ? [mapEvidence(result.evidenceRecord), ...session.evidenceRecords].slice(
          0,
          12,
        )
      : session.evidenceRecords;

    return ok(
      writeCachedSession({
        ...session,
        user: result.user ? mapUser(result.user) : session.user,
        tasks: session.tasks.map((task) =>
          task.id === taskId ? mapTask(result.task) : task,
        ),
        evidenceRecords,
        activePersona: result.catEvent.persona,
        catBubble: result.catEvent.message,
      }),
      "task_completed",
    );
  },

  async recordMood(
    session: AppSession,
    mood: string,
  ): Promise<ApiResponse<AppSession>> {
    const result = await request<RecordMoodResult>("/moods/checkins", {
      method: "POST",
      body: JSON.stringify({ mood }),
    });
    const manor = await request<BackendManorState>("/manor");
    const moodResponse = result.moodResponse ?? createMoodResponse(
      result.mood.label,
      result.catEvent.message,
      result.catEvent.persona,
    );

    return ok(
      writeCachedSession({
        ...session,
        selectedMood: result.mood.label,
        moods: mapMoods(result.moods),
        moodResponse,
        manor,
        activePersona: result.catEvent.persona,
        catBubble: result.catEvent.message,
      }),
      "mood_recorded",
    );
  },

  async completeMoodSupportAction(
    session: AppSession,
    actionId: MoodSupportAction["id"],
  ): Promise<ApiResponse<AppSession>> {
    const result = await request<CompleteMoodSupportResult>(
      `/moods/support-actions/${actionId}`,
      { method: "POST" },
    );
    const evidenceRecords = result.evidenceRecord
      ? [mapEvidence(result.evidenceRecord), ...session.evidenceRecords].slice(
          0,
          12,
        )
      : session.evidenceRecords;

    return ok(
      writeCachedSession({
        ...session,
        user: result.user ? mapUser(result.user) : session.user,
        evidenceRecords,
        activePersona: result.catEvent.persona,
        catBubble: result.catEvent.message,
      }),
      "mood_support_completed",
    );
  },

  async purchaseShopItem(
    session: AppSession,
    itemId: ShopItem["id"],
  ): Promise<ApiResponse<AppSession>> {
    const result = await request<PurchaseShopItemResult>(
      `/shop/items/${itemId}/purchase`,
      { method: "POST" },
    );
    const manor = await request<BackendManorState>("/manor");
    const evidenceRecords = result.evidenceRecord
      ? [mapEvidence(result.evidenceRecord), ...session.evidenceRecords].slice(
          0,
          12,
        )
      : session.evidenceRecords;

    return ok(
      writeCachedSession({
        ...session,
        user: result.user ? mapUser(result.user) : session.user,
        manor,
        purchasedItemIds: result.purchasedItemIds,
        evidenceRecords,
        activePersona: result.catEvent.persona,
        catBubble: result.catEvent.message,
      }),
      "shop_item_purchased",
    );
  },

  async updateManorBuilding(
    session: AppSession,
    buildingId: string,
    payload: { positionX?: number; positionY?: number; level?: number },
  ): Promise<ApiResponse<AppSession>> {
    const manor = await request<BackendManorState>(`/manor/buildings/${buildingId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    return ok(
      writeCachedSession({
        ...session,
        manor,
        catBubble: "庄园布局已保存，换设备也能恢复这片小天地。",
      }),
      "manor_building_updated",
    );
  },

  async submitChat(
    session: AppSession,
    text: string,
  ): Promise<ApiResponse<AppSession>> {
    const trimmed = text.trim();
    if (!trimmed) return ok(session);

    const result = await request<BackendChatResult>("/ai/chat", {
      method: "POST",
      body: JSON.stringify({
        text: trimmed,
        provider: session.preferences.provider,
        model: session.preferences.aiModel,
        responseMode: session.preferences.responseMode,
      }),
    });
    const userMessage: ChatMessage = {
      id: nextChatId(session.chatMessages),
      role: "user",
      text: trimmed,
    };
    const catMessage: ChatMessage = {
      id: userMessage.id + 1,
      role: "cat",
      persona: result.persona,
      text: result.quota
        ? `${result.message}\n\n今日${result.quota.label}剩余额度：${result.quota.remaining}/${result.quota.limit}`
        : result.message,
    };
    const catBubble = catMessage.text;

    return ok(
      writeCachedSession({
        ...session,
        activePersona: result.persona,
        catBubble,
        chatMessages: [...session.chatMessages, userMessage, catMessage].slice(
          -6,
        ),
      }),
      "chat_submitted",
    );
  },

  async deleteSession(): Promise<ApiResponse<AppSession>> {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(SESSION_CACHE_KEY);
    return ok(initialSession, "session_reset");
  },
};
