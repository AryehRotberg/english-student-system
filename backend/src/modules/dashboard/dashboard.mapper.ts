import { Injectable } from '@nestjs/common';
import { AssignmentItemResponseDto } from '../assignment-items/dto/assignment-item.response.dto';
import { Assignment } from '../assignments/entities/assignment.entity';
import {
    ContentProgressRow,
    ProgressMetric,
    QuizProgressRow,
} from './types/dashboard.types';

const DEFAULT_ASSIGNMENT_DESCRIPTION = 'No assignment description.';

@Injectable()
export class DashboardMapper {
    toTask(item: AssignmentItemResponseDto) {
        return {
            id: item.id,
            title: item.title,
            description:
                item.assignmentDescription ?? DEFAULT_ASSIGNMENT_DESCRIPTION,
            dueDate: item.assignmentDueDate,
            category: this.mapContentTypeToCategory(item.contentType),
        };
    }

    toAssignmentTopic(item: AssignmentItemResponseDto) {
        return {
            id: item.id,
            assignmentTitle: item.assignmentTitle,
            assignmentDescription:
                item.assignmentDescription ?? DEFAULT_ASSIGNMENT_DESCRIPTION,
            topicTitle: item.title,
            contentType: item.contentType,
            contentId: item.contentId,
        };
    }

    toActivity(assignment: Assignment) {
        return {
            id: assignment.id,
            title: `Assigned: ${assignment.title}`,
            dueDate: assignment.dueDate,
            topicDescription:
                assignment.description ?? DEFAULT_ASSIGNMENT_DESCRIPTION,
        };
    }

    buildProgressMetrics(
        quizData: QuizProgressRow[],
        contentData: ContentProgressRow[],
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
                    percent,
                });
            }
        }
        return progress;
    }

    private mapContentTypeToCategory(contentType: string): string {
        const map: Record<string, string> = {
            quiz: 'grammar',
            text: 'reading',
            writing: 'grammar',
            vocabulary: 'vocabulary',
        };
        return map[contentType] || 'unknown';
    }
}
