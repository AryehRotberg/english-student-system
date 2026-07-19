import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as Sentry from '@sentry/node';
import { Quiz } from '../quizzes/entities/quiz.entity';
import { AssignmentsService } from '../assignments/assignments.service';
import { SendEmailService } from '../send-email/send-email.service';
import { UserResponseDto } from '../users/dto/user.response.dto';
import { QuizAttemptCreateDto } from './dto/quiz-attempt.create.dto';
import { QuizAttemptQueryDto } from './dto/quiz-attempt.query.dto';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { QuizAttemptRepository } from './repositories/quiz-attempt.repository';

@Injectable()
export class QuizAttemptsService {
    private readonly logger = new Logger(QuizAttemptsService.name);

    constructor(
        private readonly attemptRepo: QuizAttemptRepository,
        private readonly sendEmailService: SendEmailService,
        private readonly assignmentsService: AssignmentsService,
        @InjectRepository(Quiz) private readonly quizRepo: Repository<Quiz>,
    ) {}

    async findByUserIdAndQuizId(dto: QuizAttemptQueryDto) {
        return await this.attemptRepo.find({
            where: { userId: dto.userId, quizId: dto.quizId },
        });
    }

    async findByUserId(userId: string): Promise<QuizAttempt[]> {
        return await this.attemptRepo.find({
            where: { userId: userId },
            order: { startedAt: 'DESC' },
        });
    }

    async submitAttempt(
        user: UserResponseDto,
        attemptId: string,
    ): Promise<QuizAttempt> {
        const result = await this.attemptRepo.submitAttempt(attemptId);
        this.assignmentsService
            .sendCompletionEmail(user, attemptId)
            .catch((err) => {
                this.logger.error('Failed to send completion email', err);
                Sentry.captureException(err);
            });
        return result;
    }

    async create(
        dto: QuizAttemptCreateDto,
        user: UserResponseDto,
    ): Promise<QuizAttempt> {
        const { quizId } = dto;

        const entity = this.attemptRepo.create({
            quizId,
            userId: user.id,
            points: 0,
            startedAt: new Date(),
            completedAt: null,
        });
        const result = await this.attemptRepo.save(entity);

        if (user.teacherEmail) {
            const quiz = await this.quizRepo.findOneBy({ id: quizId });
            const quizTitle = quiz?.title ?? 'Quiz';
            this.sendEmailService
                .send(
                    user.teacherEmail,
                    `${user.name} has started quiz "${quizTitle}"`,
                    `Quiz Attempt Started`,
                    `${user.name} has started a quiz attempt for quiz "${quizTitle}" on ${new Date().toLocaleString()}.`,
                )
                .catch((err) => {
                    this.logger.error('Failed to send quiz start email', err);
                    Sentry.captureException(err);
                });
        }

        return result;
    }
}
