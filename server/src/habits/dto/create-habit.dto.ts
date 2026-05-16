import { IsString, MaxLength } from 'class-validator'

export class CreateHabitDto {
  @IsString()
  @MaxLength(60)
  templateId!: string
}
