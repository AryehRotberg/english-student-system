import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'study_guides' })
export class StudyGuide {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text' })
    topic: string;

    @Column({ type: 'text' })
    explanation: string;
}
