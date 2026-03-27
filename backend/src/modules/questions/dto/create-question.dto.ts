import { IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuestionDto {
    @IsString()
    @ApiProperty()
    question: string;

    @IsString()
    @ApiProperty()
    questionType: string;

    @IsOptional()
    @IsUrl()
    @ApiPropertyOptional()
    audioUrl?: string;
}