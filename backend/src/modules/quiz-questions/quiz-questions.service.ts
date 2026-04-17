import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { QuizQuestionCreateDto } from './dto/quiz-question.create.dto';
import { QuizQuestionQueryDto } from './dto/quiz-question.query.dto';
import { QuizQuestionResponseDto } from './dto/quiz-question.response.dto';
import { QuizQuestionUpdateDto } from './dto/quiz-question.update.dto';

@Injectable()
export class QuizQuestionsService {
    constructor(private readonly pgService: PostgresService) {}

    async getFullQuiz(quizId: string) {
        const questionsRaw = await this.pgService.query<any>(
            this.pgService.getSql(__dirname, 'quiz-question.find-full.sql'),
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

    async findByQuizId(dto: QuizQuestionQueryDto) {
        const { quizId } = dto;

        return await this.pgService.query<QuizQuestionResponseDto>(
            this.pgService.getSql(
                __dirname,
                'quiz-question.find-by-quiz-id.sql',
            ),
            [quizId],
        );
    }

    async create(dto: QuizQuestionCreateDto): Promise<QuizQuestionResponseDto> {
        const { quizId, questionId, maxPoints, orderIndex } = dto;

        const [createdQuizQuestion] =
            await this.pgService.query<QuizQuestionResponseDto>(
                this.pgService.getSql(__dirname, 'quiz-question.create.sql'),
                [quizId, questionId, maxPoints, orderIndex],
            );
        return createdQuizQuestion;
    }

    async update(
        id: string,
        dto: QuizQuestionUpdateDto,
    ): Promise<QuizQuestionResponseDto> {
        const { quizId, questionId, maxPoints } = dto;

        const [updatedQuizQuestion] =
            await this.pgService.query<QuizQuestionResponseDto>(
                this.pgService.getSql(__dirname, 'quiz-question.update.sql'),
                [id, quizId ?? null, questionId ?? null, maxPoints ?? null],
            );
        return updatedQuizQuestion;
    }
}
