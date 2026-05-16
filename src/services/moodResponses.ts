import type { CatPersona, MoodResponse } from "../types/app";

type MoodResponseProfile = Omit<MoodResponse, "mood" | "companionLine" | "persona"> & {
  persona: CatPersona;
  companionLine: string;
};

const moodResponseProfiles: Record<string, MoodResponseProfile> = {
  开心: {
    persona: "encourage",
    companionLine: "这份开心很珍贵，我们把它变成一个轻快的小行动。",
    recommendedEnergy: "中能量",
    manorTheme: "bright",
    manorHint: "阳光会更亮一点，适合让学习塔和花园一起发光。",
    supportActionIds: ["tiny-step", "self-kindness"],
  },
  平静: {
    persona: "zhixing",
    companionLine: "平静很适合稳稳推进，先做一个低压力的小任务。",
    recommendedEnergy: "低能量",
    manorTheme: "warm",
    manorHint: "情绪池塘保持清澈，庄园适合慢慢推进。",
    supportActionIds: ["tiny-step", "breathe"],
  },
  焦虑: {
    persona: "comfort",
    companionLine: "我看见你的焦虑了，先把事情拆小，不急着一次解决全部。",
    recommendedEnergy: "低能量",
    manorTheme: "calm",
    manorHint: "池塘会放慢流动，先给焦虑留一段缓冲。",
    supportActionIds: ["breathe", "tiny-step"],
  },
  难过: {
    persona: "comfort",
    companionLine: "难过的时候先照顾自己，今天的任务可以降到很小很小。",
    recommendedEnergy: "低能量",
    manorTheme: "comfort",
    manorHint: "庄园会收起强光，暖光小灯会更适合陪你待一会儿。",
    supportActionIds: ["self-kindness", "breathe"],
  },
  生气: {
    persona: "comfort",
    companionLine: "生气说明你在意边界，我们先缓一口气，再决定下一步。",
    recommendedEnergy: "低能量",
    manorTheme: "focus",
    manorHint: "庄园会把注意力收束到边界和呼吸上。",
    supportActionIds: ["breathe", "self-kindness"],
  },
  沮丧但想继续: {
    persona: "encourage",
    companionLine: "还能说出想继续，就已经很不容易。我们从一个 5 分钟小台阶开始。",
    recommendedEnergy: "低能量",
    manorTheme: "comfort",
    manorHint: "暖光会贴近路边，提醒你继续一点点就够。",
    supportActionIds: ["tiny-step", "self-kindness"],
  },
};

function fallbackMoodResponse(mood: string): MoodResponseProfile {
  return {
    persona: "zhixing",
    companionLine: "状态已记录，我们按现在真实的节奏来。",
    recommendedEnergy: "低能量",
    manorTheme: "warm",
    manorHint: `${mood || "现在"}已经被记录，庄园会按你的节奏回应。`,
    supportActionIds: ["breathe", "tiny-step"],
  };
}

export function createMoodResponse(
  mood: string,
  companionLine?: string,
  persona?: CatPersona,
): MoodResponse {
  const profile = moodResponseProfiles[mood] ?? fallbackMoodResponse(mood);

  return {
    mood,
    persona: persona ?? profile.persona,
    companionLine: companionLine ?? profile.companionLine,
    recommendedEnergy: profile.recommendedEnergy,
    manorTheme: profile.manorTheme,
    manorHint: profile.manorHint,
    supportActionIds: profile.supportActionIds,
  };
}
