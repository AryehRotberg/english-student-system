import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionCreateDto } from './dto/question.create.dto';
import { Question } from './entities/question.entity';

@Injectable()
export class QuestionsService {
    constructor(
        @InjectRepository(Question)
        private readonly questionRepo: Repository<Question>,
    ) {}

    findAll(): Promise<Question[]> {
        return this.questionRepo.find({ order: { createdAt: 'DESC' } });
    }

    async create(dto: QuestionCreateDto): Promise<Question> {
        const entity = this.questionRepo.create({
            question: dto.question,
            questionType: dto.questionType,
        });
        return this.questionRepo.save(entity);
    }
}
