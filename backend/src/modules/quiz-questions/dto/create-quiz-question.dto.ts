import { Type } from 'class-transformer';
import { IsNumber, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuizQuestionDto {
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
}