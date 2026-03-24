import { Injectable, NotFoundException } from '@nestjs/common';
import { RedisService } from '../config/redis.client';
import { PostgresService } from '../config/postgres.client';
import {
    createAnswerQuery,
    deleteAnswerQuery,
    getAllAnswersQuery,
    getAnswerByIdQuery,
    updateAnswerQuery,
} from './answers.queries';
import { AnswerResponseDto } from './dto/answer-response.dto';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { Answer } from './entities/answer.entity';

@Injectable()
export class AnswersService {
    constructor(
        private readonly postgresService: PostgresService,
        private readonly redisService: RedisService,
    ) {}

    async create(createAnswerDto: CreateAnswerDto): Promise<AnswerResponseDto> {
        const { questionId, answer, blankIndex } = createAnswerDto;
        await this.redisService.invalidate('answers:*');

        const [result] = await this.postgresService.query<Answer>(
            createAnswerQuery,
            [questionId, answer, blankIndex],
        );

        return AnswerResponseDto.fromEntity(result);
    }

    async findAll(): Promise<AnswerResponseDto[]> {
        return this.redisService.getOrFetch<AnswerResponseDto[]>(
            'answers:all',
            async () => {
                const answers =
                    await this.postgresService.query<Answer>(
                        getAllAnswersQuery,
                    );
                return AnswerResponseDto.fromEntities(answers);
            },
        );
    }

    async findOne(id: string): Promise<AnswerResponseDto> {
        const cacheKey = `answers:${id}`;
        return this.redisService.getOrFetch<AnswerResponseDto>(
            cacheKey,
            async () => {
                const [answer] = await this.postgresService.query<Answer>(
                    getAnswerByIdQuery,
                    [id],
                );

                if (!answer) {
                    throw new NotFoundException('Answer not found');
                }

                return AnswerResponseDto.fromEntity(answer);
            },
        );
    }

    async update(
        id: string,
        updateAnswerDto: UpdateAnswerDto,
    ): Promise<AnswerResponseDto> {
        await this.redisService.invalidate('answers:*');

        const [result] = await this.postgresService.query<Answer>(
            updateAnswerQuery,
            [
                id,
                updateAnswerDto.questionId ?? null,
                updateAnswerDto.answer ?? null,
                updateAnswerDto.blankIndex ?? null,
            ],
        );

        if (!result) {
            throw new NotFoundException('Answer not found');
        }

        return AnswerResponseDto.fromEntity(result);
    }

    async remove(id: string): Promise<AnswerResponseDto> {
        await this.redisService.invalidate('answers:*');

        const [result] = await this.postgresService.query<Answer>(
            deleteAnswerQuery,
            [id],
        );

        if (!result) {
            throw new NotFoundException('Answer not found');
        }

        return AnswerResponseDto.fromEntity(result);
    }
}
