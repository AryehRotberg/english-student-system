import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'assignment_items' })
export class AssignmentItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'assignment_id', type: 'uuid' })
    assignmentId: string;

    @Column({ name: 'content_type', type: 'text' })
    contentType: string;

    @Column({ name: 'content_id', type: 'uuid' })
    contentId: string;

    @Column({ name: 'is_completed', type: 'boolean', default: false })
    isCompleted: boolean;
}
