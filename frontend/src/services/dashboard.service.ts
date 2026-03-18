import { assignmentItemsService } from "./assignment-items.service";
import { assignmentsService } from "./assignments.service";
import { authService } from "./auth.service";
import { quizAttemptsService } from "./quiz-attempts.service";
import type { AssignmentApiItem } from "../types/api-items/assignment";
import type { AssignmentTopicApiItem } from "../types/api-items/assignment-topic";
import type { QuizAttemptApiItem } from "../types/api-items/quiz-attempt";
import type { DashboardData } from "../types/dashboard";
import type { ProgressItem } from "../types/progress";
import type { AssignmentTopic, DailyTask } from "../types/task";

class DashboardService {
    public async getOverview(): Promise<DashboardData> {
        const user = await authService.me();
        const [assignmentsRaw, assignmentItemsRaw] = await Promise.all([
            assignmentsService.listByUser(user.id),
            assignmentItemsService.listByUser(user.id),
        ]);

        const assignments = assignmentsRaw as AssignmentApiItem[];
        const assignmentItems = assignmentItemsRaw as AssignmentTopicApiItem[];

        const activeAssignmentItems = assignmentItems.filter(
            (item) => item.status !== "completed",
        );
        const tasks: DailyTask[] = activeAssignmentItems.map((item) => ({
            id: item.id,
            title: item.title,
            description:
                item.assignmentDescription ?? "No assignment description.",
            category:
                item.contentType === "quiz"
                    ? "grammar"
                    : item.contentType === "text"
                      ? "reading"
                      : "vocabulary",
        }));

        const assignmentTopics: AssignmentTopic[] = activeAssignmentItems
            .filter((item) => Boolean(item.contentId))
            .map((item) => ({
                id: item.id,
                assignmentTitle: item.assignmentTitle,
                assignmentDescription:
                    item.assignmentDescription ?? "No assignment description.",
                topicTitle: item.title,
                contentType: item.contentType,
                contentId: item.contentId,
            }));

        const assignedContentTypes = new Set(
            assignmentItems.map((item) => item.contentType),
        );
        const assignedQuizItems = assignmentItems.filter(
            (item) => item.contentType === "quiz" && Boolean(item.contentId),
        );

        const uniqueQuizIds = Array.from(
            new Set(assignedQuizItems.map((item) => item.contentId)),
        );
        const attemptEntries = await Promise.all(
            uniqueQuizIds.map(async (quizId) => {
                const attempts = (await quizAttemptsService.listByUserAndQuiz(
                    user.id,
                    quizId,
                )) as QuizAttemptApiItem[];
                return [quizId, attempts] as const;
            }),
        );
        const attemptsByQuizId = new Map<string, QuizAttemptApiItem[]>(
            attemptEntries,
        );

        const assignedQuizItemsCompleted = assignedQuizItems.filter((item) => {
            if (item.status === "completed") {
                return true;
            }

            const attempts = attemptsByQuizId.get(item.contentId) ?? [];
            return attempts.some((attempt) => attempt.completedAt !== null);
        }).length;

        const quizProgress =
            assignedQuizItems.length > 0
                ? Math.round(
                      (assignedQuizItemsCompleted / assignedQuizItems.length) *
                          100,
                  )
                : 0;

        const progressForType = (type: "text" | "writing") => {
            const items = assignmentItems.filter(
                (item) => item.contentType === type,
            );
            const total = items.length;
            const completed = items.filter(
                (item) => item.status === "completed",
            ).length;

            return total > 0 ? Math.round((completed / total) * 100) : 0;
        };

        const progress: ProgressItem[] = [];

        if (assignedContentTypes.has("quiz")) {
            progress.push({ id: "quiz", label: "Quiz", percent: quizProgress });
        }

        if (assignedContentTypes.has("text")) {
            progress.push({
                id: "reading",
                label: "Reading",
                percent: progressForType("text"),
            });
        }

        if (assignedContentTypes.has("writing")) {
            progress.push({
                id: "writing",
                label: "Writing",
                percent: progressForType("writing"),
            });
        }

        return {
            studentName: user.name,
            tasks,
            progress,
            assignmentTopics,
            activities: assignments.slice(0, 5).map((assignment) => ({
                id: assignment.id,
                title: `${assignment.status === "completed" ? "Completed" : "Assigned"}: ${assignment.title}`,
            })),
        };
    }
}

export const dashboardService = new DashboardService();
