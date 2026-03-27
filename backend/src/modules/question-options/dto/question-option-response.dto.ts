import { QuestionOption } from "../entities/question-option.entity";
import { ApiProperty } from '@nestjs/swagger';

export class QuestionOptionResponseDto {
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

    private constructor(props: QuestionOptionResponseDto) {
        Object.assign(this, props);
    }

    static fromEntity(questionOption: QuestionOption): QuestionOptionResponseDto {
        const props: QuestionOptionResponseDto = {
            id: questionOption.id,
            questionId: questionOption.questionId,
            optionText: questionOption.optionText,
            isCorrect: questionOption.isCorrect,
            createdAt: questionOption.createdAt,
        };
        return new QuestionOptionResponseDto(props);
    }

    static fromEntities(questionOptions: QuestionOption[]): QuestionOptionResponseDto[] {
        return questionOptions.map(QuestionOptionResponseDto.fromEntity);
    }
}