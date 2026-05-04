import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiDraftCreateDto } from './dto/ai-draft.create.dto';
import { AiDraft } from './entities/ai-draft.entity';

@Injectable()
export class AiDraftsService {
    constructor(
        @InjectRepository(AiDraft)
        private readonly aiDraftRepo: Repository<AiDraft>,
    ) {}

    findAll(): Promise<AiDraft[]> {
        return this.aiDraftRepo.find();
    }

    async create(dto: AiDraftCreateDto): Promise<AiDraft> {
        const entity = this.aiDraftRepo.create({
            model: dto.model,
            draft: dto.draft,
            draftType: dto.draftType,
            isApproved: false,
            additionalInstructions: dto.additionalInstructions ?? null,
        });
        return this.aiDraftRepo.save(entity);
    }
}
