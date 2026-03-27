import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { NodemailerService } from '../../config/nodemailer';
import { PostgresService } from '../../config/postgres.client';
import { AssignmentCompletionEmailDto } from './dto/assignment-completion-email.dto';
import { SendEmailDto } from './dto/send-email.dto';
import {
    getAssignmentCompletionSummaryQuery,
    getTeacherEmailsQuery,
} from './send-email.queries';
import { htmlBody } from './templates/html-body.template';

type AssignmentCompletionSummary = {
    attemptId: string;
    studentName: string;
    studentEmail: string;
    quizTitle: string;
    points: number | string | null;
    completedAt: Date | null;
    totalPoints: number | string | null;
    assignmentTitle: string | null;
    completedItems: number | string | null;
    totalItems: number | string | null;
};

type TeacherRow = {
    name: string;
    email: string;
};

@Injectable()
export class SendEmailService {
    constructor(
        private readonly nodemailerService: NodemailerService,
        private readonly postgresService: PostgresService,
    ) {
        if (!process.env.FRONTEND_URL) {
            throw new Error('FRONTEND_URL environment variable is not set');
        }
    }

    async sendEmail(sendEmailDto: SendEmailDto) {
        const { name, email, subject, title, body } = sendEmailDto;

        const safeTitle = this.escapeHtml(title);
        const safeBody = this.escapeHtml(body)
            .replace(/\r\n|\r|\n/g, '<br/>')
            .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
        const portalUrl = process.env.FRONTEND_URL!;

        const renderedHtml = htmlBody(
            {
                name,
                title: safeTitle,
                body: safeBody,
            },
            portalUrl,
        );

        return await this.nodemailerService.sendEmail(
            email,
            subject,
            renderedHtml,
        );
    }

    async sendAssignmentCompletionEmail(
        assignmentCompletionEmailDto: AssignmentCompletionEmailDto,
    ) {
        const [summary] =
            await this.postgresService.query<AssignmentCompletionSummary>(
                getAssignmentCompletionSummaryQuery,
                [assignmentCompletionEmailDto.attemptId],
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
        const escapedTitle = this.escapeHtml(
            `${summary.assignmentTitle ?? 'Assignment'} completed`,
        );
        const escapedBody = this.escapeHtml(
            `${summary.studentName} has completed "${summary.quizTitle}". Review the latest score and assignment progress summary below.`,
        );

        const templateData = {
            title: escapedTitle,
            body: escapedBody,
            assignmentTitle: this.escapeHtml(
                summary.assignmentTitle ?? 'Assignment',
            ),
            quizTitle: this.escapeHtml(summary.quizTitle),
            earnedPoints: this.formatNumber(earnedPoints),
            totalPoints: this.formatNumber(totalPoints),
            scorePercent,
            completedItems,
            totalItems,
            progressPercent,
        };

        const subject = `${summary.studentName} completed ${summary.assignmentTitle ?? 'assignment'}: ${scorePercent}% score, ${progressPercent}% progress`;

        const teacherRows = await this.postgresService.query<TeacherRow>(
            getTeacherEmailsQuery,
        );

        if (teacherRows.length === 0) {
            throw new NotFoundException(
                'No teacher email recipients found for completion notifications',
            );
        }

        return await Promise.all(
            teacherRows.map((teacher) =>
                this.nodemailerService.sendEmail(
                    teacher.email,
                    subject,
                    htmlBody(
                        {
                            ...templateData,
                            name: this.escapeHtml(teacher.name),
                        },
                        portalUrl,
                    ),
                ),
            ),
        );
    }

    private escapeHtml(value: string): string {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    private formatNumber(value: number): string {
        if (Number.isInteger(value)) {
            return value.toString();
        }

        return value.toFixed(2).replace(/\.00$/, '');
    }
}
