import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { QuestionAcceptedAnswersService } from '../question-accepted-answers/question-accepted-answers.service';
import { QuestionChoicesService } from '../question-choices/question-choices.service';
import { QuestionsService } from '../questions/questions.service';
import { QuizQuestionsService } from '../quiz-questions/quiz-questions.service';
import { QuizAiDraftCreateDto, QuizCreateDto } from './dto/quiz.create.dto';
import { ProficiencyLevel, Quiz, QuizCategory } from './entities/quiz.entity';

@Injectable()
export class QuizzesService {
    constructor(
        @InjectRepository(Quiz)
        private readonly quizRepo: Repository<Quiz>,
        private readonly questionsService: QuestionsService,
        private readonly quizQuestionsService: QuizQuestionsService,
        private readonly questionAcceptedAnswersService: QuestionAcceptedAnswersService,
        private readonly questionChoicesService: QuestionChoicesService,
    ) {}

    findAll(
        category?: QuizCategory,
        level?: ProficiencyLevel,
    ): Promise<Quiz[]> {
        const where: FindOptionsWhere<Quiz> = {};
        if (category) {
            where.category = category;
        }
        if (level) {
            where.level = level;
        }
        return this.quizRepo.find({ where, order: { createdAt: 'DESC' } });
    }

    async create(dto: QuizCreateDto): Promise<Quiz> {
        const entity = this.quizRepo.create({
            title: dto.title,
            description: dto.description ?? null,
        });
        return this.quizRepo.save(entity);
    }

    async remove(id: string): Promise<void> {
        await this.quizRepo.delete(id);
    }

    async createFromAiDraft(metadata: QuizAiDraftCreateDto): Promise<Quiz> {
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
