import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { AiDraftCreateDto } from './dto/ai-draft.create.dto';
import { AiDraftResponseDto } from './dto/ai-draft.response.dto';

@Injectable()
export class AiDraftsService {
    constructor(private readonly pgService: PostgresService) {}

    async findAll(): Promise<AiDraftResponseDto[]> {
        return await this.pgService.query<AiDraftResponseDto>(
            this.pgService.getSql(__dirname, 'ai-draft.find-all.sql'),
        );
    }

    async create(dto: AiDraftCreateDto): Promise<AiDraftResponseDto> {
        const { model, draft, draftType, additionalInstructions } = dto;

        const [aiDraft] = await this.pgService.query<AiDraftResponseDto>(
            this.pgService.getSql(__dirname, 'ai-draft.create.sql'),
            [model, draft, draftType, false, additionalInstructions],
        );
        return aiDraft;
    }
}
