import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Question } from '../../questions/entities/question.entity';

@Entity({ name: 'question_choices' })
export class QuestionChoice {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'question_id', type: 'uuid' })
    questionId: string;

    @Column({ name: 'option_text', type: 'text' })
    optionText: string;

    @Column({ name: 'is_correct', type: 'boolean' })
    isCorrect: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => Question, { eager: false })
    @JoinColumn({ name: 'question_id' })
    question: Question;
}
