import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
    Unique,
} from 'typeorm';

export enum QuizCategory {
    GRAMMAR = 'GRAMMAR',
    VOCABULARY = 'VOCABULARY',
    READING = 'READING',
    LISTENING = 'LISTENING',
    CUSTOM = 'CUSTOM',
}

export enum ProficiencyLevel {
    A1 = 'A1',
    A2 = 'A2',
    B1 = 'B1',
    B2 = 'B2',
    C1 = 'C1',
    C2 = 'C2',
    ANY = 'ANY',
}

@Entity({ name: 'quizzes' })
@Index(['category', 'level'])
@Unique('UQ_QUIZ_TITLE_LEVEL', ['title', 'level'])
export class Quiz {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text' })
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Column({ type: 'enum', enum: QuizCategory, default: QuizCategory.CUSTOM })
    category: QuizCategory;

    @Column({
        name: 'proficiency_level',
        type: 'enum',
        enum: ProficiencyLevel,
        default: ProficiencyLevel.ANY,
    })
    level: ProficiencyLevel;

    @Column({ type: 'text', array: true, default: '{}' })
    tags: string[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
