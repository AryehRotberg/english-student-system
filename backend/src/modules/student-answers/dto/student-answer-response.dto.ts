import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StudentAnswer } from '../entities/student-answer.entity';

export class StudentAnswerResponseDto {
    @ApiProperty()
    readonly id: string;
    @ApiProperty()
    readonly attemptId: string;
    @ApiProperty()
    readonly questionId: string;
    @ApiProperty()
    readonly blankIndex: number;
    @ApiPropertyOptional()
    readonly selectedOptionId: string | null;
    @ApiPropertyOptional()
    readonly textAnswer: string | null;
    @ApiProperty()
    readonly createdAt: Date;
    @ApiPropertyOptional()
    readonly points: number | null;

    private constructor(props: StudentAnswerResponseDto) {
        Object.assign(this, props);
    }

    static fromEntity(studentAnswer: StudentAnswer): StudentAnswerResponseDto {
        return new StudentAnswerResponseDto({
            id: studentAnswer.id,
            attemptId: studentAnswer.attemptId,
            questionId: studentAnswer.questionId,
            blankIndex: studentAnswer.blankIndex,
            selectedOptionId: studentAnswer.selectedOptionId,
            textAnswer: studentAnswer.textAnswer,
            createdAt: studentAnswer.createdAt,
            points:
                studentAnswer.points === null
                    ? null
                    : Number(studentAnswer.points),
        });
    }

    static fromEntities(
        studentAnswers: StudentAnswer[],
    ): StudentAnswerResponseDto[] {
        return studentAnswers.map(StudentAnswerResponseDto.fromEntity);
    }
}
