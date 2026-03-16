import { Assignment } from "../entities/assignment.entity";

export class AssignmentResponseDto {
    readonly id: string;
    readonly userId: string;
    readonly title: string;
    readonly description: string;
    readonly dueDate: Date;
    readonly createdAt: Date;

    private constructor(props: AssignmentResponseDto) {
        Object.assign(this, props);
    }

    static fromEntity(assignment: Assignment): AssignmentResponseDto {
        const props: AssignmentResponseDto = {
            id: assignment.id,
            userId: assignment.userId,
            title: assignment.title,
            description: assignment.description,
            dueDate: assignment.dueDate,
            createdAt: assignment.createdAt,
        };
        return new AssignmentResponseDto(props);
    }

    static fromEntities(assignments: Assignment[]): AssignmentResponseDto[] {
        return assignments.map(AssignmentResponseDto.fromEntity);
    }
}