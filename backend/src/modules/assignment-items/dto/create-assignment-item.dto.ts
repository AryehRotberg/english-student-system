import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAssignmentItemDto {
    @IsUUID()
    @ApiProperty()
    assignmentId: string;

    @IsIn(['quiz', 'text', 'writing', 'vocabulary'])
    @ApiProperty()
    contentType: 'quiz' | 'text' | 'writing' | 'vocabulary';

    @IsUUID()
    @IsOptional()
    @ApiPropertyOptional()
    contentId?: string;
}
