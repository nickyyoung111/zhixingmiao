import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator'

export class GuestSessionDto {
  @IsOptional()
  @IsUUID()
  userId?: string

  @IsOptional()
  @IsString()
  @MaxLength(50)
  nickname?: string
}