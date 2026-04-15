import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { AiContentResponseDto } from './dto/ai-content-response.dto';
import { CreateAiContentDto } from './dto/create-ai-content.dto';
import { AiContent } from './entities/ai-content';

@Injectable()
export class AiContentsService {
    constructor(private readonly pgService: PostgresService) {}

    async findAll(): Promise<AiContentResponseDto[]> {
        const contents = await this.pgService.query<AiContent>(
            this.pgService.getSql(__dirname, 'get-all-ai-contents.sql'),
        );
        return AiContentResponseDto.fromEntities(contents);
    }

    async create(
        createAiContentDto: CreateAiContentDto,
    ): Promise<AiContentResponseDto> {
        const { model, content, contentType, additionalInstructions } =
            createAiContentDto;

        const [aiContent] = await this.pgService.query<AiContent>(
            this.pgService.getSql(__dirname, 'create-ai-content.sql'),
            [model, content, contentType, false, additionalInstructions],
        );
        return AiContentResponseDto.fromEntity(aiContent);
    }
}
