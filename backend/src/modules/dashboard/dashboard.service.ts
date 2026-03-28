import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { AssignmentItemsService } from '../assignment-items/assignment-items.service';
import { AssignmentsService } from '../assignments/assignments.service';
import { AssignmentItemResponseDto } from '../assignment-items/dto/assignment-item-response.dto';
import { AssignmentResponseDto } from '../assignments/dto/assignment-response.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import {
    getContentProgressQuery,
    getQuizProgressQuery,
} from './dashboard.queries';

const DEFAULT_ASSIGNMENT_DESCRIPTION = 'No assignment description.';

@Injectable()
export class DashboardService {
    constructor(
        private readonly postgresService: PostgresService,
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
            this.postgresService.query<any>(getQuizProgressQuery, [userId]),
            this.postgresService.query<any>(getContentProgressQuery, [userId]),
        ]);

        const activeAssignmentItems = assignmentItems.filter(
            (item) => item.status !== 'completed',
        );

        const tasks = activeAssignmentItems.map((item) => this.toTask(item));

        const assignmentTopics = activeAssignmentItems
            .filter((item) => Boolean(item.contentId))
            .map((item) => this.toAssignmentTopic(item));

        const progress: { id: string; label: string; percent: number }[] = [];

        if (quizProgressRaw.length > 0) {
            const totalQuizPercent = quizProgressRaw.reduce((sum, row) => {
                if (row.completedAt || row.assignmentStatus === 'completed')
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
                percent: Math.round(totalQuizPercent / quizProgressRaw.length),
            });
        }

        for (const row of contentProgressRaw) {
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

        const activities = assignments
            .filter((assignment) => assignment.status === 'assigned')
            .slice(0, 5)
            .map((assignment) => this.toActivity(assignment));

        return {
            studentName: user.name,
            tasks,
            progress,
            assignmentTopics,
            activities,
        };
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
