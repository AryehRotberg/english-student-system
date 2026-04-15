import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { CreateQuizAttemptDto } from './dto/create-quiz-attempt.dto';
import { GetQuizAttemptsFilterDto } from './dto/get-quiz-attempts-filter.dto';
import { QuizAttemptResponseDto } from './dto/quiz-attempt-response.dto';
import { QuizAttempt } from './entities/quiz-attempt.entity';

@Injectable()
export class QuizAttemptsService {
    constructor(private readonly pgService: PostgresService) {}

    async findByUserIdAndQuizId(filter: GetQuizAttemptsFilterDto) {
        const { userId, quizId } = filter;

        const attempts = await this.pgService.query<QuizAttempt>(
            this.pgService.getSql(
                __dirname,
                'get-quiz-attempts-by-user-id-and-quiz-id.sql',
            ),
            [userId, quizId],
        );

        return QuizAttemptResponseDto.fromEntities(attempts);
    }

    async findByUserId(userId: string): Promise<QuizAttemptResponseDto[]> {
        const attempts = await this.pgService.query<QuizAttempt>(
            this.pgService.getSql(
                __dirname,
                'get-quiz-attempts-by-user-id.sql',
            ),
            [userId],
        );

        return QuizAttemptResponseDto.fromEntities(attempts);
    }

    async submitAttempt(attemptId: string): Promise<QuizAttemptResponseDto> {
        const [updatedAttempt] = await this.pgService.query<QuizAttempt>(
            this.pgService.getSql(__dirname, 'submit-quiz-attempt.sql'),
            [attemptId],
        );

        return QuizAttemptResponseDto.fromEntity(updatedAttempt);
    }

    async create(
        createQuizAttemptDto: CreateQuizAttemptDto,
    ): Promise<QuizAttemptResponseDto> {
        const { quizId, userId, points, startedAt, completedAt } =
            createQuizAttemptDto;

        const [result] = await this.pgService.query<QuizAttempt>(
            this.pgService.getSql(__dirname, 'create-quiz-attempt.sql'),
            [
                quizId,
                userId,
                points ?? 0,
                startedAt ?? new Date(),
                completedAt ?? null,
            ],
        );

        return QuizAttemptResponseDto.fromEntity(result);
    }
}
