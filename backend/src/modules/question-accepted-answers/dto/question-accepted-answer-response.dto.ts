import { QuestionAcceptedAnswer } from '../entities/question-accepted-answer.entity';
import { ApiProperty } from '@nestjs/swagger';

export class QuestionAcceptedAnswerResponseDto {
    @ApiProperty()
    readonly id: string;
    @ApiProperty()
    readonly questionId: string;
    @ApiProperty()
    readonly answer: string;
    @ApiProperty()
    readonly blankIndex: number;
    @ApiProperty()
    readonly createdAt: Date;

    private constructor(props: QuestionAcceptedAnswerResponseDto) {
        Object.assign(this, props);
    }

    static fromEntity(answer: QuestionAcceptedAnswer): QuestionAcceptedAnswerResponseDto {
        return new QuestionAcceptedAnswerResponseDto({
            id: answer.id,
            questionId: answer.questionId,
            answer: answer.answer,
            blankIndex: Number(answer.blankIndex),
            createdAt: answer.createdAt,
        });
    }

    static fromEntities(answers: QuestionAcceptedAnswer[]): QuestionAcceptedAnswerResponseDto[] {
        return answers.map(QuestionAcceptedAnswerResponseDto.fromEntity);
    }
}
