import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { CreateVocabularyTopicWordDto } from './dto/create-vocabulary-topic-word.dto';
import { GetVocabularyTopicWordsFilterDto } from './dto/get-vocabulary-topic-words-filter.dto';
import { VocabularyTopicWordResponseDto } from './dto/vocabulary-topic-word-response.dto';
import { VocabularyTopicWord } from './entities/vocabulary-topic-word.entity';

@Injectable()
export class VocabularyTopicWordsService {
    constructor(private readonly pgService: PostgresService) {}

    async findByTopicId(
        filter: GetVocabularyTopicWordsFilterDto,
    ): Promise<VocabularyTopicWordResponseDto[]> {
        const { topicId } = filter;

        const words = await this.pgService.query<VocabularyTopicWord>(
            this.pgService.getSql(
                __dirname,
                'get-vocabulary-topic-words-by-topic-id.sql',
            ),
            [topicId],
        );

        return VocabularyTopicWordResponseDto.fromEntities(words);
    }

    async create(
        createVocabularyTopicWordDto: CreateVocabularyTopicWordDto,
    ): Promise<VocabularyTopicWordResponseDto> {
        const { vocabularyId, topicId } = createVocabularyTopicWordDto;

        const [result] = await this.pgService.query<VocabularyTopicWord>(
            this.pgService.getSql(__dirname, 'create-vocabulary-topic-word.sql'),
            [vocabularyId, topicId],
        );

        return VocabularyTopicWordResponseDto.fromEntity(result);
    }
}
