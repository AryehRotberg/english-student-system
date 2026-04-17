import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { UserResponseDto } from '../users/dto/user.response.dto';
import { SendEmailAssignmentCompletionDto } from './dto/send-email.assignment-completion.dto';
import { AssignmentCompletionSummary } from './entities/assignment-completion-summary';
import { SendEmailService } from './send-email.service';
import { escapeHtml } from './send-email.utils';
import { assignmentSummaryCard } from './templates/assignment-summary-card.template';
import { defaultTemplate } from './templates/default-template.template';
import { metricsCard } from './templates/metrics-card.template';

@Injectable()
export class AssignmentCompletionEmailService {
    constructor(
        private readonly sendEmailService: SendEmailService,
        private readonly pgService: PostgresService,
    ) {}

    async send(user: UserResponseDto, dto: SendEmailAssignmentCompletionDto) {
        const [summary] =
            await this.pgService.query<AssignmentCompletionSummary>(
                this.pgService.getSql(
                    __dirname,
                    'send-email.find-assignment-completion.sql',
                ),
                [dto.attemptId],
            );

        if (!summary) {
            throw new NotFoundException('Quiz attempt not found');
        }

        if (!summary.completedAt) {
            throw new BadRequestException(
                'Quiz attempt must be completed before sending email',
            );
        }

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
