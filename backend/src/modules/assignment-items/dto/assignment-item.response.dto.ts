import { ApiProperty } from '@nestjs/swagger';

export class AssignmentItemResponseDto {
    @ApiProperty()
    readonly id: string;
    @ApiProperty()
    readonly assignmentId: string;
    @ApiProperty()
    readonly assignmentTitle: string;
    @ApiProperty()
    readonly assignmentDescription: string;
    @ApiProperty({ nullable: true })
    readonly assignmentDueDate: string | null;
    @ApiProperty()
    readonly contentId: string;
    @ApiProperty()
    readonly contentType: string;
    @ApiProperty()
    readonly isCompleted: boolean;
    @ApiProperty()
    readonly title: string;
}
