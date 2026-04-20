import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class VocabularyCreateDto {
    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    word?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    meaning?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    example?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    translation?: string;
}
