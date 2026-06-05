import { Test, TestingModule } from '@nestjs/testing';
import { TeacherGuard } from '../../auth/guards/auth.guard';
import { QuizQuestionCreateDto } from './dto/quiz-question.create.dto';
import { QuizQuestionUpdateDto } from './dto/quiz-question.update.dto';
import { QuizQuestionsController } from './quiz-questions.controller';
import { QuizQuestionsService } from './quiz-questions.service';

const mockResponseDto = {
    id: 'qq-uuid-1',
    quizId: 'quiz-uuid-1',
    questionId: 'q-uuid-1',
    question: 'What is the past tense of run?',
    questionType: 'multiple_choice',
    maxPoints: 2,
};

const mockService = {
    getFullQuiz: jest.fn(),
    findByQuizId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
};

describe('QuizQuestionsController', () => {
    let controller: QuizQuestionsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [QuizQuestionsController],
            providers: [
                { provide: QuizQuestionsService, useValue: mockService },
            ],
        })
            .overrideGuard(TeacherGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<QuizQuestionsController>(
            QuizQuestionsController,
        );
        jest.clearAllMocks();
    });

    describe('getFullQuiz', () => {
        it('should return the full quiz data for a quizId', async () => {
            const fullQuiz = { id: 'quiz-uuid-1', questions: [] };
            mockService.getFullQuiz.mockResolvedValue(fullQuiz);

            const result = await controller.getFullQuiz('quiz-uuid-1');

            expect(mockService.getFullQuiz).toHaveBeenCalledWith('quiz-uuid-1');
            expect(result).toEqual(fullQuiz);
        });
    });

    describe('findByUserId', () => {
        it('should return quiz questions for a given quizId', async () => {
            mockService.findByQuizId.mockResolvedValue([mockResponseDto]);

            const result = await controller.findByUserId({
                quizId: 'quiz-uuid-1',
            } as any);

            expect(mockService.findByQuizId).toHaveBeenCalledWith({
                quizId: 'quiz-uuid-1',
            });
            expect(result).toEqual([mockResponseDto]);
        });
    });

    describe('create', () => {
        it('should create and return a quiz question', async () => {
            const dto: QuizQuestionCreateDto = {
                quizId: 'quiz-uuid-1',
                questionId: 'q-uuid-1',
                maxPoints: 2,
                orderIndex: 1,
            };
            mockService.create.mockResolvedValue(mockResponseDto);

            const result = await controller.create(dto);

            expect(mockService.create).toHaveBeenCalledWith(dto);
            expect(result).toEqual(mockResponseDto);
        });
    });

    describe('update', () => {
        it('should update and return the quiz question', async () => {
            const dto: QuizQuestionUpdateDto = { maxPoints: 5 };
            mockService.update.mockResolvedValue({
                ...mockResponseDto,
                maxPoints: 5,
            });

            const result = await controller.update('qq-uuid-1', dto);

            expect(mockService.update).toHaveBeenCalledWith('qq-uuid-1', dto);
            expect(result.maxPoints).toBe(5);
        });
    });
});
