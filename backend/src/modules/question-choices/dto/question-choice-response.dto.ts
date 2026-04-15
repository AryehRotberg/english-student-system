import { QuestionChoice } from "../entities/question-choice.entity";
import { ApiProperty } from '@nestjs/swagger';

export class QuestionChoiceResponseDto {
    @ApiProperty()
    readonly id: string;
    @ApiProperty()
    readonly questionId: string;
    @ApiProperty()
    readonly optionText: string;
    @ApiProperty()
    readonly isCorrect: boolean;
    @ApiProperty()
    readonly createdAt: Date;

    private constructor(props: QuestionChoiceResponseDto) {
        Object.assign(this, props);
    }

    static fromEntity(questionChoice: QuestionChoice): QuestionChoiceResponseDto {
        const props: QuestionChoiceResponseDto = {
            id: questionChoice.id,
            questionId: questionChoice.questionId,
            optionText: questionChoice.optionText,
            isCorrect: questionChoice.isCorrect,
            createdAt: questionChoice.createdAt,
        };
        return new QuestionChoiceResponseDto(props);
    }

    static fromEntities(questionChoices: QuestionChoice[]): QuestionChoiceResponseDto[] {
        return questionChoices.map(QuestionChoiceResponseDto.fromEntity);
    }
}