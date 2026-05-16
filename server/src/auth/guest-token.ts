import { UnauthorizedException } from '@nestjs/common'

export function readGuestUserId(authorization?: string, explicitUserId?: string) {
  if (explicitUserId) {
    return explicitUserId
  }

  const [scheme, token] = authorization?.split(' ') ?? []
  if (scheme?.toLowerCase() !== 'bearer' || !token?.startsWith('guest:')) {
    throw new UnauthorizedException('缺少游客会话，请先调用 /auth/guest')
  }

  return token.slice('guest:'.length)
}