import { IsBoolean, IsIn, IsOptional } from "class-validator";

export class UpdatePreferencesDto {
  @IsOptional()
  @IsBoolean()
  motionEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  quietMode?: boolean;

  @IsOptional()
  @IsIn(["mock", "deepseek", "qwen"])
  provider?: "mock" | "deepseek" | "qwen";
}
