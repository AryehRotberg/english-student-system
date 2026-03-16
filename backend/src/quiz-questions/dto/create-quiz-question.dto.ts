import { Type } from 'class-transformer';
import { IsNumber, IsUUID } from 'class-validator';

export class CreateQuizQuestionDto {
    @IsUUID()
    quizId: string;

    @IsUUID()
    questionId: string;

    @Type(() => Number)
    @IsNumber()
    maxPoints: number;
}