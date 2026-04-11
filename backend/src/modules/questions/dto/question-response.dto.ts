import { ApiProperty } from '@nestjs/swagger';
import { Question } from '../entities/question.entity';

export class QuestionResponseDto {
    @ApiProperty()
    readonly id: string;
    @ApiProperty()
    readonly question: string;
    @ApiProperty()
    readonly hints: string;
    @ApiProperty()
    readonly questionType: string;
    @ApiProperty()
    readonly createdAt: Date;

    private constructor(props: QuestionResponseDto) {
        Object.assign(this, props);
    }

    static fromEntity(question: Question): QuestionResponseDto {
        return new QuestionResponseDto({
            id: question.id,
            question: question.question,
            hints: question.hints,
            questionType: question.questionType,
            createdAt: question.createdAt,
        });
    }

    static fromEntities(questions: Question[]): QuestionResponseDto[] {
        return questions.map(QuestionResponseDto.fromEntity);
    }
}
