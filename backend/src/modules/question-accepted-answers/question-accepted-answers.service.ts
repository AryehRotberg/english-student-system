import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionAcceptedAnswerCreateDto } from './dto/question-accepted-answer.create.dto';
import { QuestionAcceptedAnswerUpdateDto } from './dto/question-accepted-answer.update.dto';
import { QuestionAcceptedAnswer } from './entities/question-accepted-answer.entity';

@Injectable()
export class QuestionAcceptedAnswersService {
    constructor(
        @InjectRepository(QuestionAcceptedAnswer)
        private readonly answerRepo: Repository<QuestionAcceptedAnswer>,
    ) {}

    async create(
        dto: QuestionAcceptedAnswerCreateDto,
    ): Promise<QuestionAcceptedAnswer> {
        const entity = this.answerRepo.create({
            questionId: dto.questionId,
            answer: dto.answer,
            blankIndex: dto.blankIndex,
        });
        return this.answerRepo.save(entity);
    }

    findAll(): Promise<QuestionAcceptedAnswer[]> {
        return this.answerRepo.find({ order: { createdAt: 'DESC' } });
    }

    findOne(id: string): Promise<QuestionAcceptedAnswer | null> {
        return this.answerRepo.findOneBy({ id });
    }

    async update(
        id: string,
        dto: QuestionAcceptedAnswerUpdateDto,
    ): Promise<QuestionAcceptedAnswer | null> {
        await this.answerRepo.update(id, {
            ...(dto.questionId !== undefined && { questionId: dto.questionId }),
            ...(dto.answer !== undefined && { answer: dto.answer }),
            ...(dto.blankIndex !== undefined && { blankIndex: dto.blankIndex }),
        });
        return this.answerRepo.findOneBy({ id });
    }

    async remove(id: string): Promise<QuestionAcceptedAnswer> {
        const entity = await this.answerRepo.findOneBy({ id });
        await this.answerRepo.delete(id);
        return entity as any;
    }
}
