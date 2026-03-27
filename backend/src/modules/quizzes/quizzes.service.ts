import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { RedisService } from '../../config/redis.client';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { QuizResponseDto } from './dto/quiz-response.dto';
import { QuizTopicResponseDto } from './dto/quiz-topic-response.dto';
import { QuizTopic } from './entities/quiz-topic.entity';
import { Quiz } from './entities/quiz.entity';
import {
    createQuizQuery,
    getAllQuizzesQuery,
    getQuizTopicsByQuizIdQuery,
} from './quizzes.queries';

@Injectable()
export class QuizzesService {
    constructor(
        private readonly postgresService: PostgresService,
        private readonly redisService: RedisService,
    ) {}

    async findAll(): Promise<QuizResponseDto[]> {
        return this.redisService.getOrFetch('quizzes:all', async () => {
            const quizzes =
                await this.postgresService.query<Quiz>(getAllQuizzesQuery);
            return QuizResponseDto.fromEntities(quizzes);
        });
    }

    async findTopicsByQuizId(quizId: string): Promise<QuizTopicResponseDto[]> {
        return this.redisService.getOrFetch(
            `quizzes:${quizId}:topics`,
            async () => {
                const topics = await this.postgresService.query<QuizTopic>(
                    getQuizTopicsByQuizIdQuery,
                    [quizId],
                );

                return QuizTopicResponseDto.fromEntities(topics);
            },
        );
    }

    async create(createQuizDto: CreateQuizDto): Promise<QuizResponseDto> {
        const { title, description } = createQuizDto;

        await this.redisService.invalidate('quizzes:*');

        const result = await this.postgresService.query(createQuizQuery, [
            title,
            description,
        ]);

        return QuizResponseDto.fromEntity(result[0]);
    }
}
