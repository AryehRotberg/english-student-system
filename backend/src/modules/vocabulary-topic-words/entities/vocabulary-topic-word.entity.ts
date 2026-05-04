import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { VocabularyTopic } from '../../vocabulary-topics/entities/vocabulary-topic.entity';
import { Vocabulary } from '../../vocabulary/entities/vocabulary.entity';

@Entity({ name: 'vocabulary_topic_words' })
export class VocabularyTopicWord {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'vocabulary_id', type: 'uuid' })
    vocabularyId: string;

    @Column({ name: 'topic_id', type: 'uuid' })
    topicId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => Vocabulary, { eager: false })
    @JoinColumn({ name: 'vocabulary_id' })
    vocabulary: Vocabulary;

    @ManyToOne(() => VocabularyTopic, { eager: false })
    @JoinColumn({ name: 'topic_id' })
    topic: VocabularyTopic;
}
