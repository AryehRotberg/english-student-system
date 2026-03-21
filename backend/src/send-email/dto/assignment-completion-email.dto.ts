import { IsUUID } from 'class-validator';

export class AssignmentCompletionEmailDto {
    @IsUUID()
    attemptId: string;
}
