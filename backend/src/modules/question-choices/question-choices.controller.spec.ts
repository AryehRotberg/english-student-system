import { Test, TestingModule } from '@nestjs/testing';
import { TeacherGuard } from '../../auth/guards/auth.guard';
import { QuestionChoiceCreateDto } from './dto/question-choice.create.dto';
import { QuestionChoiceUpdateDto } from './dto/question-choice.update.dto';
import { QuestionChoice } from './entities/question-choice.entity';
import { QuestionChoicesController } from './question-choices.controller';
import { QuestionChoicesService } from './question-choices.service';

const mockChoice: QuestionChoice = {
    id: 'uuid-1',
    questionId: 'q-uuid-1',
    optionText: 'ran',
    isCorrect: true,
    createdAt: new Date('2024-01-01'),
} as any;

const mockService = {
    findByQuestionId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
};

describe('QuestionChoicesController', () => {
    let controller: QuestionChoicesController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [QuestionChoicesController],
            providers: [
                { provide: QuestionChoicesService, useValue: mockService },
            ],
        })
            .overrideGuard(TeacherGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<QuestionChoicesController>(
            QuestionChoicesController,
        );
        jest.clearAllMocks();
    });

    describe('findByQuestionId', () => {
        it('should return choices for the given questionId', async () => {
            mockService.findByQuestionId.mockResolvedValue([mockChoice]);

            const result = await controller.findByQuestionId({
                questionId: 'q-uuid-1',
            });

            expect(mockService.findByQuestionId).toHaveBeenCalledWith({
                questionId: 'q-uuid-1',
            });
            expect(result).toEqual([mockChoice]);
        });
    });

    describe('create', () => {
        it('should create and return a question choice', async () => {
            const dto: QuestionChoiceCreateDto = {
                questionId: 'q-uuid-1',
                optionText: 'ran',
                isCorrect: true,
            };
            mockService.create.mockResolvedValue(mockChoice);

            const result = await controller.create(dto);

            expect(mockService.create).toHaveBeenCalledWith(dto);
            expect(result).toEqual(mockChoice);
        });
    });

    describe('update', () => {
        it('should update and return the question choice', async () => {
            const dto: QuestionChoiceUpdateDto = { optionText: 'running' };
            mockService.update.mockResolvedValue({
                ...mockChoice,
                optionText: 'running',
            });

            const result = await controller.update('uuid-1', dto);

            expect(mockService.update).toHaveBeenCalledWith('uuid-1', dto);
            expect(result.optionText).toBe('running');
        });
    });
});
