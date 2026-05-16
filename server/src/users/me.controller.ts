import { Body, Controller, Get, Headers, Inject, Patch } from "@nestjs/common";
import { AiProvider } from "@prisma/client";

import { readGuestUserId } from "../auth/guest-token.js";
import { ok } from "../common/api-response.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { UpdatePreferencesDto } from "./dto/update-preferences.dto.js";

const providerMap: Record<
  NonNullable<UpdatePreferencesDto["provider"]>,
  AiProvider
> = {
  mock: AiProvider.MOCK,
  deepseek: AiProvider.DEEPSEEK,
  qwen: AiProvider.QWEN,
};

@Controller("me")
export class MeController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get()
  async me(
    @Headers("authorization") authorization?: string,
    @Headers("x-user-id") userIdHeader?: string,
  ) {
    const userId = readGuestUserId(authorization, userIdHeader);
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { preferences: true },
    });

    return ok(user);
  }

  @Patch("preferences")
  async updatePreferences(
    @Body() dto: UpdatePreferencesDto,
    @Headers("authorization") authorization?: string,
    @Headers("x-user-id") userIdHeader?: string,
  ) {
    const userId = readGuestUserId(authorization, userIdHeader);
    const data: {
      motionEnabled?: boolean;
      quietMode?: boolean;
      provider?: AiProvider;
    } = {};

    if (dto.motionEnabled !== undefined) data.motionEnabled = dto.motionEnabled;
    if (dto.quietMode !== undefined) data.quietMode = dto.quietMode;
    if (dto.provider !== undefined) data.provider = providerMap[dto.provider];

    await this.prisma.userPreferences.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { preferences: true },
    });

    return ok(user, "preferences_updated");
  }
}
