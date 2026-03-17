import { Injectable, NotFoundException } from '@nestjs/common';
import { PostgresService } from '../config/postgres.client';
import { CreateQuizAttemptDto } from './dto/create-quiz-attempt.dto';
import { GetQuizAttemptsFilterDto } from './dto/get-quiz-attempts-filter.dto';
import { QuizAttemptResponseDto } from './dto/quiz-attempt-response.dto';
import { UpdateQuizAttemptDto } from './dto/update-quiz-attempt.dto';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import {
    completeQuizAssignmentItemsForUserQuery,
    createQuizAttemptQuery,
    getQuizAttemptsByUserIdAndQuizIdQuery,
    updateQuizAttemptQuery,
} from './quiz-attempts.queries';

@Injectable()
export class QuizAttemptsService {
    constructor(private readonly postgresService: PostgresService) { }

    async findByUserIdAndQuizId(filter: GetQuizAttemptsFilterDto) {
        const { userId, quizId } = filter;

        const attempts = await this.postgresService.query<QuizAttempt>(
            getQuizAttemptsByUserIdAndQuizIdQuery,
            [userId, quizId]
        );

        return QuizAttemptResponseDto.fromEntities(attempts);
    }

    async create(createQuizAttemptDto: CreateQuizAttemptDto): Promise<QuizAttemptResponseDto> {
        const { quizId, userId, points, startedAt, completedAt } = createQuizAttemptDto;

        const [result] = await this.postgresService.query<QuizAttempt>(
            createQuizAttemptQuery,
            [quizId, userId, points ?? 0, startedAt ?? new Date(), completedAt ?? null],
        );

        return QuizAttemptResponseDto.fromEntity(result);
    }

    async update(id: string, updateQuizAttemptDto: UpdateQuizAttemptDto): Promise<QuizAttemptResponseDto> {
        const [result] = await this.postgresService.query<QuizAttempt>(
            updateQuizAttemptQuery,
            [
                id,
                updateQuizAttemptDto.quizId ?? null,
                updateQuizAttemptDto.userId ?? null,
                updateQuizAttemptDto.points ?? null,
                updateQuizAttemptDto.startedAt ?? null,
                updateQuizAttemptDto.completedAt ?? null,
            ],
        );

        if (!result) {
            throw new NotFoundException('Quiz attempt not found');
        }

        if (result.completedAt) {
            await this.postgresService.query(
                completeQuizAssignmentItemsForUserQuery,
                [result.userId, result.quizId],
            );
        }

        return QuizAttemptResponseDto.fromEntity(result);
    }
}
