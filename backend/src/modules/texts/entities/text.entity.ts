import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Quiz } from '../../quizzes/entities/quiz.entity';
import { VocabularyTopic } from '../../vocabulary-topics/entities/vocabulary-topic.entity';

@Entity({ name: 'texts' })
export class Text {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text' })
    title: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ type: 'text' })
    level: string;

    @Column({ name: 'quiz_id', type: 'uuid', nullable: true })
    quizId: string | null;

    @ManyToOne(() => Quiz, { eager: false, nullable: true })
    @JoinColumn({ name: 'quiz_id' })
    quiz: Quiz | null;

    @ManyToOne(() => VocabularyTopic, { eager: false, nullable: true })
    @JoinColumn({ name: 'vocabulary_topic_id' })
    vocabularyTopic: VocabularyTopic | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
