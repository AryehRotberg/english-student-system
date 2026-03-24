import { Injectable } from '@nestjs/common';
import { RedisService } from '../config/redis.client';
import { PostgresService } from '../config/postgres.client';
import { CreateVocabularyTopicWordDto } from './dto/create-vocabulary-topic-word.dto';
import { GetVocabularyTopicWordsFilterDto } from './dto/get-vocabulary-topic-words-filter.dto';
import { VocabularyTopicWordResponseDto } from './dto/vocabulary-topic-word-response.dto';
import { VocabularyTopicWord } from './entities/vocabulary-topic-word.entity';
import {
    createVocabularyTopicWordQuery,
    getVocabularyTopicWordsByTopicIdQuery,
} from './vocabulary-topic-words.queries';

@Injectable()
export class VocabularyTopicWordsService {
    constructor(
        private readonly postgresService: PostgresService,
        private readonly redisService: RedisService,
    ) {}

    async findByTopicId(
        filter: GetVocabularyTopicWordsFilterDto,
    ): Promise<VocabularyTopicWordResponseDto[]> {
        const { topicId } = filter;

        return this.redisService.getOrFetch<VocabularyTopicWordResponseDto[]>(
            `vocabulary-topic-words:topic:${topicId}`,
            async () => {
                const words =
                    await this.postgresService.query<VocabularyTopicWord>(
                        getVocabularyTopicWordsByTopicIdQuery,
                        [topicId],
                    );

                return VocabularyTopicWordResponseDto.fromEntities(words);
            },
        );
    }

    async create(
        createVocabularyTopicWordDto: CreateVocabularyTopicWordDto,
    ): Promise<VocabularyTopicWordResponseDto> {
        const { vocabularyId, topicId } = createVocabularyTopicWordDto;

        await this.redisService.invalidate(`vocabulary-topic-words:*`);

        const [result] = await this.postgresService.query<VocabularyTopicWord>(
            createVocabularyTopicWordQuery,
            [vocabularyId, topicId],
        );

        return VocabularyTopicWordResponseDto.fromEntity(result);
    }
}
