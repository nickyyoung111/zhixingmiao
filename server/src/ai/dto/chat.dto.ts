import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator'

export class ChatDto {
  @IsString()
  @MaxLength(1000)
  text!: string

  @IsOptional()
  @IsIn(['mock', 'deepseek', 'qwen'])
  provider?: 'mock' | 'deepseek' | 'qwen'

  @IsOptional()
  @IsIn(['deepseek-chat', 'deepseek-reasoner', 'qwen-plus'])
  model?: 'deepseek-chat' | 'deepseek-reasoner' | 'qwen-plus'

  @IsOptional()
  @IsIn(['brief', 'detailed'])
  responseMode?: 'brief' | 'detailed'
}