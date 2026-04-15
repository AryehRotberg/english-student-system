import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { AssignmentItemsService } from '../assignment-items/assignment-items.service';
import { AssignmentItemResponseDto } from '../assignment-items/dto/assignment-item-response.dto';
import { AssignmentsService } from '../assignments/assignments.service';
import { AssignmentResponseDto } from '../assignments/dto/assignment-response.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { ProgressMetric } from './entities/progress-metric';

const DEFAULT_ASSIGNMENT_DESCRIPTION = 'No assignment description.';

@Injectable()
export class DashboardService {
    constructor(
        private readonly pgService: PostgresService,
        private readonly assignmentItemsService: AssignmentItemsService,
        private readonly assignmentsService: AssignmentsService,
    ) {}

    async getOverview(user: UserResponseDto) {
        const userId = user.id;

        const [
            assignments,
            assignmentItems,
            quizProgressRaw,
            contentProgressRaw,
        ] = await Promise.all([
            this.assignmentsService.findByUserId({ userId }),
            this.assignmentItemsService.findByUserId({ userId }),
            this.pgService.query<any>(
                this.pgService.getSql(__dirname, 'get-quiz-progress.sql'),
                [userId],
            ),
            this.pgService.query<any>(
                this.pgService.getSql(__dirname, 'get-content-progress.sql'),
                [userId],
            ),
        ]);

        const activeAssignmentItems = assignmentItems.filter(
            (item) => !item.isCompleted,
        );

        return {
            studentName: user.name,
            tasks: activeAssignmentItems.map((item) => this.toTask(item)),
            assignmentTopics: activeAssignmentItems
                .filter((item) => Boolean(item.contentId))
                .map((item) => this.toAssignmentTopic(item)),
            activities: assignments
                .filter((a) => !a.isCompleted)
                .slice(0, 5)
                .map((a) => this.toActivity(a)),
            progress: this.buildProgressMetrics(
                quizProgressRaw,
                contentProgressRaw,
            ),
        };
    }

    private buildProgressMetrics(
        quizData: any[],
        contentData: any[],
    ): ProgressMetric[] {
        const progress: ProgressMetric[] = [];

        if (quizData.length > 0) {
            const totalPercent = quizData.reduce((sum, row) => {
                if (row.completedAt || row.assignmentStatus === true)
                    return sum + 100;
                if (row.totalQuestions === 0) return sum;
                return (
                    sum +
                    Math.min(
                        100,
                        Math.round(
                            (row.answeredQuestions / row.totalQuestions) * 100,
                        ),
                    )
                );
            }, 0);

            progress.push({
                id: 'quiz',
                label: 'Quiz',
                percent: Math.round(totalPercent / quizData.length),
            });
        }

        for (const row of contentData) {
            if (row.contentType === 'text' || row.contentType === 'writing') {
                const percent =
                    row.totalItems > 0
                        ? Math.round(
                              (row.completedItems / row.totalItems) * 100,
                          )
                        : 0;

                progress.push({
                    id: row.contentType === 'text' ? 'reading' : 'writing',
                    label: row.contentType === 'text' ? 'Reading' : 'Writing',
                    percent: percent,
                });
            }
        }

        return progress;
    }

    private mapContentTypeToCategory(contentType: string): string {
        switch (contentType) {
            case 'quiz':
                return 'grammar';
            case 'text':
                return 'reading';
            case 'writing':
                return 'grammar';
            default:
                return 'vocabulary';
        }
    }

    private toTask(item: AssignmentItemResponseDto) {
        return {
            id: item.id,
            title: item.title,
            description: this.getAssignmentDescription(
                item.assignmentDescription,
            ),
            dueDate: item.assignmentDueDate,
            category: this.mapContentTypeToCategory(item.contentType),
        };
    }

    private toAssignmentTopic(item: AssignmentItemResponseDto) {
        return {
            id: item.id,
            assignmentTitle: item.assignmentTitle,
            assignmentDescription: this.getAssignmentDescription(
                item.assignmentDescription,
            ),
            topicTitle: item.title,
            contentType: item.contentType,
            contentId: item.contentId,
        };
    }

    private toActivity(assignment: AssignmentResponseDto) {
        return {
            id: assignment.id,
            title: `Assigned: ${assignment.title}`,
            dueDate: assignment.dueDate,
            topicDescription: this.getAssignmentDescription(
                assignment.description,
            ),
        };
    }

    private getAssignmentDescription(description: string | null | undefined) {
        return description ?? DEFAULT_ASSIGNMENT_DESCRIPTION;
    }
}
