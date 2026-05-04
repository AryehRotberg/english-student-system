import { ApiProperty } from '@nestjs/swagger';

export class QuizQuestionResponseDto {
    @ApiProperty()
    readonly id: string;
    @ApiProperty()
    readonly quizId: string;
    @ApiProperty()
    readonly questionId: string;
    @ApiProperty()
    readonly question: string;
    @ApiProperty()
    readonly questionType: string;
    @ApiProperty()
    readonly maxPoints: number;
}
