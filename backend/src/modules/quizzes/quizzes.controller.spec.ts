import { Test, TestingModule } from '@nestjs/testing';
import { TeacherGuard } from '../../auth/guards/auth.guard';
import { QuizAiDraftCreateDto, QuizCreateDto } from './dto/quiz.create.dto';
import { Quiz } from './entities/quiz.entity';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';

const mockQuiz: Quiz = {
    id: 'quiz-uuid-1',
    title: 'Vocab Quiz',
    description: 'A vocabulary quiz',
    category: null,
    level: null,
    createdAt: new Date('2024-01-01'),
} as any;

const mockService = {
    findAll: jest.fn(),
    create: jest.fn(),
    createFromAiDraft: jest.fn(),
    remove: jest.fn(),
};

describe('QuizzesController', () => {
    let controller: QuizzesController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [QuizzesController],
            providers: [{ provide: QuizzesService, useValue: mockService }],
        })
            .overrideGuard(TeacherGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<QuizzesController>(QuizzesController);
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return quizzes, passing category and level from query', async () => {
            mockService.findAll.mockResolvedValue([mockQuiz]);

            const result = await controller.findAll({
                category: 'vocabulary' as any,
                level: 'B1' as any,
            });

            expect(mockService.findAll).toHaveBeenCalledWith(
                'vocabulary',
                'B1',
            );
            expect(result).toEqual([mockQuiz]);
        });
    });

    describe('create', () => {
        it('should create a quiz when given a QuizCreateDto instance', async () => {
            // The controller uses `instanceof QuizCreateDto`, so a real instance is required
            const dto = Object.assign(new QuizCreateDto(), {
                title: 'Vocab Quiz',
                description: 'Test',
            });
            mockService.create.mockResolvedValue(mockQuiz);

            const result = await controller.create(dto);

            expect(mockService.create).toHaveBeenCalledWith(dto);
            expect(result).toEqual(mockQuiz);
        });

        it('should call createFromAiDraft when given a QuizAiDraftCreateDto (non-QuizCreateDto instance)', async () => {
            const dto: QuizAiDraftCreateDto = {
                title: 'AI Quiz',
                description: 'Generated',
                questions: [],
            };
            mockService.createFromAiDraft.mockResolvedValue(mockQuiz);

            const result = await controller.create(dto);

            expect(mockService.createFromAiDraft).toHaveBeenCalledWith(dto);
            expect(result).toEqual(mockQuiz);
        });
    });

    describe('remove', () => {
        it('should remove a quiz by id', async () => {
            mockService.remove.mockResolvedValue(undefined);

            await controller.remove('quiz-uuid-1');

            expect(mockService.remove).toHaveBeenCalledWith('quiz-uuid-1');
        });
    });
});
