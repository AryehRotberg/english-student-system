import { ApiProperty } from '@nestjs/swagger';

export class WritingSubmissionResponseDto {
    @ApiProperty()
    readonly id: string;
    @ApiProperty()
    readonly taskId: string;
    @ApiProperty()
    readonly userId: string;
    @ApiProperty()
    readonly content: string;
    @ApiProperty()
    readonly feedback: string | null;
    @ApiProperty()
    readonly score: number | null;
    @ApiProperty()
    readonly submittedAt: Date;
    @ApiProperty()
    readonly reviewedAt: Date | null;
}
