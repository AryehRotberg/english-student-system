import { Test, TestingModule } from '@nestjs/testing';
import { QuizQuestionCreateDto } from './dto/quiz-question.create.dto';
import { QuizQuestionUpdateDto } from './dto/quiz-question.update.dto';
import { QuizQuestion } from './entities/quiz-question.entity';
import { QuizQuestionsService } from './quiz-questions.service';
import { QuizQuestionRepository } from './repositories/quiz-question.repository';

const mockQuizQuestion: QuizQuestion = {
    id: 'qq-uuid-1',
    quizId: 'quiz-uuid-1',
    questionId: 'q-uuid-1',
    maxPoints: 2,
    orderIndex: 1,
    question: {
        id: 'q-uuid-1',
        question: 'What is the past tense of run?',
        questionType: 'multiple_choice',
    } as any,
} as any;

const mockResponseDto = {
    id: 'qq-uuid-1',
    quizId: 'quiz-uuid-1',
    questionId: 'q-uuid-1',
    question: 'What is the past tense of run?',
    questionType: 'multiple_choice',
    maxPoints: 2,
};

const mockRepo = {
    getFullQuiz: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
};

describe('QuizQuestionsService', () => {
    let service: QuizQuestionsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                QuizQuestionsService,
                { provide: QuizQuestionRepository, useValue: mockRepo },
            ],
        }).compile();

        service = module.get<QuizQuestionsService>(QuizQuestionsService);
        jest.clearAllMocks();
    });

    describe('getFullQuiz', () => {
        it('should delegate to the repository', async () => {
            const fullQuiz = { id: 'quiz-uuid-1', questions: [] };
            mockRepo.getFullQuiz.mockResolvedValue(fullQuiz);

            const result = await service.getFullQuiz('quiz-uuid-1');

            expect(mockRepo.getFullQuiz).toHaveBeenCalledWith('quiz-uuid-1');
            expect(result).toEqual(fullQuiz);
        });
    });

    describe('findByQuizId', () => {
        it('should return mapped response DTOs for a given quizId', async () => {
            mockRepo.find.mockResolvedValue([mockQuizQuestion]);

            const result = await service.findByQuizId({
                quizId: 'quiz-uuid-1',
            });

            expect(mockRepo.find).toHaveBeenCalledWith({
                where: { quizId: 'quiz-uuid-1' },
                relations: ['question'],
            });
            expect(result[0]).toMatchObject(mockResponseDto);
        });
    });

    describe('create', () => {
        it('should create, save, and return a mapped response DTO', async () => {
            const dto: QuizQuestionCreateDto = {
                quizId: 'quiz-uuid-1',
                questionId: 'q-uuid-1',
                maxPoints: 2,
                orderIndex: 1,
            };
            mockRepo.create.mockReturnValue(mockQuizQuestion);
            mockRepo.save.mockResolvedValue(mockQuizQuestion);
            mockRepo.findOne.mockResolvedValue(mockQuizQuestion);

            const result = await service.create(dto);

            expect(mockRepo.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    quizId: 'quiz-uuid-1',
                    questionId: 'q-uuid-1',
                    maxPoints: 2,
                }),
            );
            expect(result).toMatchObject(mockResponseDto);
        });
    });

    describe('update', () => {
        it('should update and return the updated response DTO', async () => {
            const dto: QuizQuestionUpdateDto = { maxPoints: 5 };
            mockRepo.update.mockResolvedValue({ affected: 1 });
            mockRepo.findOne.mockResolvedValue({
                ...mockQuizQuestion,
                maxPoints: 5,
            });

            const result = await service.update('qq-uuid-1', dto);

            expect(mockRepo.update).toHaveBeenCalledWith('qq-uuid-1', {
                maxPoints: 5,
            });
            expect(result.maxPoints).toBe(5);
        });
    });
});
