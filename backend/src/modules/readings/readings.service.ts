import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReadingCreateDto } from './dto/reading.create.dto';
import { ReadingUpdateDto } from './dto/reading.update.dto';
import { Reading } from './entities/reading.entity';

@Injectable()
export class ReadingsService {
    constructor(
        @InjectRepository(Reading)
        private readonly readingRepo: Repository<Reading>,
    ) {}

    findAll(): Promise<Reading[]> {
        return this.readingRepo.find({ order: { createdAt: 'DESC' } });
    }

    findOne(id: string): Promise<Reading | null> {
        return this.readingRepo.findOne({
            where: { id },
            relations: ['quiz', 'vocabularyTopic'],
        });
    }

    async create(dto: ReadingCreateDto): Promise<Reading> {
        const entity = this.readingRepo.create({
            title: dto.title,
            content: dto.content,
            level: dto.level,
            quiz: dto.quizId ? { id: dto.quizId } : null,
            vocabularyTopic: dto.vocabularyTopicId
                ? { id: dto.vocabularyTopicId }
                : null,
        });
        return this.readingRepo.save(entity);
    }

    async update(id: string, dto: ReadingUpdateDto): Promise<Reading | null> {
        const entity = await this.readingRepo.findOne({ where: { id } });
        if (!entity) return null;
        if (dto.title !== undefined) entity.title = dto.title;
        if (dto.content !== undefined) entity.content = dto.content;
        if (dto.level !== undefined) entity.level = dto.level;
        if ('quizId' in dto) {
            (entity as any).quiz = dto.quizId ? { id: dto.quizId } : null;
            entity.quizId = dto.quizId ?? null;
        }
        if ('vocabularyTopicId' in dto) {
            (entity as any).vocabularyTopic = dto.vocabularyTopicId
                ? { id: dto.vocabularyTopicId }
                : null;
        }
        return this.readingRepo.save(entity);
    }

    async remove(id: string): Promise<void> {
        await this.readingRepo.delete(id);
    }
}
