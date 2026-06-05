import { Test, TestingModule } from '@nestjs/testing';
import { TeacherGuard } from '../../auth/guards/auth.guard';
import { QuestionAcceptedAnswerCreateDto } from './dto/question-accepted-answer.create.dto';
import { QuestionAcceptedAnswerUpdateDto } from './dto/question-accepted-answer.update.dto';
import { QuestionAcceptedAnswer } from './entities/question-accepted-answer.entity';
import { QuestionAcceptedAnswersController } from './question-accepted-answers.controller';
import { QuestionAcceptedAnswersService } from './question-accepted-answers.service';

const mockAnswer: QuestionAcceptedAnswer = {
    id: 'uuid-1',
    questionId: 'q-uuid-1',
    answer: 'ran',
    blankIndex: 1,
    createdAt: new Date('2024-01-01'),
} as any;

const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
};

describe('QuestionAcceptedAnswersController', () => {
    let controller: QuestionAcceptedAnswersController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [QuestionAcceptedAnswersController],
            providers: [
                {
                    provide: QuestionAcceptedAnswersService,
                    useValue: mockService,
                },
            ],
        })
            .overrideGuard(TeacherGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<QuestionAcceptedAnswersController>(
            QuestionAcceptedAnswersController,
        );
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create and return an accepted answer', async () => {
            const dto: QuestionAcceptedAnswerCreateDto = {
                questionId: 'q-uuid-1',
                answer: 'ran',
                blankIndex: 1,
            };
            mockService.create.mockResolvedValue(mockAnswer);

            const result = await controller.create(dto);

            expect(mockService.create).toHaveBeenCalledWith(dto);
            expect(result).toEqual(mockAnswer);
        });
    });

    describe('findAll', () => {
        it('should return all accepted answers', async () => {
            mockService.findAll.mockResolvedValue([mockAnswer]);

            const result = await controller.findAll();

            expect(result).toEqual([mockAnswer]);
        });
    });

    describe('findOne', () => {
        it('should return a single answer by id', async () => {
            mockService.findOne.mockResolvedValue(mockAnswer);

            const result = await controller.findOne('uuid-1');

            expect(mockService.findOne).toHaveBeenCalledWith('uuid-1');
            expect(result).toEqual(mockAnswer);
        });
    });

    describe('update', () => {
        it('should update and return the answer', async () => {
            const dto: QuestionAcceptedAnswerUpdateDto = { answer: 'run' };
            mockService.update.mockResolvedValue({
                ...mockAnswer,
                answer: 'run',
            });

            const result = await controller.update('uuid-1', dto);

            expect(mockService.update).toHaveBeenCalledWith('uuid-1', dto);
            expect(result?.answer).toBe('run');
        });
    });

    describe('remove', () => {
        it('should remove and return the deleted answer', async () => {
            mockService.remove.mockResolvedValue(mockAnswer);

            const result = await controller.remove('uuid-1');

            expect(mockService.remove).toHaveBeenCalledWith('uuid-1');
            expect(result).toEqual(mockAnswer);
        });
    });
});
