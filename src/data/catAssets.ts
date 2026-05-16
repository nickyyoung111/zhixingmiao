import zhixingCat from '../assets/cats/zhixing.png'
import zhixingCozyCat from '../assets/cats/zhixing-cozy.png'
import zhixingWinkCat from '../assets/cats/zhixing-wink.png'
import encourageCat from '../assets/cats/encourage.jpg'
import comfortCat from '../assets/cats/comfort.jpg'
import type { CatPersona } from '../types/app'

export const catAssets: Record<CatPersona, { name: string; title: string; image: string; tone: string; state: string }> = {
  zhixing: {
    name: '知行喵',
    title: 'AI 成长伙伴',
    image: zhixingCat,
    tone: '我在旁边陪你拆任务、看状态、慢慢往前走。',
    state: '拆解中',
  },
  encourage: {
    name: '鼓励喵',
    title: '行动助推官',
    image: encourageCat,
    tone: '做到了就庆祝，受挫了也先帮你把下一步点亮。',
    state: '鼓励中',
  },
  comfort: {
    name: '安慰喵',
    title: '情绪安放员',
    image: comfortCat,
    tone: '难受的时候，任务先放轻一点，我先接住你。',
    state: '陪伴中',
  },
}

export { zhixingCat, zhixingCozyCat, zhixingWinkCat, encourageCat, comfortCat }
