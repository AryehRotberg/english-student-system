import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Question } from '../../questions/entities/question.entity';
import { Quiz } from '../../quizzes/entities/quiz.entity';

@Entity({ name: 'quiz_questions' })
export class QuizQuestion {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'quiz_id', type: 'uuid' })
    quizId: string;

    @Column({ name: 'question_id', type: 'uuid' })
    questionId: string;

    @Column({ name: 'max_points', type: 'numeric' })
    maxPoints: number;

    @Column({ name: 'order_index', type: 'int', nullable: true })
    orderIndex: number | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => Quiz, { eager: false })
    @JoinColumn({ name: 'quiz_id' })
    quiz: Quiz;

    @ManyToOne(() => Question, { eager: false })
    @JoinColumn({ name: 'question_id' })
    question: Question;
}
