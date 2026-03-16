import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateWritingSubmissionDto {
    @IsOptional()
    @IsString()
    feedback?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    score?: number;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    reviewedAt?: Date;
}