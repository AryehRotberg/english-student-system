import { Injectable } from '@nestjs/common';
import { QuizQuestionCreateDto } from './dto/quiz-question.create.dto';
import { QuizQuestionQueryDto } from './dto/quiz-question.query.dto';
import { QuizQuestionResponseDto } from './dto/quiz-question.response.dto';
import { QuizQuestionUpdateDto } from './dto/quiz-question.update.dto';
import { QuizQuestion } from './entities/quiz-question.entity';
import { QuizQuestionRepository } from './repositories/quiz-question.repository';

@Injectable()
export class QuizQuestionsService {
    constructor(private readonly quizQuestionRepo: QuizQuestionRepository) {}

    async getFullQuiz(quizId: string) {
        return this.quizQuestionRepo.getFullQuiz(quizId);
    }

    async findByQuizId(
        dto: QuizQuestionQueryDto,
    ): Promise<QuizQuestionResponseDto[]> {
        const entities = await this.quizQuestionRepo.find({
            where: { quizId: dto.quizId },
            relations: ['question'],
        });
        return entities.map(this.toResponseDto);
    }

    async create(dto: QuizQuestionCreateDto): Promise<QuizQuestionResponseDto> {
        const entity = this.quizQuestionRepo.create({
            quizId: dto.quizId,
            questionId: dto.questionId,
            maxPoints: dto.maxPoints,
            orderIndex: dto.orderIndex ?? null,
        });
        const saved = await this.quizQuestionRepo.save(entity);
        const full = await this.quizQuestionRepo.findOne({
            where: { id: saved.id },
            relations: ['question'],
        });
        return this.toResponseDto(full!);
    }

    async update(
        id: string,
        dto: QuizQuestionUpdateDto,
    ): Promise<QuizQuestionResponseDto> {
        await this.quizQuestionRepo.update(id, {
            ...(dto.quizId !== undefined && { quizId: dto.quizId }),
            ...(dto.questionId !== undefined && { questionId: dto.questionId }),
            ...(dto.maxPoints !== undefined && { maxPoints: dto.maxPoints }),
        });
        const full = await this.quizQuestionRepo.findOne({
            where: { id },
            relations: ['question'],
        });
        return this.toResponseDto(full!);
    }

    private toResponseDto(entity: QuizQuestion): QuizQuestionResponseDto {
        return {
            id: entity.id,
            quizId: entity.quizId,
            questionId: entity.questionId,
            question: entity.question?.question ?? '',
            questionType: entity.question?.questionType ?? '',
            maxPoints: Number(entity.maxPoints),
        };
    }
}
