import { ApiProperty } from '@nestjs/swagger';

export class QuestionAcceptedAnswerResponseDto {
    @ApiProperty()
    readonly id: string;
    @ApiProperty()
    readonly questionId: string;
    @ApiProperty()
    readonly answer: string;
    @ApiProperty()
    readonly blankIndex: number;
    @ApiProperty()
    readonly createdAt: Date;
}
