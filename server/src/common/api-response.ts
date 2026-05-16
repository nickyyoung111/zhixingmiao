export type ApiResponse<T> = {
  ok: boolean
  data: T
  message?: string
}

export function ok<T>(data: T, message?: string): ApiResponse<T> {
  return {
    ok: true,
    data,
    message,
  }
}