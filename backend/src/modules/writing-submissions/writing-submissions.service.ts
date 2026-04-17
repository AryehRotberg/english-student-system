import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { WritingSubmissionCreateDto } from './dto/writing-submission.create.dto';
import { WritingSubmissionFilterDto } from './dto/writing-submission.query.dto';
import { WritingSubmissionUpdateDto } from './dto/writing-submission.update.dto';
import { WritingSubmissionResponseDto } from './dto/writing-submission.response.dto';

@Injectable()
export class WritingSubmissionsService {
    constructor(private readonly pgService: PostgresService) {}

    async findAll(
        filter: WritingSubmissionFilterDto,
    ): Promise<WritingSubmissionResponseDto[]> {
        const { userId, taskId } = filter;

        return await this.pgService.query<WritingSubmissionResponseDto>(
            this.pgService.getSql(__dirname, 'writing-submission.find-all.sql'),
            [userId ?? null, taskId ?? null],
        );
    }

    async create(
        createWritingSubmissionDto: WritingSubmissionCreateDto,
    ): Promise<WritingSubmissionResponseDto> {
        const { taskId, userId, content } = createWritingSubmissionDto;

        const [result] =
            await this.pgService.query<WritingSubmissionResponseDto>(
                this.pgService.getSql(
                    __dirname,
                    'writing-submission.create.sql',
                ),
                [taskId, userId, content],
            );
        return result;
    }

    async update(
        id: string,
        updateWritingSubmissionDto: WritingSubmissionUpdateDto,
    ): Promise<WritingSubmissionResponseDto> {
        const { feedback, score, reviewedAt } = updateWritingSubmissionDto;

        const [result] =
            await this.pgService.query<WritingSubmissionResponseDto>(
                this.pgService.getSql(
                    __dirname,
                    'writing-submission.update.sql',
                ),
                [id, feedback ?? null, score ?? null, reviewedAt ?? new Date()],
            );
        return result;
    }
}
