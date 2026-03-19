import type { AssignmentApiItem } from "../types/api-items/assignment";
import type { AssignmentTopicApiItem } from "../types/api-items/assignment-topic";
import type { QuizQuestionApiItem } from "../types/api-items/quiz-question";
import type { DashboardData } from "../types/dashboard";
import type { ProgressItem } from "../types/progress";
import type { AssignmentTopic, DailyTask } from "../types/task";
import { assignmentItemsService } from "./assignment-items.service";
import { assignmentsService } from "./assignments.service";
import { authService } from "./auth.service";
import { quizAttemptsService } from "./quiz-attempts.service";
import { quizQuestionsService } from "./quiz-questions.service";
import {
    studentAnswersService,
    type StudentAnswerApiItem,
} from "./student-answers.service";

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
                      : item.contentType === "writing"
                        ? "grammar"
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

        const quizProgressSources = await Promise.all(
            uniqueQuizIds.map(async (quizId) => {
                const [attempts, quizQuestionsRaw] = await Promise.all([
                    quizAttemptsService.listByUserAndQuizSorted(
                        user.id,
                        quizId,
                    ),
                    quizQuestionsService.listByQuiz(quizId),
                ]);

                const quizQuestions = quizQuestionsRaw as QuizQuestionApiItem[];
                const totalQuestions = new Set(
                    quizQuestions.map((question) => question.questionId),
                ).size;
                const activeAttempt =
                    attempts.find((attempt) => attempt.completedAt === null) ??
                    null;
                const latestAttempt = attempts[0] ?? null;
                const selectedAttempt = activeAttempt ?? latestAttempt;

                return {
                    quizId,
                    totalQuestions,
                    selectedAttempt,
                };
            }),
        );

        const attemptIdsNeedingAnswerCounts = quizProgressSources
            .filter(
                (entry) =>
                    Boolean(entry.selectedAttempt) &&
                    entry.selectedAttempt?.completedAt === null &&
                    entry.totalQuestions > 0,
            )
            .map((entry) => entry.selectedAttempt!.id);

        const allStudentAnswers =
            attemptIdsNeedingAnswerCounts.length > 0
                ? ((await studentAnswersService.list()) as StudentAnswerApiItem[])
                : [];

        const answeredCountByAttemptId = new Map<string, number>();
        for (const attemptId of attemptIdsNeedingAnswerCounts) {
            const attemptAnswers = allStudentAnswers.filter(
                (answer) => answer.attemptId === attemptId,
            );
            const answeredQuestionCount = new Set(
                attemptAnswers.map((answer) => answer.questionId),
            ).size;
            answeredCountByAttemptId.set(attemptId, answeredQuestionCount);
        }

        const quizPercentByQuizId = new Map<string, number>(
            quizProgressSources.map((entry) => {
                if (!entry.selectedAttempt || entry.totalQuestions === 0) {
                    return [entry.quizId, 0] as const;
                }

                if (entry.selectedAttempt.completedAt !== null) {
                    return [entry.quizId, 100] as const;
                }

                const answeredCount =
                    answeredCountByAttemptId.get(entry.selectedAttempt.id) ?? 0;
                const relativePercent = Math.round(
                    (answeredCount / entry.totalQuestions) * 100,
                );

                return [entry.quizId, Math.min(100, relativePercent)] as const;
            }),
        );

        const quizProgress =
            assignedQuizItems.length > 0
                ? Math.round(
                      assignedQuizItems.reduce((sum, item) => {
                          if (item.status === "completed") {
                              return sum + 100;
                          }

                          return (
                              sum +
                              (quizPercentByQuizId.get(item.contentId) ?? 0)
                          );
                      }, 0) / assignedQuizItems.length,
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
