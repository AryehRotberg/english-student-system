import { ApiProperty } from '@nestjs/swagger';

export class QuizAttemptResponseDto {
    @ApiProperty()
    readonly id: string;
    @ApiProperty()
    readonly userId: string;
    @ApiProperty()
    readonly quizId: string;
    @ApiProperty()
    readonly points: number | null;
    @ApiProperty()
    readonly startedAt: Date;
    @ApiProperty()
    readonly completedAt: Date | null;
}
