import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

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

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}
