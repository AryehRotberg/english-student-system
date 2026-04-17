import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { VocabularyTopicCreateDto } from './dto/vocabulary-topic.create.dto';
import { VocabularyTopicResponseDto } from './dto/vocabulary-topic.response.dto';

@Injectable()
export class VocabularyTopicsService {
    constructor(private readonly pgService: PostgresService) {}

    async findAll(): Promise<VocabularyTopicResponseDto[]> {
        return await this.pgService.query<VocabularyTopicResponseDto>(
            this.pgService.getSql(__dirname, 'vocabulary-topic.find-all.sql'),
        );
    }

    async create(
        createVocabularyTopicDto: VocabularyTopicCreateDto,
    ): Promise<VocabularyTopicResponseDto> {
        const { topic, description } = createVocabularyTopicDto;

        const [result] = await this.pgService.query<VocabularyTopicResponseDto>(
            this.pgService.getSql(__dirname, 'vocabulary-topic.create.sql'),
            [topic ?? null, description ?? null],
        );
        return result;
    }
}
