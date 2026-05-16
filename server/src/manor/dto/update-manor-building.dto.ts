import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator'

export class UpdateManorBuildingDto {
  @IsOptional()
  @IsNumber()
  @Min(4)
  @Max(96)
  positionX?: number

  @IsOptional()
  @IsNumber()
  @Min(6)
  @Max(94)
  positionY?: number

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(9)
  level?: number
}
