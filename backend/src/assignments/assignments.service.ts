import { Injectable } from '@nestjs/common';
import { PostgresService } from '../config/postgres.client';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { createAssignmentQuery, getAssignmentsByUserIdQuery } from './assignments.queries';
import { AssignmentResponseDto } from './dto/assignment-response.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { GetAssignmentsFilterDto } from './dto/get-assignments-filter.dto';
import { Assignment } from './entities/assignment.entity';

@Injectable()
export class AssignmentsService {
    constructor(private readonly postgresService: PostgresService) { }

    async findByUserId(filter: GetAssignmentsFilterDto): Promise<AssignmentResponseDto[]> {
        const { userId } = filter;

        const assignments = await this.postgresService.query<Assignment>(
            getAssignmentsByUserIdQuery,
            [userId]
        );

        return AssignmentResponseDto.fromEntities(assignments);
    }

    async create(createAssignmentDto: CreateAssignmentDto): Promise<AssignmentResponseDto> {
        const { userId, title, description, dueDate } = createAssignmentDto;

        const result = await this.postgresService.query(
            createAssignmentQuery,
            [userId, title, description, dueDate]
        );

        return AssignmentResponseDto.fromEntity(result[0]);
    }
}
