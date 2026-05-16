import { Body, Controller, Inject, Post } from '@nestjs/common'

import { ok } from '../common/api-response.js'
import { AuthService } from './auth.service.js'
import { GuestSessionDto } from './dto/guest-session.dto.js'

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post('guest')
  async guest(@Body() dto: GuestSessionDto) {
    const session = await this.authService.createOrRestoreGuestSession(dto)
    return ok(session)
  }
}