import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { UserResponseDto } from '../users/dto/user-response.dto';
import {
    getActiveTasksQuery,
    getContentProgressQuery,
    getQuizProgressQuery,
    getRecentActivitiesQuery,
} from './dashboard.queries';

@Injectable()
export class DashboardService {
    constructor(private readonly postgresService: PostgresService) {}

    async getOverview(user: UserResponseDto) {
        const userId = user.id;

        const [tasksRaw, quizProgressRaw, contentProgressRaw, activitiesRaw] =
            await Promise.all([
                this.postgresService.query<any>(getActiveTasksQuery, [userId]),
                this.postgresService.query<any>(getQuizProgressQuery, [userId]),
                this.postgresService.query<any>(getContentProgressQuery, [
                    userId,
                ]),
                this.postgresService.query<any>(getRecentActivitiesQuery, [
                    userId,
                ]),
            ]);

        const tasks = tasksRaw.map((row) => ({
            id: row.itemId,
            title: row.contentTitle,
            description:
                row.assignmentDescription ?? 'No assignment description.',
            dueDate: row.assignmentDueDate,
            category: this.mapContentTypeToCategory(row.contentType),
        }));

        const assignmentTopics = tasksRaw
            .filter((row) => Boolean(row.contentId))
            .map((row) => ({
                id: row.itemId,
                assignmentTitle: row.assignmentTitle,
                assignmentDescription:
                    row.assignmentDescription ?? 'No assignment description.',
                topicTitle: row.contentTitle,
                contentType: row.contentType,
                contentId: row.contentId,
            }));

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

        const activities = activitiesRaw.map((row) => {
            const dueDate = row.dueDate ?? row.due_date ?? null;
            const topicDescription =
                row.topicDescription ?? row.topicdescription;

            return {
                id: row.id,
                title: `${row.status === 'completed' ? 'Completed' : 'Assigned'}: ${row.title}`,
                dueDate,
                topicDescription:
                    topicDescription ?? 'No assignment description.',
            };
        });

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
}
