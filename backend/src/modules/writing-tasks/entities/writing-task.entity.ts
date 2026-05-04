import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'writing_tasks' })
export class WritingTask {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text' })
    title: string;

    @Column({ type: 'text' })
    instructions: string;

    @Column({ name: 'min_words', type: 'int', nullable: true })
    minWords: number | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
