import { ApiProperty } from '@nestjs/swagger';

export class QuestionChoiceResponseDto {
    @ApiProperty()
    readonly id: string;
    @ApiProperty()
    readonly questionId: string;
    @ApiProperty()
    readonly optionText: string;
    @ApiProperty()
    readonly isCorrect: boolean;
    @ApiProperty()
    readonly createdAt: Date;
}
