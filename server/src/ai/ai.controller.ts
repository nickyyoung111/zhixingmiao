import { Body, Controller, Get, Headers, Inject, Post } from '@nestjs/common'

import { readGuestUserId } from '../auth/guest-token.js'
import { ok } from '../common/api-response.js'
import { AiService } from './ai.service.js'
import { ChatDto } from './dto/chat.dto.js'

@Controller('ai')
export class AiController {
  constructor(@Inject(AiService) private readonly aiService: AiService) {}

  @Post('chat')
  async chat(
    @Body() dto: ChatDto,
    @Headers('authorization') authorization?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const userId = readGuestUserId(authorization, userIdHeader)
    const result = await this.aiService.chat(dto.text, dto.provider, dto.model, dto.responseMode, userId)
    return ok(result, 'ai_chat_completed')
  }

  @Get('chat/history')
  async history(
    @Headers('authorization') authorization?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const userId = readGuestUserId(authorization, userIdHeader)
    const result = await this.aiService.getRecentMessages(userId)
    return ok(result, 'ai_chat_history_loaded')
  }
}