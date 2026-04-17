import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
