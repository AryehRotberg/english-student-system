import { Injectable } from '@nestjs/common';
import { UserResponseDto } from '../users/dto/user.response.dto';
import { SendEmailAssignmentCompletionDto } from './dto/send-email.assignment-completion.dto';
import { SendEmailRepository } from './repositories/send-email.repository';
import { SendEmailService } from './send-email.service';
import { escapeHtml } from './send-email.utils';
import { assignmentSummaryCard } from './templates/cards/assignment-summary-card.template';
import { metricsCard } from './templates/cards/metrics-card.template';
import { defaultTemplate } from './templates/default-template.template';

@Injectable()
export class AssignmentCompletionEmailService {
    constructor(
        private readonly sendEmailService: SendEmailService,
        private readonly sendEmailRepo: SendEmailRepository,
    ) {}

    async send(user: UserResponseDto, dto: SendEmailAssignmentCompletionDto) {
        const summary =
            await this.sendEmailRepo.findAssignmentCompletionByQuizAttemptId(
                Number(dto.attemptId),
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

        const portalUrl = process.env.FRONTEND_URL!;

        const subject = `${user.name} completed ${summary.assignmentTitle ?? 'assignment'}: ${scorePercent}% score, ${progressPercent}% progress`;

        return await this.sendEmailService.send(
            user.teacherEmail!,
            subject,
            defaultTemplate(
                {
                    title: escapeHtml(
                        `${summary.assignmentTitle ?? 'Assignment'} completed`,
                    ),
                    body: `Hello ${escapeHtml(user.teacherName ?? '')},<br><br>${escapeHtml(user.name)} has completed "${escapeHtml(summary.assignmentTitle ?? 'Assignment')}". Review the latest score and assignment progress summary below.`,

                    cards:
                        assignmentSummaryCard({
                            assignmentTitle: escapeHtml(
                                summary.assignmentTitle ?? 'Assignment',
                            ),
                            quizTitle: escapeHtml(summary.quizTitle),
                        }) +
                        metricsCard({
                            scorePercent,
                            earnedPoints: this.formatNumber(earnedPoints),
                            totalPoints: this.formatNumber(totalPoints),
                            progressPercent,
                            completedItems,
                            totalItems,
                        }),
                },
                portalUrl,
            ),
        );
    }

    private formatNumber(value: number): string {
        if (Number.isInteger(value)) {
            return value.toString();
        }

        return value.toFixed(2).replace(/\.00$/, '');
    }
}
