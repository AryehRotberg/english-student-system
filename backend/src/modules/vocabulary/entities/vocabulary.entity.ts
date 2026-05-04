import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'vocabulary' })
export class Vocabulary {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text', nullable: true })
    word: string | null;

    @Column({ type: 'text', nullable: true })
    meaning: string | null;

    @Column({ type: 'text', nullable: true })
    example: string | null;

    @Column({ type: 'text', nullable: true })
    translation: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
