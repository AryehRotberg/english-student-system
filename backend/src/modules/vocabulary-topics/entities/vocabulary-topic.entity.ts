import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'vocabulary_topics' })
export class VocabularyTopic {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text' })
    topic: string;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
