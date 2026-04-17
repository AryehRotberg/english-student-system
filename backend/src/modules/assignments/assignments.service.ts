import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { AssignmentCreateDto } from './dto/assignment.create.dto';
import { AssignmentQueryDto } from './dto/assignment.query.dto';
import { AssignmentResponseDto } from './dto/assignment.response.dto';

@Injectable()
export class AssignmentsService {
    constructor(private readonly pgService: PostgresService) {}

    async findByUserId(
        dto: AssignmentQueryDto,
    ): Promise<AssignmentResponseDto[]> {
        const { userId } = dto;

        return await this.pgService.query<AssignmentResponseDto>(
            this.pgService.getSql(__dirname, 'assignment.find-by-user-id.sql'),
            [userId],
        );
    }

    async create(dto: AssignmentCreateDto): Promise<AssignmentResponseDto> {
        const { userId, title, description, dueDate, items } = dto;

        const [result] = await this.pgService.query<AssignmentResponseDto>(
            this.pgService.getSql(__dirname, 'assignment.create.sql'),
            [
                userId,
                title,
                description,
                dueDate,
                items ? JSON.stringify(items) : null,
            ],
        );
        return result;
    }
}
