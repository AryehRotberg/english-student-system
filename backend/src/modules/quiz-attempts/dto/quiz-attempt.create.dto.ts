import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class QuizAttemptCreateDto {
    @IsUUID()
    @ApiProperty()
    quizId: string;

    @IsString()
    @ApiProperty()
    quizTitle: string;
}
