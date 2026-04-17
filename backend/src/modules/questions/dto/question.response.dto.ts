import { ApiProperty } from '@nestjs/swagger';

export class QuestionResponseDto {
    @ApiProperty()
    readonly id: string;
    @ApiProperty()
    readonly question: string;
    @ApiProperty()
    readonly hints: string;
    @ApiProperty()
    readonly questionType: string;
    @ApiProperty()
    readonly createdAt: Date;
}
