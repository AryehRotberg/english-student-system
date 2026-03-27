import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import {
    createAiContentQuery,
    getAllAiContentsQuery,
} from './ai-contents.queries';
import { AiContentResponseDto } from './dto/ai-content-response.dto';
import { CreateAiContentDto } from './dto/create-ai-content.dto';
import { AiContent } from './entities.ts/ai-content';

@Injectable()
export class AiContentsService {
    constructor(private readonly postgresService: PostgresService) {}

    async findAll(): Promise<AiContentResponseDto[]> {
        const contents = await this.postgresService.query<AiContent>(
            getAllAiContentsQuery,
        );
        return AiContentResponseDto.fromEntities(contents);
    }

    async create(
        createAiContentDto: CreateAiContentDto,
    ): Promise<AiContentResponseDto> {
        const { content, contentType } = createAiContentDto;

        const [aiContent] = await this.postgresService.query<AiContent>(
            createAiContentQuery,
            [content, contentType, false],
        );
        return AiContentResponseDto.fromEntity(aiContent);
    }
}
