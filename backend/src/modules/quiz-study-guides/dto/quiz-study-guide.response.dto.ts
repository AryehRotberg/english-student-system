import { ApiProperty } from '@nestjs/swagger';

export class QuizStudyGuideResponseDto {
    @ApiProperty()
    readonly id: string;
    @ApiProperty()
    readonly topic: string;
    @ApiProperty()
    readonly explanation: string;
}
