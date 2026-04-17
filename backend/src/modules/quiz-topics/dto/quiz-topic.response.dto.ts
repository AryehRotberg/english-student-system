import { ApiProperty } from '@nestjs/swagger';

export class QuizTopicResponseDto {
    @ApiProperty()
    readonly id: string;
    @ApiProperty()
    readonly topic: string;
    @ApiProperty()
    readonly explanation: string;
}
