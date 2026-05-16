export type CatPersona = 'zhixing' | 'encourage' | 'comfort'

export type ChatMessage = {
  id: number
  role: 'user' | 'cat'
  text: string
  persona?: CatPersona
}

export type RouteResult = {
  persona: CatPersona
  followUpPersona?: CatPersona
  priority: 'comfort_first' | 'normal'
  message: string
  riskLevel: 'normal' | 'crisis'
}
