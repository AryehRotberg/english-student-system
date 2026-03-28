import { AssignmentItem } from '../entities/assignment-item.entity';
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
    readonly status: 'assigned' | 'completed';
    @ApiProperty()
    readonly title: string;

    private constructor(props: AssignmentItemResponseDto) {
        Object.assign(this, props);
    }

    static fromEntity(
        assignmentItem: AssignmentItem,
    ): AssignmentItemResponseDto {
        const props: AssignmentItemResponseDto = {
            id: assignmentItem.id,
            assignmentId: assignmentItem.assignmentId,
            assignmentTitle: assignmentItem.assignmentTitle,
            assignmentDescription: assignmentItem.assignmentDescription,
            assignmentDueDate: assignmentItem.assignmentDueDate,
            contentId: assignmentItem.contentId,
            contentType: assignmentItem.contentType,
            status: assignmentItem.status,
            title: assignmentItem.title,
        };
        return new AssignmentItemResponseDto(props);
    }

    static fromEntities(
        assignmentItems: AssignmentItem[],
    ): AssignmentItemResponseDto[] {
        return assignmentItems.map(AssignmentItemResponseDto.fromEntity);
    }
}
