import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TextCreateDto {
    @IsString()
    @ApiProperty()
    title: string;

    @IsString()
    @ApiProperty()
    content: string;

    @IsString()
    @ApiProperty()
    level: string;

    @IsOptional()
    @IsUUID()
    @ApiPropertyOptional()
    quizId?: string;

    @IsOptional()
    @IsUUID()
    @ApiPropertyOptional()
    vocabularyTopicId?: string;
}
