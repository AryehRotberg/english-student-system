import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class VocabularyTopicUpdateDto {
    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    topic?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    description?: string;
}
