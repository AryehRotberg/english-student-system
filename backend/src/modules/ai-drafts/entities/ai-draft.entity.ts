import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'ai_drafts' })
export class AiDraft {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text' })
    model: string;

    @Column({ type: 'text' })
    draft: string;

    @Column({ name: 'draft_type', type: 'text' })
    draftType: string;

    @Column({ name: 'is_approved', type: 'boolean', default: false })
    isApproved: boolean;

    @Column({ name: 'additional_instructions', type: 'text', nullable: true })
    additionalInstructions: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
