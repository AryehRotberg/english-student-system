import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VocabularyTopicCreateDto {
    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    topic?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    description?: string;
}
