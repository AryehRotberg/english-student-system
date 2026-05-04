import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VocabularyTopicWordCreateDto } from './dto/vocabulary-topic-word.create.dto';
import { VocabularyTopicWordQueryDto } from './dto/vocabulary-topic-word.query.dto';
import { VocabularyTopicWordResponseDto } from './dto/vocabulary-topic-word.response.dto';
import { VocabularyTopicWord } from './entities/vocabulary-topic-word.entity';

@Injectable()
export class VocabularyTopicWordsService {
    constructor(
        @InjectRepository(VocabularyTopicWord)
        private readonly topicWordRepo: Repository<VocabularyTopicWord>,
    ) {}

    async findByTopicId(
        dto: VocabularyTopicWordQueryDto,
    ): Promise<VocabularyTopicWordResponseDto[]> {
        const entities = await this.topicWordRepo.find({
            where: { topicId: dto.topicId },
            relations: ['vocabulary', 'topic'],
            order: { createdAt: 'DESC' },
        });

        return VocabularyTopicWordResponseDto.fromEntities(
            entities.map((e) => ({
                id: e.id,
                vocabularyId: e.vocabularyId,
                topicId: e.topicId,
                word: e.vocabulary?.word ?? null,
                meaning: e.vocabulary?.meaning ?? null,
                example: e.vocabulary?.example ?? null,
                translation: e.vocabulary?.translation ?? null,
                topic: e.topic?.topic ?? null,
                createdAt: e.createdAt,
            })),
        );
    }

    async create(
        dto: VocabularyTopicWordCreateDto,
    ): Promise<VocabularyTopicWordResponseDto> {
        const entity = this.topicWordRepo.create({
            vocabularyId: dto.vocabularyId,
            topicId: dto.topicId,
        });
        const saved = await this.topicWordRepo.save(entity);
        const full = await this.topicWordRepo.findOne({
            where: { id: saved.id },
            relations: ['vocabulary', 'topic'],
        });
        return VocabularyTopicWordResponseDto.fromEntity({
            id: full!.id,
            vocabularyId: full!.vocabularyId,
            topicId: full!.topicId,
            word: full!.vocabulary?.word ?? null,
            meaning: full!.vocabulary?.meaning ?? null,
            example: full!.vocabulary?.example ?? null,
            translation: full!.vocabulary?.translation ?? null,
            topic: full!.topic?.topic ?? null,
            createdAt: full!.createdAt,
        });
    }
}

