import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateTaskDto {
  @IsString()
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  area?: string;

  @IsOptional()
  @IsIn(["low", "medium", "high"])
  energyLevel?: "low" | "medium" | "high";

  @IsOptional()
  @IsString()
  @MaxLength(20)
  dueLabel?: string;
}
