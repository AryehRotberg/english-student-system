import { Injectable, NotFoundException } from '@nestjs/common';
import { RedisService } from '../../config/redis.client';
import { PostgresService } from '../../config/postgres.client';
import { CreateQuestionOptionDto } from './dto/create-question-option.dto';
import { GetQuestionOptionsFilterDto } from './dto/get-question-options-filter.dto';
import { QuestionOptionResponseDto } from './dto/question-option-response.dto';
import { UpdateQuestionOptionDto } from './dto/update-question-option.dto';
import { QuestionOption } from './entities/question-option.entity';
import {
    createQuestionOptionQuery,
    getQuestionOptionsByQuestionIdQuery,
    updateQuestionOptionQuery,
} from './question-options.queries';

@Injectable()
export class QuestionOptionsService {
    constructor(
        private readonly postgresService: PostgresService,
        private readonly redisService: RedisService,
    ) {}

    async findByQuestionId(
        filter: GetQuestionOptionsFilterDto,
    ): Promise<QuestionOptionResponseDto[]> {
        const { questionId } = filter;

        return this.redisService.getOrFetch<QuestionOptionResponseDto[]>(
            `question_options:${questionId}`,
            async () => {
                const questionOptions =
                    await this.postgresService.query<QuestionOption>(
                        getQuestionOptionsByQuestionIdQuery,
                        [questionId],
                    );

                return QuestionOptionResponseDto.fromEntities(questionOptions);
            },
        );
    }

    async create(
        createQuestionOptionDto: CreateQuestionOptionDto,
    ): Promise<QuestionOptionResponseDto> {
        const { questionId, optionText, isCorrect } = createQuestionOptionDto;

        await this.redisService.invalidate(`question_options:*`);

        const [result] = await this.postgresService.query<QuestionOption>(
            createQuestionOptionQuery,
            [questionId, optionText, isCorrect],
        );

        return QuestionOptionResponseDto.fromEntity(result);
    }

    async update(
        id: string,
        updateQuestionOptionDto: UpdateQuestionOptionDto,
    ): Promise<QuestionOptionResponseDto> {
        const { questionId, optionText, isCorrect } = updateQuestionOptionDto;

        await this.redisService.invalidate(`question_options:*`);

        const [result] = await this.postgresService.query<QuestionOption>(
            updateQuestionOptionQuery,
            [id, questionId ?? null, optionText ?? null, isCorrect ?? null],
        );

        if (!result) {
            throw new NotFoundException('Question option not found');
        }

        return QuestionOptionResponseDto.fromEntity(result);
    }
}
