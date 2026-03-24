import { Injectable, NotFoundException } from '@nestjs/common';
import { RedisService } from 'src/config/redis.client';
import { PostgresService } from '../config/postgres.client';
import { CreateQuizQuestionDto } from './dto/create-quiz-question.dto';
import { GetQuizQuestionsFilterDto } from './dto/get-quiz-questions-filter.dto';
import { QuizQuestionResponseDto } from './dto/quiz-question-response.dto';
import { UpdateQuizQuestionDto } from './dto/update-quiz-question.dto';
import { QuizQuestion } from './entities/quiz-question';
import {
    createQuizQuestionQuery,
    getFullQuizQuestionsQuery,
    getQuizQuestionsByQuizIdQuery,
    updateQuizQuestionQuery,
} from './quiz-questions.queries';

@Injectable()
export class QuizQuestionsService {
    constructor(
        private readonly postgresService: PostgresService,
        private readonly redisService: RedisService,
    ) {}

    async getFullQuiz(quizId: string) {
        const questionsRaw = await this.postgresService.query<any>(
            getFullQuizQuestionsQuery,
            [quizId],
        );

        return questionsRaw.map((q, index) => ({
            ...q,
            maxPoints: Number(q.maxPoints ?? 0),
            questionNumber: index + 1,
            totalQuestions: questionsRaw.length,
            blankCount: Number(q.blankCount ?? 0),
            questionType:
                q.questionType ??
                (q.options.length > 0 ? 'multiple_choice' : 'open_ended'),
        }));
    }

    async findByQuizId(filter: GetQuizQuestionsFilterDto) {
        const { quizId } = filter;

        const questions = await this.postgresService.query<QuizQuestion>(
            getQuizQuestionsByQuizIdQuery,
            [quizId],
        );

        return QuizQuestionResponseDto.fromEntities(questions);
    }

    async create(
        createQuizQuestionDto: CreateQuizQuestionDto,
    ): Promise<QuizQuestionResponseDto> {
        const { quizId, questionId, maxPoints } = createQuizQuestionDto;

        const [createdQuizQuestion] =
            await this.postgresService.query<QuizQuestion>(
                createQuizQuestionQuery,
                [quizId, questionId, maxPoints],
            );

        return QuizQuestionResponseDto.fromEntity(createdQuizQuestion);
    }

    async update(
        id: string,
        updateQuizQuestionDto: UpdateQuizQuestionDto,
    ): Promise<QuizQuestionResponseDto> {
        const [updatedQuizQuestion] =
            await this.postgresService.query<QuizQuestion>(
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

        return QuizQuestionResponseDto.fromEntity(updatedQuizQuestion);
    }
}
