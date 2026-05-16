import type { ActiveHabit, ActivityChallenge, AppSession, Goal, GrowthEvidence, HabitTemplate, ManorState, MoodRecord, MoodResponse, MoodSupportAction, ScenarioPractice, ShopItem, SpecialMission, Task, ToolCard, UserProfile } from '../types/app'

export const mockUser: UserProfile = {
  name: '体验用户',
  level: 3,
  title: '成长练习生',
  streakDays: 7,
  fishCount: 26,
}

export const initialTasks: Task[] = [
  { id: 1, title: '完成今日三件事规划', area: '自我管理', energy: '低能量', done: true, dueLabel: '今天' },
  { id: 2, title: '写 20 分钟学习复盘', area: '学习成长', energy: '中能量', done: false, dueLabel: '今晚' },
  { id: 3, title: '给同伴发送一句鼓励', area: '社会情感', energy: '低能量', done: false, dueLabel: '今天' },
  { id: 4, title: '整理一次志愿活动记录', area: '实践体验', energy: '高能量', done: false, dueLabel: '本周' },
]

export const initialGoals: Goal[] = [
  {
    id: 1,
    title: '建立稳定的学习复盘习惯',
    horizon: '本月',
    reason: '减少临时抱佛脚，让每天的成长有记录。',
    progress: 35,
    createdAt: '2026-05-15',
  },
]

export const habitTemplates: HabitTemplate[] = [
  {
    id: 'study-review',
    title: '学习复盘 10 分钟',
    area: '学习成长',
    cue: '晚饭后打开笔记',
    tinyAction: '写下今天学到的 3 个关键词',
    reward: '给自己记 1 条成长证据',
    energy: '低能量',
  },
  {
    id: 'body-wakeup',
    title: '身体唤醒 5 分钟',
    area: '自我管理',
    cue: '起床后喝水前',
    tinyAction: '做 3 组伸展或原地走动',
    reward: '点亮庄园里的晨光',
    energy: '低能量',
  },
  {
    id: 'kind-message',
    title: '给同伴一句鼓励',
    area: '社会情感',
    cue: '午休前看一眼联系人',
    tinyAction: '发出一句真诚感谢或鼓励',
    reward: '获得 1 枚友善小鱼干',
    energy: '低能量',
  },
  {
    id: 'practice-log',
    title: '实践记录快照',
    area: '实践体验',
    cue: '活动结束当天',
    tinyAction: '记录时间、地点、收获各一句',
    reward: '生成一条成长档案素材',
    energy: '中能量',
  },
]

export const initialHabits: ActiveHabit[] = [
  {
    id: 1,
    templateId: 'study-review',
    title: '学习复盘 10 分钟',
    streak: 2,
    createdAt: '2026-05-15',
  },
]

export const initialMoods: MoodRecord[] = [
  { id: 1, label: '平静', intensity: 4, note: '适合做低到中能量任务' },
  { id: 2, label: '开心', intensity: 7, note: '可以安排一点挑战任务' },
  { id: 3, label: '焦虑', intensity: 6, note: '先拆小步，减少压迫感' },
]

export const initialEvidenceRecords: GrowthEvidence[] = [
  {
    id: 1,
    title: '完成今日三件事规划',
    category: '行动完成',
    note: '把今天要做的事先放到可执行的位置。',
    createdAt: '2026-05-15',
    fishEarned: 1,
  },
  {
    id: 2,
    title: '记录平静状态',
    category: '情绪照顾',
    note: '能看见自己的状态，也是成长证据。',
    createdAt: '2026-05-15',
    fishEarned: 0,
  },
]

export const moodOptions = ['开心', '平静', '焦虑', '难过', '生气', '沮丧但想继续']

export const initialMoodResponse: MoodResponse = {
  mood: '平静',
  persona: 'zhixing',
  companionLine: '平静很适合稳稳推进，先做一个低压力的小任务。',
  recommendedEnergy: '低能量',
  manorTheme: 'warm',
  manorHint: '情绪池塘保持清澈，庄园适合慢慢推进。',
  supportActionIds: ['tiny-step', 'breathe'],
}

export const specialMissions: SpecialMission[] = [
  {
    id: 'weekly-actions',
    title: '周末大挑战',
    description: '完成 3 个成长单元，解锁额外小鱼干。',
    target: 3,
    unit: '个单元',
    rewardLabel: '+12 小鱼干',
    expiresIn: '2 天',
    tone: 'mango',
  },
  {
    id: 'daily-action',
    title: '每日特别任务',
    description: '先完成 1 个低门槛行动，让今天顺起来。',
    target: 1,
    unit: '个行动',
    rewardLabel: '+3 小鱼干',
    expiresIn: '3 小时',
    tone: 'mint',
  },
  {
    id: 'habit-starter',
    title: '习惯启动礼盒',
    description: '开启 1 个习惯模板，获得连续行动计划。',
    target: 1,
    unit: '个习惯',
    rewardLabel: '习惯徽章',
    expiresIn: '今日',
    tone: 'sky',
  },
]

export const shopItems: ShopItem[] = [
  {
    id: 'sunflower',
    title: '向阳花圃',
    description: '把今日完成感种进庄园角落。',
    cost: 12,
    category: '庄园装饰',
    effect: '庄园出现一片向阳花圃',
    tone: 'mango',
  },
  {
    id: 'cozy-lamp',
    title: '暖光小灯',
    description: '低落时点亮一盏温柔的小灯。',
    cost: 8,
    category: '情绪道具',
    effect: '安慰喵获得暖光陪伴提示',
    tone: 'sky',
  },
  {
    id: 'calm-stone',
    title: '平静石径',
    description: '为焦虑时刻铺一段慢慢走的路。',
    cost: 10,
    category: '情绪道具',
    effect: '情绪池塘旁出现平静石径',
    tone: 'mint',
  },
  {
    id: 'study-banner',
    title: '学习旗帜',
    description: '纪念一次认真完成的学习行动。',
    cost: 15,
    category: '喵咪小物',
    effect: '学习塔升起一面小旗帜',
    tone: 'mango',
  },
]

export const initialManor: ManorState = {
  buildings: [
    {
      id: 'mock-study-tower',
      type: 'study-tower',
      label: '学习塔',
      variant: 'core',
      level: 1,
      positionX: 20,
      positionY: 52,
      unlockedAt: '2026-05-15T00:00:00.000Z',
    },
    {
      id: 'mock-mood-pond',
      type: 'mood-pond',
      label: '情绪池塘',
      variant: 'core',
      level: 1,
      positionX: 72,
      positionY: 66,
      unlockedAt: '2026-05-15T00:00:00.000Z',
    },
    {
      id: 'mock-knowledge-garden',
      type: 'knowledge-garden',
      label: '知识菜园',
      variant: 'core',
      level: 1,
      positionX: 45,
      positionY: 70,
      unlockedAt: '2026-05-15T00:00:00.000Z',
    },
  ],
  vitality: 62,
  moodTone: '平静',
  theme: 'warm',
  updatedAt: '2026-05-15T00:00:00.000Z',
}

export const moodSupportActions: MoodSupportAction[] = [
  {
    id: 'breathe',
    title: '一分钟呼吸',
    description: '先把注意力放回身体，暂时不用解决所有问题。',
    resultMessage: '我们先一起慢慢呼吸一分钟，任务可以等你稳一点再开始。',
    persona: 'comfort',
    rewardFish: 1,
    tone: 'sky',
  },
  {
    id: 'tiny-step',
    title: '找一个小台阶',
    description: '把当前压力拆成一个 5 分钟内能做的小动作。',
    resultMessage: '很好，先找一个 5 分钟的小台阶。完成它，就是今天重新启动的证据。',
    persona: 'zhixing',
    rewardFish: 1,
    tone: 'mint',
  },
  {
    id: 'self-kindness',
    title: '给自己一句好话',
    description: '把批评换成一句能继续走下去的话。',
    resultMessage: '你已经在努力照顾自己了。先把这句话收下：我可以慢一点，但我没有停下。',
    persona: 'comfort',
    rewardFish: 1,
    tone: 'mango',
  },
]

export const scenarioPractices: ScenarioPractice[] = [
  {
    id: 'ask-help',
    title: '向同伴求助',
    situation: '遇到不会的问题，但又担心打扰别人。',
    firstLine: '我卡在这里有点久了，你方便听我说一分钟吗？',
    persona: 'zhixing',
    rewardFish: 2,
  },
  {
    id: 'say-no',
    title: '温和拒绝',
    situation: '别人提出请求，但你今天已经没有精力。',
    firstLine: '谢谢你想到我，但我今天需要先完成自己的安排。',
    persona: 'comfort',
    rewardFish: 2,
  },
  {
    id: 'after-setback',
    title: '受挫后复盘',
    situation: '一次任务没有做好，想重新找回下一步。',
    firstLine: '这次不理想，但我想先找一个可以改进的小点。',
    persona: 'encourage',
    rewardFish: 2,
  },
]

export const activityChallenges: ActivityChallenge[] = [
  {
    id: 'volunteer-spark',
    title: '一次微志愿观察',
    area: '实践体验',
    description: '找一个身边能帮到人的小场景，不需要很大。',
    tinyStep: '记录一个你愿意帮忙的具体位置或对象',
    duration: '10 分钟',
    rewardFish: 3,
    tone: 'mint',
  },
  {
    id: 'campus-helper',
    title: '校园小帮手',
    area: '社会情感',
    description: '给同学、老师或社团提供一次轻量协助。',
    tinyStep: '发出一句“我可以帮你做哪一小步？”',
    duration: '15 分钟',
    rewardFish: 3,
    tone: 'sky',
  },
  {
    id: 'reflection-note',
    title: '实践复盘便签',
    area: '学习成长',
    description: '把一次活动的收获沉淀成成长档案素材。',
    tinyStep: '写下时间、行动、收获各一句',
    duration: '8 分钟',
    rewardFish: 2,
    tone: 'mango',
  },
]

export const exploreTools: ToolCard[] = [
  { id: 'goal', title: '目标工坊', description: 'AI 帮你把长期目标拆成今日行动，并预留目标、里程碑、任务三层数据。', status: '可体验' },
  { id: 'habit', title: '习惯图书馆', description: '从学习、运动、表达、志愿中选择模板，后续接 habit_templates 表。', status: '可体验' },
  { id: 'scenario', title: '情景训练舱', description: '用低压力对话练习沟通和协作，后续接大模型角色扮演。', status: '可体验' },
  { id: 'activity', title: '活动广场', description: '为实践体验、志愿时长和校园活动匹配预留入口。', status: '可体验' },
]

export const initialSession: AppSession = {
  isSignedIn: false,
  user: mockUser,
  preferences: {
    motionEnabled: true,
    quietMode: false,
    provider: 'mock',
    aiModel: 'deepseek-chat',
    responseMode: 'brief',
  },
  goals: initialGoals,
  habits: initialHabits,
  claimedMissionIds: [],
  purchasedItemIds: [],
  joinedActivityIds: [],
  evidenceRecords: initialEvidenceRecords,
  manor: initialManor,
  shopItems,
  tasks: initialTasks,
  moods: initialMoods,
  moodResponse: initialMoodResponse,
  selectedMood: '平静',
  activePersona: 'zhixing',
  catBubble: '早上好，我已经把今日成长驾驶舱准备好啦。',
  chatMessages: [
    { id: 1, role: 'cat', persona: 'zhixing', text: '今天先从一个能完成的小动作开始，好不好？' },
  ],
}
