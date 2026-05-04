import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text' })
    name: string;

    @Column({ type: 'text', unique: true })
    email: string;

    @Column({ type: 'text' })
    password: string;

    @Column({ type: 'text' })
    role: string;

    @Column({ name: 'teacher_id', type: 'uuid', nullable: true })
    teacherId: string | null;

    @Column({ name: 'is_approved', type: 'boolean', default: false })
    isApproved: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => User, { nullable: true, eager: false })
    @JoinColumn({ name: 'teacher_id' })
    teacher: User | null;

    get teacherName(): string | null {
        return this.teacher?.name ?? null;
    }

    get teacherEmail(): string | null {
        return this.teacher?.email ?? null;
    }
}
