import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionChoiceCreateDto } from './dto/question-choice.create.dto';
import { QuestionChoiceQueryDto } from './dto/question-choice.query.dto';
import { QuestionChoiceResponseDto } from './dto/question-choice.response.dto';
import { QuestionChoiceUpdateDto } from './dto/question-choice.update.dto';
import { QuestionChoice } from './entities/question-choice.entity';

@Injectable()
export class QuestionChoicesService {
    constructor(
        @InjectRepository(QuestionChoice)
        private readonly choiceRepo: Repository<QuestionChoice>,
    ) {}

    findByQuestionId(
        dto: QuestionChoiceQueryDto,
    ): Promise<QuestionChoiceResponseDto[]> {
        return this.choiceRepo.find({ where: { questionId: dto.questionId } });
    }

    async create(
        dto: QuestionChoiceCreateDto,
    ): Promise<QuestionChoiceResponseDto> {
        const entity = this.choiceRepo.create({
            questionId: dto.questionId,
            optionText: dto.optionText,
            isCorrect: dto.isCorrect,
        });
        return this.choiceRepo.save(entity);
    }

    async update(
        id: string,
        dto: QuestionChoiceUpdateDto,
    ): Promise<QuestionChoiceResponseDto> {
        await this.choiceRepo.update(id, {
            ...(dto.questionId !== undefined && { questionId: dto.questionId }),
            ...(dto.optionText !== undefined && { optionText: dto.optionText }),
            ...(dto.isCorrect !== undefined && { isCorrect: dto.isCorrect }),
        });
        const updated = await this.choiceRepo.findOneBy({ id });

        if (!updated) {
            throw new NotFoundException(
                'Question choice not found after update',
            );
        }

        return updated;
    }
}
