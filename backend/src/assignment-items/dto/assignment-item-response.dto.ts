import { AssignmentItem } from "../entities/assignment-item.entity";

export class AssignmentItemResponseDto {
    readonly id: string;
    readonly assignmentId: string;
    readonly assignmentTitle: string;
    readonly assignmentDescription: string;
    readonly contentId: string;
    readonly contentType: string;
    readonly status: 'assigned' | 'completed';
    readonly title: string;

    private constructor(props: AssignmentItemResponseDto) {
        Object.assign(this, props);
    }

    static fromEntity(assignmentItem: AssignmentItem): AssignmentItemResponseDto {
        const props: AssignmentItemResponseDto = {
            id: assignmentItem.id,
            assignmentId: assignmentItem.assignmentId,
            assignmentTitle: assignmentItem.assignmentTitle,
            assignmentDescription: assignmentItem.assignmentDescription,
            contentId: assignmentItem.contentId,
            contentType: assignmentItem.contentType,
            status: assignmentItem.status,
            title: assignmentItem.title,
        };
        return new AssignmentItemResponseDto(props);
    }

    static fromEntities(assignmentItems: AssignmentItem[]): AssignmentItemResponseDto[] {
        return assignmentItems.map(AssignmentItemResponseDto.fromEntity);
    }
}