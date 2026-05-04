import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'assignments' })
export class Assignment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @Column({ type: 'text' })
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Column({ name: 'due_date', type: 'timestamp', nullable: true })
    dueDate: Date | null;

    @Column({ name: 'is_completed', type: 'boolean', default: false })
    isCompleted: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
