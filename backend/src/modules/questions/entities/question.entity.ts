import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'questions' })
export class Question {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text' })
    question: string;

    @Column({ name: 'question_type', type: 'text' })
    questionType: string;

    @Column({ type: 'jsonb', nullable: true })
    hints: any | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
