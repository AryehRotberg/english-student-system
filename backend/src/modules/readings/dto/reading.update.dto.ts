import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ReadingUpdateDto {
    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    title?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    content?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    level?: string;

    @IsOptional()
    @IsUUID()
    @ApiPropertyOptional()
    quizId?: string | null;

    @IsOptional()
    @IsUUID()
    @ApiPropertyOptional()
    vocabularyTopicId?: string | null;
}
