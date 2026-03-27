import { StudentAnswer } from '../entities/student-answer.entity';
import { ApiProperty } from '@nestjs/swagger';

export class StudentAnswerResponseDto {
    @ApiProperty()
    readonly id: string;
    @ApiProperty()
    readonly attemptId: string;
    @ApiProperty()
    readonly questionId: string;
    @ApiProperty()
    readonly answerData: Record<string, unknown>;
    @ApiProperty()
    readonly createdAt: Date;
    @ApiProperty()
    readonly points: number | null;
    @ApiProperty()
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