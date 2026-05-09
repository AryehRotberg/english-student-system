import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VocabularyCreateDto } from './dto/vocabulary.create.dto';
import { VocabularyUpdateDto } from './dto/vocabulary.update.dto';
import { Vocabulary } from './entities/vocabulary.entity';

@Injectable()
export class VocabularyService {
    constructor(
        @InjectRepository(Vocabulary)
        private readonly vocabularyRepo: Repository<Vocabulary>,
    ) {}

    findAll(): Promise<Vocabulary[]> {
        return this.vocabularyRepo.find({ order: { createdAt: 'DESC' } });
    }

    async create(dto: VocabularyCreateDto): Promise<Vocabulary> {
        const entity = this.vocabularyRepo.create({
            word: dto.word ?? null,
            meaning: dto.meaning ?? null,
            example: dto.example ?? null,
            translation: dto.translation ?? null,
        });
        return this.vocabularyRepo.save(entity);
    }

    async update(
        id: string,
        dto: VocabularyUpdateDto,
    ): Promise<Vocabulary | null> {
        const entity = await this.vocabularyRepo.findOne({ where: { id } });
        if (!entity) return null;
        if (dto.word !== undefined) entity.word = dto.word;
        if (dto.meaning !== undefined) entity.meaning = dto.meaning;
        if (dto.example !== undefined) entity.example = dto.example;
        if (dto.translation !== undefined) entity.translation = dto.translation;
        return this.vocabularyRepo.save(entity);
    }

    async remove(id: string): Promise<void> {
        await this.vocabularyRepo.delete(id);
    }
}
