import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignmentCompletionEmailDto {
    @IsUUID()
    @ApiProperty()
    attemptId: string;
}
