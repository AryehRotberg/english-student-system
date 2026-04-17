import { IsString, IsUUID } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class QuizAttemptQueryDto {
    @IsUUID()
    @IsString()
    @ApiProperty()
    userId: string;

    @IsUUID()
    @IsString()
    @ApiProperty()
    quizId: string;
}