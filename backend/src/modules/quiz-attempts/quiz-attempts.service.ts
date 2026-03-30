import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { CreateQuizAttemptDto } from './dto/create-quiz-attempt.dto';
import { GetQuizAttemptsFilterDto } from './dto/get-quiz-attempts-filter.dto';
import { QuizAttemptResponseDto } from './dto/quiz-attempt-response.dto';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import {
    completeQuizAssignmentItemsForUserQuery,
    createQuizAttemptQuery,
    getQuizAttemptsByUserIdAndQuizIdQuery,
    getQuizAttemptsByUserIdQuery,
} from './quiz-attempts.queries';

@Injectable()
export class QuizAttemptsService {
    constructor(private readonly postgresService: PostgresService) {}

    async completeQuizAssignmentItemsForUser(
        userId: string,
        quizId: string,
    ): Promise<void> {
        await this.postgresService.query(
            completeQuizAssignmentItemsForUserQuery,
            [userId, quizId],
        );
    }

    async findByUserIdAndQuizId(filter: GetQuizAttemptsFilterDto) {
        const { userId, quizId } = filter;

        const attempts = await this.postgresService.query<QuizAttempt>(
            getQuizAttemptsByUserIdAndQuizIdQuery,
            [userId, quizId],
        );

        return QuizAttemptResponseDto.fromEntities(attempts);
    }

    async findByUserId(userId: string): Promise<QuizAttemptResponseDto[]> {
        const attempts = await this.postgresService.query<QuizAttempt>(
            getQuizAttemptsByUserIdQuery,
            [userId],
        );

        return QuizAttemptResponseDto.fromEntities(attempts);
    }

    async create(
        createQuizAttemptDto: CreateQuizAttemptDto,
    ): Promise<QuizAttemptResponseDto> {
        const { quizId, userId, points, startedAt, completedAt } =
            createQuizAttemptDto;

        const [result] = await this.postgresService.query<QuizAttempt>(
            createQuizAttemptQuery,
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
