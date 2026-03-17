import { Injectable, NotFoundException } from '@nestjs/common';
import { PostgresService } from '../config/postgres.client';
import { CreateQuizQuestionDto } from './dto/create-quiz-question.dto';
import { GetQuizQuestionsFilterDto } from './dto/get-quiz-questions-filter.dto';
import { QuizQuestionResponseDto } from './dto/quiz-question-response.dto';
import { UpdateQuizQuestionDto } from './dto/update-quiz-question.dto';
import { QuizQuestion } from './entities/quiz-question';
import {
    createQuizQuestionQuery,
    getQuizQuestionByIdQuery,
    getQuizQuestionsByQuizIdQuery,
    updateQuizQuestionQuery,
} from './quiz-questions.queries';

@Injectable()
export class QuizQuestionsService {
    constructor(private readonly postgresService: PostgresService) { }

    async findByQuizId(filter: GetQuizQuestionsFilterDto) {
        const { quizId } = filter;

        const questions = await this.postgresService.query<QuizQuestion>(
            getQuizQuestionsByQuizIdQuery,
            [quizId]
        );

        return QuizQuestionResponseDto.fromEntities(questions);
    }

    async create(createQuizQuestionDto: CreateQuizQuestionDto): Promise<QuizQuestionResponseDto> {
        const { quizId, questionId, maxPoints } = createQuizQuestionDto;

        const [createdQuizQuestion] = await this.postgresService.query<QuizQuestion>(
            createQuizQuestionQuery,
            [quizId, questionId, maxPoints],
        );

        const [result] = await this.postgresService.query<QuizQuestion>(
            getQuizQuestionByIdQuery,
            [createdQuizQuestion.id],
        );

        return QuizQuestionResponseDto.fromEntity(result);
    }

    async update(id: string, updateQuizQuestionDto: UpdateQuizQuestionDto): Promise<QuizQuestionResponseDto> {
        const [updatedQuizQuestion] = await this.postgresService.query<QuizQuestion>(
            updateQuizQuestionQuery,
            [
                id,
                updateQuizQuestionDto.quizId ?? null,
                updateQuizQuestionDto.questionId ?? null,
                updateQuizQuestionDto.maxPoints ?? null,
            ],
        );

        if (!updatedQuizQuestion) {
            throw new NotFoundException('Quiz question not found');
        }

        const [result] = await this.postgresService.query<QuizQuestion>(
            getQuizQuestionByIdQuery,
            [updatedQuizQuestion.id],
        );

        return QuizQuestionResponseDto.fromEntity(result);
    }
}
