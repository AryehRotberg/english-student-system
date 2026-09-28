import type { QuizQuestion } from '../types/quiz';

/**
 * The most an attempt can score. On an "answer N of M" exam only N answers
 * count, so the possible total is the sum of the N largest question weights.
 */
export function possiblePoints(
    maxPoints: number[],
    questionsToAnswer: number | null | undefined,
): number {
    const weights = maxPoints.map(Number);

    if (!questionsToAnswer || questionsToAnswer >= weights.length) {
        return weights.reduce((sum, points) => sum + points, 0);
    }

    return [...weights]
        .sort((a, b) => b - a)
        .slice(0, questionsToAnswer)
        .reduce((sum, points) => sum + points, 0);
}

/** "1:05:09" / "05:09" for a countdown. */
export function formatDuration(milliseconds: number): string {
    const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (value: number) => String(value).padStart(2, '0');

    return hours > 0
        ? `${hours}:${pad(minutes)}:${pad(seconds)}`
        : `${pad(minutes)}:${pad(seconds)}`;
}

export function remainingTime(
    startedAt: string,
    timeLimitMinutes: number,
    now: number,
): number {
    return new Date(startedAt).getTime() + timeLimitMinutes * 60_000 - now;
}

export function isHandwritten(question: Pick<QuizQuestion, 'questionType'>) {
    return question.questionType === 'handwritten';
}

/**
 * A handwritten question is answered once it has at least one uploaded page;
 * any other question once the student saved an answer for it.
 */
export function answeredQuestionIds(
    questions: QuizQuestion[],
    answeredIds: Set<string>,
    questionIdsWithFiles: Set<string>,
): Set<string> {
    return new Set(
        questions
            .filter((q) =>
                isHandwritten(q)
                    ? questionIdsWithFiles.has(q.questionId)
                    : answeredIds.has(q.questionId),
            )
            .map((q) => q.questionId),
    );
}
