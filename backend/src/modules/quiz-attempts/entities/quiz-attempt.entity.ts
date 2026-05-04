import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'quiz_attempts' })
export class QuizAttempt {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'quiz_id', type: 'uuid' })
    quizId: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @Column({ type: 'numeric', default: 0 })
    points: number;

    @Column({ name: 'started_at', type: 'timestamp', default: () => 'NOW()' })
    startedAt: Date;

    @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
    completedAt: Date | null;
}
