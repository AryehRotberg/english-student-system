import { IsIn, IsOptional, IsUUID } from 'class-validator';

export class CreateAssignmentItemDto {
    @IsUUID()
    assignmentId: string;

    @IsIn(['quiz', 'text', 'writing', 'vocabulary'])
    contentType: 'quiz' | 'text' | 'writing' | 'vocabulary';

    @IsUUID()
    @IsOptional()
    contentId?: string;

    @IsIn(['assigned', 'completed'])
    status: 'assigned' | 'completed';
}
