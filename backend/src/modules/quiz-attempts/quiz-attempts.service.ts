import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { QuizAttemptCreateDto } from './dto/quiz-attempt.create.dto';
import { QuizAttemptQueryDto } from './dto/quiz-attempt.query.dto';
import { QuizAttemptResponseDto } from './dto/quiz-attempt.response.dto';

@Injectable()
export class QuizAttemptsService {
    constructor(private readonly pgService: PostgresService) {}

    async findByUserIdAndQuizId(dto: QuizAttemptQueryDto) {
        const { userId, quizId } = dto;

        return await this.pgService.query<QuizAttemptResponseDto>(
            this.pgService.getSql(
                __dirname,
                'quiz-attempt.find-by-user-and-quiz.sql',
            ),
            [userId, quizId],
        );
    }

    async findByUserId(userId: string): Promise<QuizAttemptResponseDto[]> {
        return await this.pgService.query<QuizAttemptResponseDto>(
            this.pgService.getSql(
                __dirname,
                'quiz-attempt.find-by-user-id.sql',
            ),
            [userId],
        );
    }

    async submitAttempt(attemptId: string): Promise<QuizAttemptResponseDto> {
        const [updatedAttempt] =
            await this.pgService.query<QuizAttemptResponseDto>(
                this.pgService.getSql(__dirname, 'quiz-attempt.submit.sql'),
                [attemptId],
            );
        return updatedAttempt;
    }

    async create(
        createQuizAttemptDto: QuizAttemptCreateDto,
    ): Promise<QuizAttemptResponseDto> {
        const { quizId, userId, points, startedAt, completedAt } =
            createQuizAttemptDto;

        const [result] = await this.pgService.query<QuizAttemptResponseDto>(
            this.pgService.getSql(__dirname, 'quiz-attempt.create.sql'),
            [
                quizId,
                userId,
                points ?? 0,
                startedAt ?? new Date(),
                completedAt ?? null,
            ],
        );
        return result;
    }
}
