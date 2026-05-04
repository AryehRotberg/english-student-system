import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VocabularyCreateDto } from './dto/vocabulary.create.dto';
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
}
