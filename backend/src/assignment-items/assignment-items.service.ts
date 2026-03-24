import { Injectable } from '@nestjs/common';
import { RedisService } from '../config/redis.client';
import { PostgresService } from '../config/postgres.client';
import {
    createAssignmentItemQuery,
    getAssignmentItemsByUserIdQuery,
} from './assignment-items.queries';
import { AssignmentItemResponseDto } from './dto/assignment-item-response.dto';
import { CreateAssignmentItemDto } from './dto/create-assignment-item.dto';
import { GetAssignmentItemsFilterDto } from './dto/get-asssignment-items-filter.dto';
import { AssignmentItem } from './entities/assignment-item.entity';

@Injectable()
export class AssignmentItemsService {
    constructor(
        private readonly postgresService: PostgresService,
        private readonly redisService: RedisService,
    ) {}

    async findByUserId(
        filter: GetAssignmentItemsFilterDto,
    ): Promise<AssignmentItemResponseDto[]> {
        const { userId } = filter;

        return this.redisService.getOrFetch<AssignmentItemResponseDto[]>(
            `assignment-items:user:${userId}`,
            async () => {
                const assignmentItems =
                    await this.postgresService.query<AssignmentItem>(
                        getAssignmentItemsByUserIdQuery,
                        [userId],
                    );

                return AssignmentItemResponseDto.fromEntities(assignmentItems);
            },
        );
    }

    async create(
        createAssignmentItemDto: CreateAssignmentItemDto,
    ): Promise<AssignmentItemResponseDto> {
        const { assignmentId, contentType, contentId, status } =
            createAssignmentItemDto;

        await this.redisService.invalidate(`assignment-items:*`);

        const result = await this.postgresService.query(
            createAssignmentItemQuery,
            [assignmentId, contentType, contentId, status],
        );

        return AssignmentItemResponseDto.fromEntity(result[0]);
    }
}
