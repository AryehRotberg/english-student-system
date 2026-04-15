import { Type } from 'class-transformer';
import { IsNumber, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuestionAcceptedAnswerDto {
    @IsUUID()
    @ApiProperty()
    questionId: string;

    @IsString()
    @ApiProperty()
    answer: string;

    @Type(() => Number)
    @IsNumber()
    @ApiProperty()
    blankIndex: number;
}
