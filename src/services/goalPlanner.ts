import type { EnergyLevel, Goal, Task, UserPreferences } from '../types/app'

const areaKeywords: Array<{ area: string; words: string[] }> = [
  { area: '学习成长', words: ['学习', '考试', '论文', '课程', '复盘', '阅读', '英语', '编程'] },
  { area: '社会情感', words: ['沟通', '朋友', '同伴', '表达', '协作', '社交', '关系'] },
  { area: '实践体验', words: ['志愿', '活动', '实践', '比赛', '项目', '实习'] },
]

function inferArea(text: string) {
  return areaKeywords.find((item) => item.words.some((word) => text.includes(word)))?.area ?? '自我管理'
}

function providerSuffix(provider: UserPreferences['provider']) {
  if (provider === 'deepseek') return 'DeepSeek 占位拆解'
  if (provider === 'qwen') return '通义千问占位拆解'
  return 'Mock AI 拆解'
}

function taskTitle(goalText: string, index: number) {
  const normalized = goalText.trim().replace(/[。！？!?,，]/g, '')
  const base = normalized.length > 18 ? `${normalized.slice(0, 18)}...` : normalized
  const templates = [
    `写下“${base}”的成功标准`,
    `拆出“${base}”的第一个 20 分钟行动`,
    `为“${base}”设置一次复盘提醒`,
  ]
  return templates[index]
}

export function planGoal(goalText: string, provider: UserPreferences['provider']) {
  const trimmed = goalText.trim()
  const area = inferArea(trimmed)
  const goal: Omit<Goal, 'id'> = {
    title: trimmed,
    horizon: '本月',
    reason: `${providerSuffix(provider)}：先把目标变成能开始、能检查、能复盘的三步。`,
    progress: 0,
    createdAt: new Date().toISOString().slice(0, 10),
  }

  const tasks: Array<Omit<Task, 'id'>> = [0, 1, 2].map((index) => ({
    title: taskTitle(trimmed, index),
    area,
    energy: (index === 0 ? '低能量' : index === 1 ? '中能量' : '低能量') as EnergyLevel,
    done: false,
    dueLabel: index === 2 ? '本周' : '今天',
  }))

  return { goal, tasks }
}
