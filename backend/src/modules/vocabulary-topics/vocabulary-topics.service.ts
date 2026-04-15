import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { CreateVocabularyTopicDto } from './dto/create-vocabulary-topic.dto';
import { VocabularyTopicResponseDto } from './dto/vocabulary-topic-response.dto';
import { VocabularyTopic } from './entities/vocabulary-topic.entity';

@Injectable()
export class VocabularyTopicsService {
    constructor(private readonly pgService: PostgresService) {}

    async findAll(): Promise<VocabularyTopicResponseDto[]> {
        const topics = await this.pgService.query<VocabularyTopic>(
            this.pgService.getSql(__dirname, 'get-all-vocabulary-topics.sql'),
        );
        return VocabularyTopicResponseDto.fromEntities(topics);
    }

    async create(
        createVocabularyTopicDto: CreateVocabularyTopicDto,
    ): Promise<VocabularyTopicResponseDto> {
        const { topic, description } = createVocabularyTopicDto;

        const [result] = await this.pgService.query<VocabularyTopic>(
            this.pgService.getSql(__dirname, 'create-vocabulary-topic.sql'),
            [topic ?? null, description ?? null],
        );

        return VocabularyTopicResponseDto.fromEntity(result);
    }
}
