import 'reflect-metadata'

import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module.js'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const config = app.get(ConfigService)
  const frontendOrigin = config.get<string>('FRONTEND_ORIGIN') ?? 'http://localhost:5173'
  const port = Number(config.get<string>('PORT') ?? config.get<string>('API_PORT') ?? 3001)

  app.setGlobalPrefix('api/v1')
  app.enableCors({
    origin: frontendOrigin,
    credentials: true,
  })
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )

  await app.listen(port, '0.0.0.0')
  console.log(`Zhixing Miao API listening on http://localhost:${port}/api/v1`)
}

void bootstrap()