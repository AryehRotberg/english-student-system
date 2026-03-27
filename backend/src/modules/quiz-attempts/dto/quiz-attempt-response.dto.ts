import { QuizAttempt } from "../entities/quiz-attempt.entity";
import { ApiProperty } from '@nestjs/swagger';

export class QuizAttemptResponseDto {
    @ApiProperty()
    readonly id: string;
    @ApiProperty()
    readonly userId: string;
    @ApiProperty()
    readonly quizId: string;
    @ApiProperty()
    readonly points: number | null;
    @ApiProperty()
    readonly startedAt: Date;
    @ApiProperty()
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