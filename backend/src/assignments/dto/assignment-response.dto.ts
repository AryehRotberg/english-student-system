import { Assignment } from '../entities/assignment.entity';
import { ApiProperty } from '@nestjs/swagger';

export class AssignmentResponseDto {
    @ApiProperty()
    readonly id: string;
    @ApiProperty()
    readonly userId: string;
    @ApiProperty()
    readonly title: string;
    @ApiProperty()
    readonly description: string;
    @ApiProperty()
    readonly dueDate: Date;
    @ApiProperty()
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
