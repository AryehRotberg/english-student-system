import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class VocabularyUpdateDto {
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
