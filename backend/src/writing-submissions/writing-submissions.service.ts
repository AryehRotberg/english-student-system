import { Injectable } from '@nestjs/common';
import { RedisService } from '../config/redis.client';
import { PostgresService } from '../config/postgres.client';
import { CreateWritingSubmissionDto } from './dto/create-writing-submission.dto';
import { GetWritingSubmissionsFilterDto } from './dto/get-writing-submissions-filter.dto';
import { UpdateWritingSubmissionDto } from './dto/update-writing-submission.dto';
import { WritingSubmissionResponseDto } from './dto/writing-submission-response.dto';
import { WritingSubmission } from './entities/writing-submission.entity';
import {
    createWritingSubmissionQuery,
    getWritingSubmissionsQuery,
    updateWritingSubmissionQuery,
} from './writing-submissions.queries';

@Injectable()
export class WritingSubmissionsService {
    constructor(
        private readonly postgresService: PostgresService,
        private readonly redisService: RedisService,
    ) {}

    async findAll(
        filter: GetWritingSubmissionsFilterDto,
    ): Promise<WritingSubmissionResponseDto[]> {
        const { userId, taskId } = filter;

        return this.redisService.getOrFetch<WritingSubmissionResponseDto[]>(
            `writing-submissions:${userId ?? 'all'}:${taskId ?? 'all'}`,
            async () => {
                const submissions =
                    await this.postgresService.query<WritingSubmission>(
                        getWritingSubmissionsQuery,
                        [userId ?? null, taskId ?? null],
                    );

                return WritingSubmissionResponseDto.fromEntities(submissions);
            },
        );
    }

    async create(
        createWritingSubmissionDto: CreateWritingSubmissionDto,
    ): Promise<WritingSubmissionResponseDto> {
        const { taskId, userId, content } = createWritingSubmissionDto;

        await this.redisService.invalidate(`writing-submissions:*`);

        const [result] = await this.postgresService.query<WritingSubmission>(
            createWritingSubmissionQuery,
            [taskId, userId, content],
        );

        return WritingSubmissionResponseDto.fromEntity(result);
    }

    async update(
        id: string,
        updateWritingSubmissionDto: UpdateWritingSubmissionDto,
    ): Promise<WritingSubmissionResponseDto> {
        const { feedback, score, reviewedAt } = updateWritingSubmissionDto;

        await this.redisService.invalidate(`writing-submissions:*`);

        const [result] = await this.postgresService.query<WritingSubmission>(
            updateWritingSubmissionQuery,
            [id, feedback ?? null, score ?? null, reviewedAt ?? new Date()],
        );

        return WritingSubmissionResponseDto.fromEntity(result);
    }
}
