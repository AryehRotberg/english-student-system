import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WritingSubmissionFilterDto {
    @IsOptional()
    @IsUUID()
    @IsString()
    @ApiPropertyOptional()
    userId?: string;

    @IsOptional()
    @IsUUID()
    @IsString()
    @ApiPropertyOptional()
    taskId?: string;
}