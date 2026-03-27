import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetWritingSubmissionsFilterDto {
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