import { Injectable, NotFoundException } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { CreateQuizQuestionDto } from './dto/create-quiz-question.dto';
import { GetQuizQuestionsFilterDto } from './dto/get-quiz-questions-filter.dto';
import { QuizQuestionResponseDto } from './dto/quiz-question-response.dto';
import { UpdateQuizQuestionDto } from './dto/update-quiz-question.dto';
import { QuizQuestion } from './entities/quiz-question';

@Injectable()
export class QuizQuestionsService {
    constructor(private readonly pgService: PostgresService) {}

    async getFullQuiz(quizId: string) {
        const questionsRaw = await this.pgService.query<any>(
            this.pgService.getSql(__dirname, 'get-full-quiz-questions.sql'),
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

        const questions = await this.pgService.query<QuizQuestion>(
            this.pgService.getSql(
                __dirname,
                'get-quiz-questions-by-quiz-id.sql',
            ),
            [quizId],
        );

        return QuizQuestionResponseDto.fromEntities(questions);
    }

    async create(
        createQuizQuestionDto: CreateQuizQuestionDto,
    ): Promise<QuizQuestionResponseDto> {
        const { quizId, questionId, maxPoints, orderIndex } = createQuizQuestionDto;

        const [createdQuizQuestion] = await this.pgService.query<QuizQuestion>(
            this.pgService.getSql(__dirname, 'create-quiz-question.sql'),
            [quizId, questionId, maxPoints, orderIndex],
        );

        return QuizQuestionResponseDto.fromEntity(createdQuizQuestion);
    }

    async update(
        id: string,
        updateQuizQuestionDto: UpdateQuizQuestionDto,
    ): Promise<QuizQuestionResponseDto> {
        const [updatedQuizQuestion] = await this.pgService.query<QuizQuestion>(
            this.pgService.getSql(__dirname, 'update-quiz-question.sql'),
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
