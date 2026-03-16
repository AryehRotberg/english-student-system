import { Answer } from '../entities/answer.entity';

export class AnswerResponseDto {
    readonly id: string;
    readonly questionId: string;
    readonly answer: string;
    readonly blankIndex: number;
    readonly createdAt: Date;

    private constructor(props: AnswerResponseDto) {
        Object.assign(this, props);
    }

    static fromEntity(answer: Answer): AnswerResponseDto {
        return new AnswerResponseDto({
            id: answer.id,
            questionId: answer.questionId,
            answer: answer.answer,
            blankIndex: Number(answer.blankIndex),
            createdAt: answer.createdAt,
        });
    }

    static fromEntities(answers: Answer[]): AnswerResponseDto[] {
        return answers.map(AnswerResponseDto.fromEntity);
    }
}