import { Injectable } from '@nestjs/common';
import { PostgresService } from '../config/postgres.client';
import { CreateVocabularyTopicWordDto } from './dto/create-vocabulary-topic-word.dto';
import { GetVocabularyTopicWordsFilterDto } from './dto/get-vocabulary-topic-words-filter.dto';
import { VocabularyTopicWordResponseDto } from './dto/vocabulary-topic-word-response.dto';
import { VocabularyTopicWord } from './entities/vocabulary-topic-word.entity';
import {
    createVocabularyTopicWordQuery,
    getVocabularyTopicWordByIdQuery,
    getVocabularyTopicWordsByTopicIdQuery,
} from './vocabulary-topic-words.queries';

@Injectable()
export class VocabularyTopicWordsService {
    constructor(private readonly postgresService: PostgresService) {}

    async findByTopicId(
        filter: GetVocabularyTopicWordsFilterDto,
    ): Promise<VocabularyTopicWordResponseDto[]> {
        const { topicId } = filter;

        const words = await this.postgresService.query<VocabularyTopicWord>(
            getVocabularyTopicWordsByTopicIdQuery,
            [topicId],
        );

        return VocabularyTopicWordResponseDto.fromEntities(words);
    }

    async create(
        createVocabularyTopicWordDto: CreateVocabularyTopicWordDto,
    ): Promise<VocabularyTopicWordResponseDto> {
        const { vocabularyId, topicId } = createVocabularyTopicWordDto;

        const [createdTopicWord] =
            await this.postgresService.query<VocabularyTopicWord>(
                createVocabularyTopicWordQuery,
                [vocabularyId, topicId],
            );

        const [result] = await this.postgresService.query<VocabularyTopicWord>(
            getVocabularyTopicWordByIdQuery,
            [createdTopicWord.id],
        );

        return VocabularyTopicWordResponseDto.fromEntity(result);
    }
}
