import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { SendEmailService } from '../send-email/send-email.service';
import { UserResponseDto } from '../users/dto/user.response.dto';
import { QuizAttemptCreateDto } from './dto/quiz-attempt.create.dto';
import { QuizAttemptQueryDto } from './dto/quiz-attempt.query.dto';
import { QuizAttemptResponseDto } from './dto/quiz-attempt.response.dto';

@Injectable()
export class QuizAttemptsService {
    constructor(
        private readonly pgService: PostgresService,
        private readonly sendEmailService: SendEmailService,
    ) {}

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
        dto: QuizAttemptCreateDto,
        user: UserResponseDto,
    ): Promise<QuizAttemptResponseDto> {
        const { quizId, quizTitle } = dto;

        const [result] = await this.pgService.query<QuizAttemptResponseDto>(
            this.pgService.getSql(__dirname, 'quiz-attempt.create.sql'),
            [quizId, user.id, 0, new Date(), null],
        );

        await this.sendEmailService.sendFromDto({
            name: user.name,
            email: user.teacherEmail!,
            subject: `${user.name} has started quiz "${quizTitle}"`,
            title: `Quiz Attempt Started`,
            body: `${user.name} has started a quiz attempt for quiz "${quizTitle}" on ${new Date(
                new Date(),
            ).toLocaleString()}.`,
        });

        return result;
    }
}
