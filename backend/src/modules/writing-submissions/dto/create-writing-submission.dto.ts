import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWritingSubmissionDto {
    @IsUUID()
    @ApiProperty()
    taskId: string;

    @IsUUID()
    @ApiProperty()
    userId: string;

    @IsString()
    @ApiProperty()
    content: string;
}