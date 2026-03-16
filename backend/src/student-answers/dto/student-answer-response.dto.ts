import { StudentAnswer } from '../entities/student-answer.entity';

export class StudentAnswerResponseDto {
    readonly id: string;
    readonly attemptId: string;
    readonly questionId: string;
    readonly answerData: Record<string, unknown>;
    readonly createdAt: Date;
    readonly points: number | null;
    readonly feedback: string | null;

    private constructor(props: StudentAnswerResponseDto) {
        Object.assign(this, props);
    }

    static fromEntity(studentAnswer: StudentAnswer): StudentAnswerResponseDto {
        return new StudentAnswerResponseDto({
            id: studentAnswer.id,
            attemptId: studentAnswer.attemptId,
            questionId: studentAnswer.questionId,
            answerData: studentAnswer.answerData,
            createdAt: studentAnswer.createdAt,
            points: studentAnswer.points === null ? null : Number(studentAnswer.points),
            feedback: studentAnswer.feedback,
        });
    }

    static fromEntities(studentAnswers: StudentAnswer[]): StudentAnswerResponseDto[] {
        return studentAnswers.map(StudentAnswerResponseDto.fromEntity);
    }
}