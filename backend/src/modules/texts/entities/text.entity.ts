import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

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

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
