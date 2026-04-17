import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StudentAnswerResponseDto {
    @ApiProperty()
    readonly id: string;
    @ApiProperty()
    readonly attemptId: string;
    @ApiProperty()
    readonly questionId: string;
    @ApiProperty()
    readonly blankIndex: number;
    @ApiPropertyOptional()
    readonly selectedOptionId: string | null;
    @ApiPropertyOptional()
    readonly textAnswer: string | null;
    @ApiProperty()
    readonly createdAt: Date;
    @ApiPropertyOptional()
    readonly points: number | null;
}
