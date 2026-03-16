import { Quiz } from "../entities/quiz.entity";

export class QuizResponseDto {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly createdAt: Date;

    private constructor(props: QuizResponseDto) {
        Object.assign(this, props);
    }

    static fromEntity(quiz: Quiz): QuizResponseDto {
        const props: QuizResponseDto = {
            id: quiz.id,
            title: quiz.title,
            description: quiz.description,
            createdAt: quiz.createdAt,
        };
        return new QuizResponseDto(props);
    }

    static fromEntities(quizzes: Quiz[]): QuizResponseDto[] {
        return quizzes.map(QuizResponseDto.fromEntity);
    }
}