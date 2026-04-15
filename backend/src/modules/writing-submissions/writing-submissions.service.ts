import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { CreateWritingSubmissionDto } from './dto/create-writing-submission.dto';
import { GetWritingSubmissionsFilterDto } from './dto/get-writing-submissions-filter.dto';
import { UpdateWritingSubmissionDto } from './dto/update-writing-submission.dto';
import { WritingSubmissionResponseDto } from './dto/writing-submission-response.dto';
import { WritingSubmission } from './entities/writing-submission.entity';

@Injectable()
export class WritingSubmissionsService {
    constructor(private readonly pgService: PostgresService) {}

    async findAll(
        filter: GetWritingSubmissionsFilterDto,
    ): Promise<WritingSubmissionResponseDto[]> {
        const { userId, taskId } = filter;

        const submissions = await this.pgService.query<WritingSubmission>(
            this.pgService.getSql(__dirname, 'getWritingSubmissions.sql'),
            [userId ?? null, taskId ?? null],
        );

        return WritingSubmissionResponseDto.fromEntities(submissions);
    }

    async create(
        createWritingSubmissionDto: CreateWritingSubmissionDto,
    ): Promise<WritingSubmissionResponseDto> {
        const { taskId, userId, content } = createWritingSubmissionDto;

        const [result] = await this.pgService.query<WritingSubmission>(
            this.pgService.getSql(__dirname, 'createWritingSubmission.sql'),
            [taskId, userId, content],
        );

        return WritingSubmissionResponseDto.fromEntity(result);
    }

    async update(
        id: string,
        updateWritingSubmissionDto: UpdateWritingSubmissionDto,
    ): Promise<WritingSubmissionResponseDto> {
        const { feedback, score, reviewedAt } = updateWritingSubmissionDto;

        const [result] = await this.pgService.query<WritingSubmission>(
            this.pgService.getSql(__dirname, 'updateWritingSubmission.sql'),
            [id, feedback ?? null, score ?? null, reviewedAt ?? new Date()],
        );

        return WritingSubmissionResponseDto.fromEntity(result);
    }
}
