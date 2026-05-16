import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator'

export class UpdateGoalDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string

  @IsOptional()
  @IsString()
  @MaxLength(30)
  category?: string

  @IsOptional()
  @IsIn(['week', 'month', 'semester'])
  horizon?: 'week' | 'month' | 'semester'

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progress?: number

  @IsOptional()
  @IsIn(['active', 'paused', 'archived'])
  status?: 'active' | 'paused' | 'archived'
}
