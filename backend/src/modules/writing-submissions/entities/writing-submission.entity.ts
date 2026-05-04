import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'writing_submissions' })
export class WritingSubmission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'task_id', type: 'uuid' })
    taskId: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ type: 'text', nullable: true })
    feedback: string | null;

    @Column({ type: 'numeric', nullable: true })
    score: number | null;

    @CreateDateColumn({ name: 'submitted_at' })
    submittedAt: Date;

    @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
    reviewedAt: Date | null;
}
