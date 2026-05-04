import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VocabularyTopicCreateDto } from './dto/vocabulary-topic.create.dto';
import { VocabularyTopic } from './entities/vocabulary-topic.entity';

@Injectable()
export class VocabularyTopicsService {
    constructor(
        @InjectRepository(VocabularyTopic)
        private readonly topicRepo: Repository<VocabularyTopic>,
    ) {}

    findAll(): Promise<VocabularyTopic[]> {
        return this.topicRepo.find({ order: { createdAt: 'DESC' } });
    }

    async create(dto: VocabularyTopicCreateDto): Promise<VocabularyTopic> {
        const entity = this.topicRepo.create({
            topic: dto.topic,
            description: dto.description ?? null,
        });
        return this.topicRepo.save(entity);
    }
}
