import { routeChatPersona } from "./chatRouter";
import { classifyChatWithProvider } from "./aiProviders";
import { planGoal } from "./goalPlanner";
import { planHabitTasks } from "./habitPlanner";
import { createMoodResponse } from "./moodResponses";
import {
  activityChallenges,
  habitTemplates,
  moodSupportActions,
  scenarioPractices,
  shopItems,
  specialMissions,
} from "../data/mockData";
import type {
  ActivityChallenge,
  AppSession,
  ChatMessage,
  EnergyLevel,
  GrowthEvidence,
  MoodSupportAction,
  ScenarioPractice,
  ShopItem,
  SpecialMission,
} from "../types/app";

function numericId(id: string | number) {
  return typeof id === "number" ? id : Number(id);
}

function nextId(items: { id: string | number }[]) {
  const numericIds = items
    .map((item) => numericId(item.id))
    .filter(Number.isFinite);
  return numericIds.length === 0 ? 1 : Math.max(...numericIds) + 1;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function prependEvidence(
  session: AppSession,
  evidence: Omit<GrowthEvidence, "id" | "createdAt">,
) {
  return [
    {
      ...evidence,
      id: nextId(session.evidenceRecords),
      createdAt: today(),
    },
    ...session.evidenceRecords,
  ].slice(0, 12);
}

const missionRewards: Record<SpecialMission["id"], number> = {
  "weekly-actions": 12,
  "daily-action": 3,
  "mood-check": 2,
  "habit-starter": 5,
};

export function toggleTask(
  session: AppSession,
  taskId: string | number,
): AppSession {
  const currentTask = session.tasks.find((task) => task.id === taskId);
  const willComplete = Boolean(currentTask && !currentTask.done);

  return {
    ...session,
    activePersona: "encourage",
    catBubble: willComplete
      ? "收到一个行动反馈，小鱼干先记账，下一步我们继续稳稳来。"
      : "任务状态已更新。没关系，我们按真实节奏记录就好。",
    user: {
      ...session.user,
      fishCount: willComplete
        ? session.user.fishCount + 1
        : session.user.fishCount,
    },
    evidenceRecords:
      currentTask && willComplete
        ? prependEvidence(session, {
            title: currentTask.title,
            category: "行动完成",
            note: `${currentTask.area} · ${currentTask.energy} · ${currentTask.dueLabel}`,
            fishEarned: 1,
          })
        : session.evidenceRecords,
    tasks: session.tasks.map((task) =>
      task.id === taskId ? { ...task, done: !task.done } : task,
    ),
  };
}

export function recordMood(session: AppSession, mood: string): AppSession {
  const route = routeChatPersona(mood);
  const moodResponse = createMoodResponse(mood, route.message, route.persona);

  return {
    ...session,
    selectedMood: mood,
    moodResponse,
    manor: {
      ...session.manor,
      moodTone: mood,
      theme: moodResponse.manorTheme,
      updatedAt: new Date().toISOString(),
    },
    activePersona: route.persona,
    catBubble: route.message,
    moods: [
      {
        id: nextId(session.moods),
        label: mood,
        intensity: route.persona === "comfort" ? 6 : 5,
        note: route.message,
      },
      ...session.moods,
    ].slice(0, 5),
  };
}

export function submitChat(session: AppSession, text: string): AppSession {
  const trimmed = text.trim();
  if (!trimmed) return session;

  const route = classifyChatWithProvider(session.preferences.provider, trimmed);
  const userMessage: ChatMessage = {
    id: nextId(session.chatMessages),
    role: "user",
    text: trimmed,
  };
  const catMessage: ChatMessage = {
    id: userMessage.id + 1,
    role: "cat",
    persona: route.persona,
    text: route.message,
  };

  return {
    ...session,
    activePersona: route.persona,
    catBubble: route.message,
    chatMessages: [...session.chatMessages, userMessage, catMessage].slice(-6),
  };
}

export function selectExploreTool(
  session: AppSession,
  toolId: string,
): AppSession {
  const toolRoutes: Record<
    string,
    Pick<AppSession, "activePersona" | "catBubble">
  > = {
    goal: {
      activePersona: "zhixing",
      catBubble:
        "目标工坊已打开：先告诉我一个大目标，我会帮你拆成今天能做的小行动。",
    },
    habit: {
      activePersona: "encourage",
      catBubble:
        "习惯图书馆准备好了，我们挑一个容易坚持的模板，先连续 3 天试试。",
    },
    scenario: {
      activePersona: "zhixing",
      catBubble: "情景训练舱已预热，后面这里会接入角色扮演式 AI 对话。",
    },
    activity: {
      activePersona: "encourage",
      catBubble: "活动广场已打开。选一个轻量实践活动，我会帮你放进今日任务里。",
    },
  };

  const route = toolRoutes[toolId] ?? toolRoutes.goal;

  return {
    ...session,
    ...route,
  };
}

export function createGoalPlan(
  session: AppSession,
  goalText: string,
): AppSession {
  const trimmed = goalText.trim();
  if (!trimmed) return session;

  const plan = planGoal(trimmed, session.preferences.provider);
  const goalId = nextId(session.goals);
  const taskStartId = nextId(session.tasks);
  const tasks = plan.tasks.map((task, index) => ({
    ...task,
    id: taskStartId + index,
  }));

  return {
    ...session,
    goals: [{ ...plan.goal, id: goalId }, ...session.goals].slice(0, 4),
    tasks: [...tasks, ...session.tasks].slice(0, 8),
    activePersona: "zhixing",
    catBubble:
      "目标已经拆成三步行动啦。先做第一个低能量任务，让启动成本小一点。",
    chatMessages: [
      ...session.chatMessages,
      {
        id: nextId(session.chatMessages),
        role: "user" as const,
        text: `我的目标：${trimmed}`,
      },
      {
        id: nextId(session.chatMessages) + 1,
        role: "cat" as const,
        persona: "zhixing" as const,
        text: "我把它拆成了 3 个今日/本周行动，已经放进任务列表。",
      },
    ].slice(-6),
  };
}

export function activateHabitTemplate(
  session: AppSession,
  templateId: string,
): AppSession {
  const template = habitTemplates.find((item) => item.id === templateId);
  if (!template) return session;

  const habitId = nextId(session.habits);
  const taskStartId = nextId(session.tasks);
  const tasks = planHabitTasks(template).map((task, index) => ({
    ...task,
    id: taskStartId + index,
  }));

  return {
    ...session,
    habits: [
      {
        id: habitId,
        templateId: template.id,
        title: template.title,
        streak: 0,
        createdAt: new Date().toISOString().slice(0, 10),
      },
      ...session.habits.filter((habit) => habit.templateId !== template.id),
    ].slice(0, 4),
    tasks: [...tasks, ...session.tasks].slice(0, 8),
    activePersona: "encourage",
    catBubble: `习惯「${template.title}」已经开启，我先帮你排好 3 天连续行动。`,
    chatMessages: [
      ...session.chatMessages,
      {
        id: nextId(session.chatMessages),
        role: "user" as const,
        text: `我想开始习惯：${template.title}`,
      },
      {
        id: nextId(session.chatMessages) + 1,
        role: "cat" as const,
        persona: "encourage" as const,
        text: `好呀，先从「${template.tinyAction}」开始，连续 3 天就很棒。`,
      },
    ].slice(-6),
  };
}

export function claimMissionReward(
  session: AppSession,
  missionId: SpecialMission["id"],
): AppSession {
  const mission = specialMissions.find((item) => item.id === missionId);
  if (!mission || session.claimedMissionIds.includes(missionId)) return session;

  const rewardCount = missionRewards[missionId];

  return {
    ...session,
    claimedMissionIds: [...session.claimedMissionIds, missionId],
    user: { ...session.user, fishCount: session.user.fishCount + rewardCount },
    evidenceRecords: prependEvidence(session, {
      title: mission.title,
      category: "奖励领取",
      note: `完成特别任务，${mission.rewardLabel} 到账。`,
      fishEarned: rewardCount,
    }),
    activePersona: "encourage",
    catBubble: `奖励领取成功：${mission.rewardLabel} 已放进你的成长背包。`,
    chatMessages: [
      ...session.chatMessages,
      {
        id: nextId(session.chatMessages),
        role: "cat" as const,
        persona: "encourage" as const,
        text: `完成「${mission.title}」啦，${mission.rewardLabel} 到账。`,
      },
    ].slice(-6),
  };
}

export function purchaseShopItem(
  session: AppSession,
  itemId: ShopItem["id"],
): AppSession {
  const item = shopItems.find((shopItem) => shopItem.id === itemId);
  if (!item || session.purchasedItemIds.includes(itemId)) return session;

  if (session.user.fishCount < item.cost) {
    return {
      ...session,
      activePersona: "comfort",
      catBubble: `还差 ${item.cost - session.user.fishCount} 条小鱼干才能兑换「${item.title}」。先完成一个轻任务，我们慢慢攒。`,
    };
  }

  return {
    ...session,
    purchasedItemIds: [...session.purchasedItemIds, itemId],
    user: { ...session.user, fishCount: session.user.fishCount - item.cost },
    activePersona: "encourage",
    catBubble: `兑换成功：「${item.title}」已加入成长庄园。${item.effect}。`,
    chatMessages: [
      ...session.chatMessages,
      {
        id: nextId(session.chatMessages),
        role: "cat" as const,
        persona: "encourage" as const,
        text: `你用 ${item.cost} 条小鱼干兑换了「${item.title}」，庄园更像你的成长空间了。`,
      },
    ].slice(-6),
  };
}

export function completeMoodSupportAction(
  session: AppSession,
  actionId: MoodSupportAction["id"],
): AppSession {
  const action = moodSupportActions.find((item) => item.id === actionId);
  if (!action) return session;

  return {
    ...session,
    user: {
      ...session.user,
      fishCount: session.user.fishCount + action.rewardFish,
    },
    evidenceRecords: prependEvidence(session, {
      title: action.title,
      category: "情绪照顾",
      note: action.description,
      fishEarned: action.rewardFish,
    }),
    activePersona: action.persona,
    catBubble: `${action.resultMessage} 小鱼干 +${action.rewardFish}，奖励你愿意照顾自己。`,
    chatMessages: [
      ...session.chatMessages,
      {
        id: nextId(session.chatMessages),
        role: "cat" as const,
        persona: action.persona,
        text: `你完成了「${action.title}」。${action.resultMessage}`,
      },
    ].slice(-6),
  };
}

export function startScenarioPractice(
  session: AppSession,
  practiceId: ScenarioPractice["id"],
): AppSession {
  const practice = scenarioPractices.find((item) => item.id === practiceId);
  if (!practice) return session;

  return {
    ...session,
    user: {
      ...session.user,
      fishCount: session.user.fishCount + practice.rewardFish,
    },
    evidenceRecords: prependEvidence(session, {
      title: practice.title,
      category: "沟通练习",
      note: practice.firstLine,
      fishEarned: practice.rewardFish,
    }),
    activePersona: practice.persona,
    catBubble: `情景训练开始：${practice.situation} 你可以先试这句：“${practice.firstLine}” 小鱼干 +${practice.rewardFish}。`,
    chatMessages: [
      ...session.chatMessages,
      {
        id: nextId(session.chatMessages),
        role: "cat" as const,
        persona: practice.persona,
        text: `我们练习「${practice.title}」。先从一句不费力的话开始：${practice.firstLine}`,
      },
    ].slice(-6),
  };
}

export function joinActivityChallenge(
  session: AppSession,
  activityId: ActivityChallenge["id"],
): AppSession {
  const activity = activityChallenges.find((item) => item.id === activityId);
  if (!activity) return session;

  if (session.joinedActivityIds.includes(activityId)) {
    return {
      ...session,
      activePersona: "encourage",
      catBubble: `「${activity.title}」已经在你的任务里了，先做最小一步：${activity.tinyStep}`,
    };
  }

  const taskEnergy: EnergyLevel = activity.duration.includes("15")
    ? "中能量"
    : "低能量";

  return {
    ...session,
    joinedActivityIds: [...session.joinedActivityIds, activityId],
    user: {
      ...session.user,
      fishCount: session.user.fishCount + activity.rewardFish,
    },
    evidenceRecords: prependEvidence(session, {
      title: activity.title,
      category: "实践体验",
      note: activity.tinyStep,
      fishEarned: activity.rewardFish,
    }),
    tasks: [
      {
        id: nextId(session.tasks),
        title: activity.tinyStep,
        area: activity.area,
        energy: taskEnergy,
        done: false,
        dueLabel: "本周",
      },
      ...session.tasks,
    ].slice(0, 8),
    activePersona: "encourage",
    catBubble: `已加入「${activity.title}」。我把最小一步放进任务列表，小鱼干 +${activity.rewardFish}。`,
    chatMessages: [
      ...session.chatMessages,
      {
        id: nextId(session.chatMessages),
        role: "cat" as const,
        persona: "encourage" as const,
        text: `你开启了「${activity.title}」。今天只要完成：${activity.tinyStep}`,
      },
    ].slice(-6),
  };
}
