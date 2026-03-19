import { Injectable } from '@nestjs/common';
import { PostgresService } from '../config/postgres.client';
import { CreateVocabularyTopicDto } from './dto/create-vocabulary-topic.dto';
import { VocabularyTopicResponseDto } from './dto/vocabulary-topic-response.dto';
import { VocabularyTopic } from './entities/vocabulary-topic.entity';
import {
    createVocabularyTopicQuery,
    getAllVocabularyTopicsQuery,
} from './vocabulary-topics.queries';

@Injectable()
export class VocabularyTopicsService {
    constructor(private readonly postgresService: PostgresService) {}

    async findAll(): Promise<VocabularyTopicResponseDto[]> {
        const topics = await this.postgresService.query<VocabularyTopic>(
            getAllVocabularyTopicsQuery,
        );
        return VocabularyTopicResponseDto.fromEntities(topics);
    }

    async create(
        createVocabularyTopicDto: CreateVocabularyTopicDto,
    ): Promise<VocabularyTopicResponseDto> {
        const { topic, description } = createVocabularyTopicDto;

        const [result] = await this.postgresService.query<VocabularyTopic>(
            createVocabularyTopicQuery,
            [topic ?? null, description ?? null],
        );

        return VocabularyTopicResponseDto.fromEntity(result);
    }
}
