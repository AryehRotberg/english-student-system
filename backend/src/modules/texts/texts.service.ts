import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TextCreateDto } from './dto/text.create.dto';
import { TextUpdateDto } from './dto/text.update.dto';
import { Text } from './entities/text.entity';

@Injectable()
export class TextsService {
    constructor(
        @InjectRepository(Text)
        private readonly textRepo: Repository<Text>,
    ) {}

    findAll(): Promise<Text[]> {
        return this.textRepo.find({ order: { createdAt: 'DESC' } });
    }

    findOne(id: string): Promise<Text | null> {
        return this.textRepo.findOne({
            where: { id },
            relations: ['quiz', 'vocabularyTopic'],
        });
    }

    async create(dto: TextCreateDto): Promise<Text> {
        const entity = this.textRepo.create({
            title: dto.title,
            content: dto.content,
            level: dto.level,
            quiz: dto.quizId ? { id: dto.quizId } : null,
            vocabularyTopic: dto.vocabularyTopicId
                ? { id: dto.vocabularyTopicId }
                : null,
        });
        return this.textRepo.save(entity);
    }

    async update(id: string, dto: TextUpdateDto): Promise<Text | null> {
        const entity = await this.textRepo.findOne({ where: { id } });
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
        return this.textRepo.save(entity);
    }

    async remove(id: string): Promise<void> {
        await this.textRepo.delete(id);
    }
}
