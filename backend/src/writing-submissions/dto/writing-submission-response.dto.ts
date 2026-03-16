import { WritingSubmission } from '../entities/writing-submission.entity';

export class WritingSubmissionResponseDto {
    readonly id: string;
    readonly taskId: string;
    readonly userId: string;
    readonly content: string;
    readonly feedback: string | null;
    readonly score: number | null;
    readonly submittedAt: Date;
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