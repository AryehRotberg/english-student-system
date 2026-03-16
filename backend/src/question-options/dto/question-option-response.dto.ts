import { QuestionOption } from "../entities/question-option.entity";

export class QuestionOptionResponseDto {
    readonly id: string;
    readonly questionId: string;
    readonly optionText: string;
    readonly isCorrect: boolean;
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