import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/config/redis.client';
import { PostgresService } from '../config/postgres.client';
import { CreateQuestionDto } from './dto/create-question.dto';
import { QuestionResponseDto } from './dto/question-response.dto';
import { Question } from './entities/question.entity';
import { createQuestionQuery, getAllQuestionsQuery } from './questions.queries';

@Injectable()
export class QuestionsService {
    constructor(
        private readonly postgresService: PostgresService,
        private readonly redisService: RedisService,
    ) {}

    async findAll(): Promise<QuestionResponseDto[]> {
        return this.redisService.getOrFetch<QuestionResponseDto[]>(
            'questions:all',
            async () => {
                const questions =
                    await this.postgresService.query<Question>(
                        getAllQuestionsQuery,
                    );
                return QuestionResponseDto.fromEntities(questions);
            },
        );
    }

    async create(
        createQuestionDto: CreateQuestionDto,
    ): Promise<QuestionResponseDto> {
        const { question, questionType, audioUrl } = createQuestionDto;

        await this.redisService.invalidate('questions:all');

        const [result] = await this.postgresService.query<Question>(
            createQuestionQuery,
            [question, questionType, audioUrl ?? null],
        );

        return QuestionResponseDto.fromEntity(result);
    }
}
