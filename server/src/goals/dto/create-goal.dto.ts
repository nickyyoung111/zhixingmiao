import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator'

export class CreateGoalDto {
  @IsString()
  @MaxLength(100)
  title!: string

  @IsOptional()
  @IsString()
  @MaxLength(30)
  category?: string

  @IsOptional()
  @IsIn(['week', 'month', 'semester'])
  horizon?: 'week' | 'month' | 'semester'
}
