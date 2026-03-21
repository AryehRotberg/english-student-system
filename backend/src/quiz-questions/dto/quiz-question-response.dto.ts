import { QuizQuestion } from "../entities/quiz-question";
import { ApiProperty } from '@nestjs/swagger';

export class QuizQuestionResponseDto {
    @ApiProperty()
    readonly id: string;
    @ApiProperty()
    readonly quizId: string;
    @ApiProperty()
    readonly questionId: string;
    @ApiProperty()
    readonly question: string;
    @ApiProperty()
    readonly questionType: string;
    @ApiProperty()
    readonly audioUrl: string | null;
    @ApiProperty()
    readonly maxPoints: number;

    private constructor(props: QuizQuestionResponseDto) {
        Object.assign(this, props);
    }

    static fromEntity(quiz: QuizQuestion): QuizQuestionResponseDto {
        const props: QuizQuestionResponseDto = {
            id: quiz.id,
            quizId: quiz.quizId,
            questionId: quiz.questionId,
            question: quiz.question,
            questionType: quiz.questionType,
            audioUrl: quiz.audioUrl,
            maxPoints: Number(quiz.maxPoints),
        };
        return new QuizQuestionResponseDto(props);
    }

    static fromEntities(quizzes: QuizQuestion[]): QuizQuestionResponseDto[] {
        return quizzes.map(QuizQuestionResponseDto.fromEntity);
    }
}