import type { HabitTemplate, Task } from '../types/app'

export function planHabitTasks(template: HabitTemplate): Array<Omit<Task, 'id'>> {
  return [
    {
      title: `第 1 天：${template.tinyAction}`,
      area: template.area,
      energy: template.energy,
      done: false,
      dueLabel: '今天',
    },
    {
      title: `第 2 天：重复「${template.title}」并记录感受`,
      area: template.area,
      energy: template.energy,
      done: false,
      dueLabel: '明天',
    },
    {
      title: `第 3 天：完成后领取「${template.reward}」`,
      area: template.area,
      energy: template.energy,
      done: false,
      dueLabel: '本周',
    },
  ]
}
