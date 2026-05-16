import type { RouteResult } from '../types/app'

type SignalGroup = {
  weight: number
  terms: string[]
}

const crisisTerms = [
  '不想活',
  '伤害自己',
  '自杀',
  '撑不下去',
  '活不下去',
  '结束生命',
  '想消失',
]

const comfortSignals: SignalGroup[] = [
  {
    weight: 4,
    terms: ['焦虑', '难过', '伤心', '想哭', '崩溃', '孤独', '委屈', '低落', '生气', '愤怒', '烦躁', '压力'],
  },
  {
    weight: 3,
    terms: ['提不起劲', '心里堵', '喘不过气', '睡不着', '很累', '好累', '麻木', '空空的', '没力气', '快顶不住'],
  },
  {
    weight: 2,
    terms: ['一团雾', '脑子很乱', '脑袋很乱', '乱糟糟', '不想动', '有点沉', '心慌', '害怕', '担心', '不安'],
  },
]

const encourageSignals: SignalGroup[] = [
  {
    weight: 4,
    terms: ['开心', '高兴', '成功', '完成', '做完', '做到了', '进步', '通过了', '拿到了'],
  },
  {
    weight: 3,
    terms: ['继续', '坚持', '保持', '努力', '再来', '想再做', '还想做', '有动力', '有点成就感'],
  },
  {
    weight: 2,
    terms: ['失败了但', '没做好但', '受挫但', '沮丧但', '还是想', '不想放弃', '想翻盘'],
  },
]

const zhixingSignals: SignalGroup[] = [
  {
    weight: 4,
    terms: ['不知道从哪开始', '不知道先做什么', '怎么开始', '怎么安排', '怎么规划', '如何规划', '帮我拆', '拆解'],
  },
  {
    weight: 3,
    terms: ['计划', '目标', '任务', '复习', '学习', '比赛', '项目', '简历', '面试', '时间安排'],
  },
  {
    weight: 2,
    terms: ['先做什么', '下一步', '优先级', '太多事', '理一下', '梳理', '整理思路'],
  },
]

function normalize(text: string) {
  return text.toLowerCase().replace(/\s+/g, '')
}

function scoreSignals(text: string, signalGroups: SignalGroup[]) {
  return signalGroups.reduce((score, group) => {
    const hits = group.terms.filter((term) => text.includes(term.toLowerCase()))
    return score + hits.length * group.weight
  }, 0)
}

function hasAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term.toLowerCase()))
}

export function routePersona(text: string): RouteResult {
  const normalized = normalize(text)

  if (hasAny(normalized, crisisTerms)) {
    return {
      persona: 'comfort',
      priority: 'comfort_first',
      riskLevel: 'crisis',
      message: '我先陪你稳住这一刻。请立刻联系身边可信任的人，或当地紧急援助热线；你不用一个人扛着。',
    }
  }

  const comfortScore = scoreSignals(normalized, comfortSignals)
  const encourageScore = scoreSignals(normalized, encourageSignals)
  const zhixingScore = scoreSignals(normalized, zhixingSignals)
  const hasComfort = comfortScore >= 2
  const hasEncourage = encourageScore >= 2
  const hasZhixing = zhixingScore >= 2

  if (hasComfort && hasEncourage) {
    return {
      persona: 'comfort',
      followUpPersona: 'encourage',
      priority: 'comfort_first',
      riskLevel: 'normal',
      message: '我先让安慰喵出来陪你缓一缓，然后再轻轻把你带回一个能完成的小动作。',
    }
  }

  if (hasComfort && hasZhixing) {
    return {
      persona: 'comfort',
      followUpPersona: 'zhixing',
      priority: 'comfort_first',
      riskLevel: 'normal',
      message: '我先让安慰喵接住这份压力，再帮你把事情拆成很小的一步。',
    }
  }

  if (comfortScore >= Math.max(encourageScore, zhixingScore) && hasComfort) {
    return {
      persona: 'comfort',
      priority: 'normal',
      riskLevel: 'normal',
      message: '检测到你可能有点难受，今天先降低任务压力，安慰喵陪你待一会儿。',
    }
  }

  if (encourageScore >= Math.max(comfortScore, zhixingScore) && hasEncourage) {
    return {
      persona: 'encourage',
      priority: 'normal',
      riskLevel: 'normal',
      message: '鼓励喵收到信号啦，我们把这股劲变成一个很小但确定的行动。',
    }
  }

  if (hasZhixing) {
    return {
      persona: 'zhixing',
      priority: 'normal',
      riskLevel: 'normal',
      message: '知行喵先陪你把事情理清楚，再拆成今天能启动的一小步。',
    }
  }

  return {
    persona: 'zhixing',
    priority: 'normal',
    riskLevel: 'normal',
    message: '知行喵先陪你梳理一下：现在最值得做的一步是什么？',
  }
}
