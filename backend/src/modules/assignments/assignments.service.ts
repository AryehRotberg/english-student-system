import { Injectable } from '@nestjs/common';
import { UserResponseDto } from '../users/dto/user.response.dto';
import { SendEmailService } from '../send-email/send-email.service';
import { assignmentSummaryCard } from '../send-email/templates/cards/assignment-summary-card.template';
import { metricsCard } from '../send-email/templates/cards/metrics-card.template';
import { AssignmentCreateDto } from './dto/assignment.create.dto';
import { AssignmentQueryDto } from './dto/assignment.query.dto';
import { Assignment } from './entities/assignment.entity';
import { AssignmentProgressRepository } from './repositories/assignment-progress.repository';
import { AssignmentRepository } from './repositories/assignment.repository';

@Injectable()
export class AssignmentsService {
    constructor(
        private readonly assignmentRepo: AssignmentRepository,
        private readonly assignmentProgressRepo: AssignmentProgressRepository,
        private readonly sendEmailService: SendEmailService,
    ) {}

    findByUserId(dto: AssignmentQueryDto): Promise<Assignment[]> {
        return this.assignmentRepo.find({
            where: { userId: dto.userId },
            order: { createdAt: 'DESC' },
        });
    }

    findActiveByUserId(userId: string): Promise<Assignment[]> {
        return this.assignmentRepo.find({
            where: { userId, isCompleted: false },
            order: { createdAt: 'DESC' },
        });
    }

    async create(dto: AssignmentCreateDto): Promise<Assignment> {
        return this.assignmentRepo.create(dto);
    }

    async sendCompletionEmail(user: UserResponseDto, attemptId: string) {
        const summary =
            await this.assignmentProgressRepo.findAssignmentCompletionByQuizAttemptId(
                attemptId,
            );

        const earnedPoints = Number(summary.points ?? 0);
        const totalPoints = Number(summary.totalPoints ?? 0);
        const scorePercent =
            totalPoints > 0
                ? Math.round((earnedPoints / totalPoints) * 100)
                : 0;

        const completedItems = Number(summary.completedItems ?? 0);
        const totalItems = Number(summary.totalItems ?? 0);
        const progressPercent =
            totalItems > 0
                ? Math.round((completedItems / totalItems) * 100)
                : 0;

        const subject = `${user.name} completed ${summary.assignmentTitle ?? 'assignment'}: ${scorePercent}% score, ${progressPercent}% progress`;
        const title = `${summary.assignmentTitle ?? 'Assignment'} completed`;
        const body = `Hello ${user.teacherName ?? ''},\n\n${user.name} has completed "${summary.assignmentTitle ?? 'Assignment'}". Review the latest score and assignment progress summary below.`;
        const cards =
            assignmentSummaryCard({
                assignmentTitle: summary.assignmentTitle ?? 'Assignment',
                quizTitle: summary.quizTitle,
            }) +
            metricsCard({
                scorePercent,
                earnedPoints: this.formatNumber(earnedPoints),
                totalPoints: this.formatNumber(totalPoints),
                progressPercent,
                completedItems,
                totalItems,
            });

        return await this.sendEmailService.send(
            user.teacherEmail!,
            subject,
            title,
            body,
            cards,
        );
    }

    private formatNumber(value: number): string {
        if (Number.isInteger(value)) {
            return value.toString();
        }
        return value.toFixed(2).replace(/\.00$/, '');
    }
}
