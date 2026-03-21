import { WritingSubmission } from '../entities/writing-submission.entity';
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

    private constructor(props: WritingSubmissionResponseDto) {
        Object.assign(this, props);
    }

    static fromEntity(submission: WritingSubmission): WritingSubmissionResponseDto {
        return new WritingSubmissionResponseDto({
            id: submission.id,
            taskId: submission.taskId,
            userId: submission.userId,
            content: submission.content,
            feedback: submission.feedback,
            score: submission.score,
            submittedAt: submission.submittedAt,
            reviewedAt: submission.reviewedAt,
        });
    }

    static fromEntities(submissions: WritingSubmission[]): WritingSubmissionResponseDto[] {
        return submissions.map(WritingSubmissionResponseDto.fromEntity);
    }
}