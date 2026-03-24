import { Injectable } from '@nestjs/common';
import { RedisService } from '../config/redis.client';
import { PostgresService } from '../config/postgres.client';
import {
    createAssignmentQuery,
    getAssignmentsByUserIdQuery,
} from './assignments.queries';
import { AssignmentResponseDto } from './dto/assignment-response.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { GetAssignmentsFilterDto } from './dto/get-assignments-filter.dto';
import { Assignment } from './entities/assignment.entity';

@Injectable()
export class AssignmentsService {
    constructor(
        private readonly postgresService: PostgresService,
        private readonly redisService: RedisService,
    ) {}

    async findByUserId(
        filter: GetAssignmentsFilterDto,
    ): Promise<AssignmentResponseDto[]> {
        const { userId } = filter;

        return this.redisService.getOrFetch<AssignmentResponseDto[]>(
            `assignments:user:${userId}`,
            async () => {
                const assignments =
                    await this.postgresService.query<Assignment>(
                        getAssignmentsByUserIdQuery,
                        [userId],
                    );
                return AssignmentResponseDto.fromEntities(assignments);
            },
        );
    }

    async create(
        createAssignmentDto: CreateAssignmentDto,
    ): Promise<AssignmentResponseDto> {
        const { userId, title, description, dueDate } = createAssignmentDto;

        await this.redisService.invalidate(`assignments:*`);

        const result = await this.postgresService.query(createAssignmentQuery, [
            userId,
            title,
            description,
            dueDate,
        ]);

        return AssignmentResponseDto.fromEntity(result[0]);
    }
}
