import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QuestionAcceptedAnswersService } from '../question-accepted-answers/question-accepted-answers.service';
import { QuestionChoicesService } from '../question-choices/question-choices.service';
import { QuestionsService } from '../questions/questions.service';
import { QuizQuestionsService } from '../quiz-questions/quiz-questions.service';
import { QuizAiDraftCreateDto, QuizCreateDto } from './dto/quiz.create.dto';
import { Quiz } from './entities/quiz.entity';
import { QuizzesService } from './quizzes.service';

const mockQuiz: Quiz = {
    id: 'quiz-uuid-1',
    title: 'Vocab Quiz',
    description: 'A vocabulary quiz',
    category: null,
    level: null,
    createdAt: new Date('2024-01-01'),
} as any;

const mockQuizRepo = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
};
const mockQuestionsService = { create: jest.fn() };
const mockQuizQuestionsService = { create: jest.fn() };
const mockAnswersService = { create: jest.fn() };
const mockChoicesService = { create: jest.fn() };

describe('QuizzesService', () => {
    let service: QuizzesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                QuizzesService,
                { provide: getRepositoryToken(Quiz), useValue: mockQuizRepo },
                { provide: QuestionsService, useValue: mockQuestionsService },
                {
                    provide: QuizQuestionsService,
                    useValue: mockQuizQuestionsService,
                },
                {
                    provide: QuestionAcceptedAnswersService,
                    useValue: mockAnswersService,
                },
                {
                    provide: QuestionChoicesService,
                    useValue: mockChoicesService,
                },
            ],
        }).compile();

        service = module.get<QuizzesService>(QuizzesService);
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all quizzes when no filters are provided', async () => {
            mockQuizRepo.find.mockResolvedValue([mockQuiz]);

            const result = await service.findAll();

            expect(mockQuizRepo.find).toHaveBeenCalledWith({
                where: {},
                order: { createdAt: 'DESC' },
            });
            expect(result).toEqual([mockQuiz]);
        });

        it('should apply category filter when provided', async () => {
            mockQuizRepo.find.mockResolvedValue([mockQuiz]);

            await service.findAll('vocabulary' as any);

            expect(mockQuizRepo.find).toHaveBeenCalledWith({
                where: { category: 'vocabulary' },
                order: { createdAt: 'DESC' },
            });
        });

        it('should apply both category and level filters when provided', async () => {
            mockQuizRepo.find.mockResolvedValue([mockQuiz]);

            await service.findAll('vocabulary' as any, 'B1' as any);

            expect(mockQuizRepo.find).toHaveBeenCalledWith({
                where: { category: 'vocabulary', level: 'B1' },
                order: { createdAt: 'DESC' },
            });
        });
    });

    describe('create', () => {
        it('should create and return a quiz', async () => {
            const dto: QuizCreateDto = {
                title: 'Vocab Quiz',
                description: 'A vocabulary quiz',
            };
            mockQuizRepo.create.mockReturnValue(mockQuiz);
            mockQuizRepo.save.mockResolvedValue(mockQuiz);

            const result = await service.create(dto);

            expect(mockQuizRepo.create).toHaveBeenCalledWith({
                title: dto.title,
                description: dto.description ?? null,
            });
            expect(result).toEqual(mockQuiz);
        });
    });

    describe('remove', () => {
        it('should delete a quiz by id', async () => {
            mockQuizRepo.delete.mockResolvedValue({ affected: 1 });

            await service.remove('quiz-uuid-1');

            expect(mockQuizRepo.delete).toHaveBeenCalledWith('quiz-uuid-1');
        });
    });

    describe('createFromAiDraft', () => {
        it('should create a quiz, questions, and multiple-choice options from a draft', async () => {
            const draft: QuizAiDraftCreateDto = {
                title: 'AI Quiz',
                description: 'Generated',
                questions: [
                    {
                        question: 'Pick the correct word',
                        question_type: 'multiple_choice',
                        maxPoints: 2,
                        difficulty_score: 1,
                        options: [
                            { text: 'ran', isCorrect: true },
                            { text: 'runned', isCorrect: false },
                        ],
                    },
                ],
            };
            const createdQuiz = {
                ...mockQuiz,
                id: 'quiz-uuid-2',
                title: 'AI Quiz',
            };
            const createdQuestion = { id: 'q-uuid-2' } as any;

            mockQuizRepo.create.mockReturnValue(createdQuiz);
            mockQuizRepo.save.mockResolvedValue(createdQuiz);
            mockQuestionsService.create.mockResolvedValue(createdQuestion);
            mockQuizQuestionsService.create.mockResolvedValue({});
            mockChoicesService.create.mockResolvedValue({});

            const result = await service.createFromAiDraft(draft);

            expect(mockQuestionsService.create).toHaveBeenCalledTimes(1);
            expect(mockQuizQuestionsService.create).toHaveBeenCalledTimes(1);
            expect(mockChoicesService.create).toHaveBeenCalledTimes(2);
            expect(mockAnswersService.create).not.toHaveBeenCalled();
            expect(result).toEqual(createdQuiz);
        });

        it('should create accepted answers for open_ended questions', async () => {
            const draft: QuizAiDraftCreateDto = {
                title: 'AI Quiz',
                description: 'Generated',
                questions: [
                    {
                        question: 'Fill in the blank',
                        question_type: 'open_ended',
                        maxPoints: 2,
                        difficulty_score: 1,
                        answers: [
                            { text: 'ran', blankIndex: 1 },
                            { text: 'run', blankIndex: 1 },
                        ],
                    },
                ],
            };
            const createdQuiz = { ...mockQuiz, id: 'quiz-uuid-3' };
            const createdQuestion = { id: 'q-uuid-3' } as any;

            mockQuizRepo.create.mockReturnValue(createdQuiz);
            mockQuizRepo.save.mockResolvedValue(createdQuiz);
            mockQuestionsService.create.mockResolvedValue(createdQuestion);
            mockQuizQuestionsService.create.mockResolvedValue({});
            mockAnswersService.create.mockResolvedValue({});

            await service.createFromAiDraft(draft);

            expect(mockAnswersService.create).toHaveBeenCalledTimes(2);
            expect(mockChoicesService.create).not.toHaveBeenCalled();
        });
    });
});
