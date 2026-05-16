import { Controller, Get } from '@nestjs/common'

import { ok } from './common/api-response.js'

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return ok(
      {
        service: 'zhixing-miao-api',
        status: 'ok',
        checkedAt: new Date().toISOString(),
      },
      'health_ok',
    )
  }
}
