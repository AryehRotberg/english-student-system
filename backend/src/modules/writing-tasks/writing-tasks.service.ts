import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WritingTaskCreateDto } from './dto/writing-task.create.dto';
import { WritingTask } from './entities/writing-task.entity';

@Injectable()
export class WritingTasksService {
    constructor(
        @InjectRepository(WritingTask)
        private readonly writingTaskRepo: Repository<WritingTask>,
    ) {}

    findAll(): Promise<WritingTask[]> {
        return this.writingTaskRepo.find({
            order: { createdAt: 'DESC' },
        });
    }

    async create(dto: WritingTaskCreateDto): Promise<WritingTask> {
        const entity = this.writingTaskRepo.create({
            title: dto.title,
            instructions: dto.instructions,
            minWords: dto.minWords ?? null,
        });
        return this.writingTaskRepo.save(entity);
    }
}
