import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { AssignmentResponseDto } from './dto/assignment-response.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { GetAssignmentsFilterDto } from './dto/get-assignments-filter.dto';
import { Assignment } from './entities/assignment.entity';

@Injectable()
export class AssignmentsService {
    constructor(private readonly pgService: PostgresService) {}

    async findByUserId(
        filter: GetAssignmentsFilterDto,
    ): Promise<AssignmentResponseDto[]> {
        const { userId } = filter;

        const query = this.pgService.getSql(
            __dirname,
            'get-assignments-by-user-id.sql',
        );
        const assignments = await this.pgService.query<Assignment>(query, [
            userId,
        ]);
        return AssignmentResponseDto.fromEntities(assignments);
    }

    async create(
        createAssignmentDto: CreateAssignmentDto,
    ): Promise<AssignmentResponseDto> {
        const { userId, title, description, dueDate } = createAssignmentDto;

        const query = this.pgService.getSql(__dirname, 'create-assignment.sql');
        const result = await this.pgService.query<Assignment>(query, [
            userId,
            title,
            description,
            dueDate,
        ]);

        return AssignmentResponseDto.fromEntity(result[0]);
    }
}
