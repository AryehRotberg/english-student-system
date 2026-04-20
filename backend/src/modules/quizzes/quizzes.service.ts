import { Injectable, Logger } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { QuestionAcceptedAnswersService } from '../question-accepted-answers/question-accepted-answers.service';
import { QuestionChoicesService } from '../question-choices/question-choices.service';
import { QuestionsService } from '../questions/questions.service';
import { QuizQuestionsService } from '../quiz-questions/quiz-questions.service';
import { QuizAiDraftCreateDto, QuizCreateDto } from './dto/quiz.create.dto';
import { QuizResponseDto } from './dto/quiz.response.dto';

@Injectable()
export class QuizzesService {
    constructor(
        private readonly pgService: PostgresService,
        private readonly questionsService: QuestionsService,
        private readonly quizQuestionsService: QuizQuestionsService,
        private readonly questionAcceptedAnswersService: QuestionAcceptedAnswersService,
        private readonly questionChoicesService: QuestionChoicesService,
    ) {}

    async findAll(): Promise<QuizResponseDto[]> {
        return await this.pgService.query<QuizResponseDto>(
            this.pgService.getSql(__dirname, 'quiz.find-all.sql'),
        );
    }

    async create(dto: QuizCreateDto): Promise<QuizResponseDto> {
        const { title, description } = dto;

        const [result] = await this.pgService.query<QuizResponseDto>(
            this.pgService.getSql(__dirname, 'quiz.create.sql'),
            [title, description],
        );
        return result;
    }

    async createFromAiDraft(
        metadata: QuizAiDraftCreateDto,
    ): Promise<QuizResponseDto> {
        const quiz = await this.create({
            title: metadata.title,
            description: metadata.description,
        });

        for (let i = 0; i < metadata.questions.length; i++) {
            Logger.debug(
                `Processing question ${i + 1}/${metadata.questions.length}`,
            );
            const q = metadata.questions[i];

            const question = await this.questionsService.create({
                question: q.question,
                questionType: q.question_type,
            });

            await this.quizQuestionsService.create({
                quizId: quiz.id,
                questionId: question.id,
                maxPoints: q.maxPoints,
                orderIndex: i + 1,
            });

            if (q.question_type === 'open_ended' && Array.isArray(q.answers)) {
                for (const answer of q.answers) {
                    await this.questionAcceptedAnswersService.create({
                        questionId: question.id,
                        answer: answer.text,
                        blankIndex: answer.blankIndex,
                    });
                }
            } else if (
                q.question_type === 'multiple_choice' &&
                Array.isArray(q.options)
            ) {
                for (const option of q.options) {
                    await this.questionChoicesService.create({
                        questionId: question.id,
                        optionText: option.text,
                        isCorrect: option.isCorrect,
                    });
                }
            }
        }
        return quiz;
    }
}
