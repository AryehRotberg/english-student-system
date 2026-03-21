import { Answer } from '../entities/answer.entity';
import { ApiProperty } from '@nestjs/swagger';

export class AnswerResponseDto {
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
