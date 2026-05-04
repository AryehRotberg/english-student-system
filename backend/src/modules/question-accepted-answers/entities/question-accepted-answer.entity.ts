import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Question } from '../../questions/entities/question.entity';

@Entity({ name: 'question_accepted_answers' })
export class QuestionAcceptedAnswer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'question_id', type: 'uuid' })
    questionId: string;

    @Column({ type: 'text' })
    answer: string;

    @Column({ name: 'blank_index', type: 'int' })
    blankIndex: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => Question, { eager: false })
    @JoinColumn({ name: 'question_id' })
    question: Question;
}
