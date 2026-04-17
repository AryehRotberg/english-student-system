import { IsUUID, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class QuizQuestionQueryDto {
    @IsUUID()
    @IsString()
    @ApiProperty()
    quizId: string;
}