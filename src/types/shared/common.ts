export type Page = 'home' | 'explore' | 'manor' | 'profile'

export type Tone = 'mango' | 'mint' | 'sky'

export type ApiResponse<T> = {
  ok: boolean
  data: T
  message?: string
}
