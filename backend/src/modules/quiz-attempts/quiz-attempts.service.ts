import { Injectable } from '@nestjs/common';
import { IsNull, Not } from 'typeorm';
import { SendEmailService } from '../send-email/send-email.service';
import { UserResponseDto } from '../users/dto/user.response.dto';
import { QuizAttemptCreateDto } from './dto/quiz-attempt.create.dto';
import { QuizAttemptQueryDto } from './dto/quiz-attempt.query.dto';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { QuizAttemptRepository } from './repositories/quiz-attempt.repository';

@Injectable()
export class QuizAttemptsService {
    constructor(
        private readonly attemptRepo: QuizAttemptRepository,
        private readonly sendEmailService: SendEmailService,
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

    async submitAttempt(attemptId: string): Promise<QuizAttempt> {
        return await this.attemptRepo.submitAttempt(attemptId);
    }

    async create(
        dto: QuizAttemptCreateDto,
        user: UserResponseDto,
    ): Promise<QuizAttempt> {
        const { quizId, quizTitle } = dto;

        const entity = this.attemptRepo.create({
            quizId,
            userId: user.id,
            points: 0,
            startedAt: new Date(),
            completedAt: null,
        });
        const result = await this.attemptRepo.save(entity);

        await this.sendEmailService.sendFromDto({
            name: user.name,
            email: user.teacherEmail!,
            subject: `${user.name} has started quiz "${quizTitle}"`,
            title: `Quiz Attempt Started`,
            body: `${user.name} has started a quiz attempt for quiz "${quizTitle}" on ${new Date().toLocaleString()}.`,
        });

        return result;
    }
}
