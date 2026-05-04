import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TextCreateDto } from './dto/text.create.dto';
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

    async create(dto: TextCreateDto): Promise<Text> {
        const entity = this.textRepo.create({
            title: dto.title,
            content: dto.content,
            level: dto.level,
        });
        return this.textRepo.save(entity);
    }
}
