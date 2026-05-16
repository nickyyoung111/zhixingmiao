export type Goal = {
  id: string | number
  title: string
  horizon: '本周' | '本月' | '本学期'
  reason: string
  progress: number
  createdAt: string
}
