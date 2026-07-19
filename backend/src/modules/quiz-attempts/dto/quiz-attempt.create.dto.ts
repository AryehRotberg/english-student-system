import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class QuizAttemptCreateDto {
    @IsUUID()
    @ApiProperty()
    quizId: string;
}
