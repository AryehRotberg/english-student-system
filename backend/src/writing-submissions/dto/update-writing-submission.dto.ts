import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateWritingSubmissionDto {
    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    feedback?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @ApiPropertyOptional()
    score?: number;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    @ApiPropertyOptional()
    reviewedAt?: Date;
}