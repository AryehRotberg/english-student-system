import { QuizAttempt } from "../entities/quiz-attempt.entity";

export class QuizAttemptResponseDto {
    readonly id: string;
    readonly userId: string;
    readonly quizId: string;
    readonly points: number | null;
    readonly startedAt: Date;
    readonly completedAt: Date | null;

    private constructor(props: QuizAttemptResponseDto) {
        Object.assign(this, props);
    }

    static fromEntity(quizAttempt: QuizAttempt): QuizAttemptResponseDto {
        const props: QuizAttemptResponseDto = {
            id: quizAttempt.id,
            userId: quizAttempt.userId,
            quizId: quizAttempt.quizId,
            points: quizAttempt.points === null ? null : Number(quizAttempt.points),
            startedAt: quizAttempt.startedAt,
            completedAt: quizAttempt.completedAt,
        };
        return new QuizAttemptResponseDto(props);
    }

    static fromEntities(quizAttempts: QuizAttempt[]): QuizAttemptResponseDto[] {
        return quizAttempts.map(QuizAttemptResponseDto.fromEntity);
    }
}