import { IsString, IsUUID } from 'class-validator';

export class CreateWritingSubmissionDto {
    @IsUUID()
    taskId: string;

    @IsUUID()
    userId: string;

    @IsString()
    content: string;
}