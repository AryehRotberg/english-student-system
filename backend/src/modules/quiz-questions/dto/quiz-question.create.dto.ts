import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsUUID } from 'class-validator';

export class QuizQuestionCreateDto {
    @IsUUID()
    @ApiProperty()
    quizId: string;

    @IsUUID()
    @ApiProperty()
    questionId: string;

    @Type(() => Number)
    @IsNumber()
    @ApiProperty()
    maxPoints: number;

    @Type(() => Number)
    @IsNumber()
    @ApiProperty()
    orderIndex: number;
}
