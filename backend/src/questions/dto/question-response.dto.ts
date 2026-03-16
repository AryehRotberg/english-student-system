import { Question } from '../entities/question.entity';

export class QuestionResponseDto {
    readonly id: string;
    readonly question: string;
    readonly questionType: string;
    readonly audioUrl: string | null;
    readonly createdAt: Date;

    private constructor(props: QuestionResponseDto) {
        Object.assign(this, props);
    }

    static fromEntity(question: Question): QuestionResponseDto {
        return new QuestionResponseDto({
            id: question.id,
            question: question.question,
            questionType: question.questionType,
            audioUrl: question.audioUrl,
            createdAt: question.createdAt,
        });
    }

    static fromEntities(questions: Question[]): QuestionResponseDto[] {
        return questions.map(QuestionResponseDto.fromEntity);
    }
}