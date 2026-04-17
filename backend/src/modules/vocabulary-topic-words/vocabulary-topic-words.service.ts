import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { VocabularyTopicWordCreateDto } from './dto/vocabulary-topic-word.create.dto';
import { VocabularyTopicWordQueryDto } from './dto/vocabulary-topic-word.query.dto';
import { VocabularyTopicWordResponseDto } from './dto/vocabulary-topic-word.response.dto';

@Injectable()
export class VocabularyTopicWordsService {
    constructor(private readonly pgService: PostgresService) {}

    async findByTopicId(
        dto: VocabularyTopicWordQueryDto,
    ): Promise<VocabularyTopicWordResponseDto[]> {
        const { topicId } = dto;

        const words = await this.pgService.query<any>(
            this.pgService.getSql(
                __dirname,
                'vocabulary-topic-word.find-by-topic-id.sql',
            ),
            [topicId],
        );

        return VocabularyTopicWordResponseDto.fromEntities(words);
    }

    async create(
        dto: VocabularyTopicWordCreateDto,
    ): Promise<VocabularyTopicWordResponseDto> {
        const { vocabularyId, topicId } = dto;

        const [result] =
            await this.pgService.query<VocabularyTopicWordResponseDto>(
                this.pgService.getSql(
                    __dirname,
                    'vocabulary-topic-word.create.sql',
                ),
                [vocabularyId, topicId],
            );
        return result;
    }
}
