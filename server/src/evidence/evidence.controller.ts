import { Controller, Get, Headers, Inject } from '@nestjs/common'

import { readGuestUserId } from '../auth/guest-token.js'
import { ok } from '../common/api-response.js'
import { EvidenceService } from './evidence.service.js'

@Controller('evidence-records')
export class EvidenceController {
  constructor(@Inject(EvidenceService) private readonly evidenceService: EvidenceService) {}

  @Get()
  async list(
    @Headers('authorization') authorization?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const userId = readGuestUserId(authorization, userIdHeader)
    const result = await this.evidenceService.getRecords(userId)
    return ok(result, 'evidence_records_loaded')
  }

  @Get('summary')
  async summary(
    @Headers('authorization') authorization?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const userId = readGuestUserId(authorization, userIdHeader)
    const result = await this.evidenceService.getSummary(userId)
    return ok(result, 'evidence_summary_loaded')
  }
}
