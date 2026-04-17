import { ApiProperty } from '@nestjs/swagger';

interface Quiz {
    id: string;
    title: string;
    description: string;
    createdAt: Date;
}

export class QuizResponseDto {
    @ApiProperty()
    readonly id: string;
    @ApiProperty()
    readonly title: string;
    @ApiProperty()
    readonly description: string;
    @ApiProperty()
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