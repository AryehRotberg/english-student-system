import { IsOptional, IsString, IsUUID } from 'class-validator';

export class GetWritingSubmissionsFilterDto {
    @IsOptional()
    @IsUUID()
    @IsString()
    userId?: string;

    @IsOptional()
    @IsUUID()
    @IsString()
    taskId?: string;
}