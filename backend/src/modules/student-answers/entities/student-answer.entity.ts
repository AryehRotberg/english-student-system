import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'student_answers' })
export class StudentAnswer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'attempt_id', type: 'uuid' })
    attemptId: string;

    @Column({ name: 'question_id', type: 'uuid' })
    questionId: string;

    @Column({ name: 'selected_option_id', type: 'uuid', nullable: true })
    selectedOptionId: string | null;

    @Column({ name: 'text_answer', type: 'text', nullable: true })
    textAnswer: string | null;

    @Column({ name: 'blank_index', type: 'numeric', nullable: true })
    blankIndex: number | null;

    @Column({ type: 'numeric', nullable: true })
    points: number | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
