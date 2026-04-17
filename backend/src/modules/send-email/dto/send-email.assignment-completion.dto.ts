import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendEmailAssignmentCompletionDto {
    @IsUUID()
    @ApiProperty()
    attemptId: string;
}
