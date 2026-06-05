import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QuestionChoiceCreateDto } from './dto/question-choice.create.dto';
import { QuestionChoiceUpdateDto } from './dto/question-choice.update.dto';
import { QuestionChoice } from './entities/question-choice.entity';
import { QuestionChoicesService } from './question-choices.service';

const mockChoice: QuestionChoice = {
    id: 'uuid-1',
    questionId: 'q-uuid-1',
    optionText: 'ran',
    isCorrect: true,
    createdAt: new Date('2024-01-01'),
} as any;

const mockRepo = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    findOneBy: jest.fn(),
};

describe('QuestionChoicesService', () => {
    let service: QuestionChoicesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                QuestionChoicesService,
                {
                    provide: getRepositoryToken(QuestionChoice),
                    useValue: mockRepo,
                },
            ],
        }).compile();

        service = module.get<QuestionChoicesService>(QuestionChoicesService);
        jest.clearAllMocks();
    });

    describe('findByQuestionId', () => {
        it('should return choices for a given questionId', async () => {
            mockRepo.find.mockResolvedValue([mockChoice]);

            const result = await service.findByQuestionId({
                questionId: 'q-uuid-1',
            });

            expect(mockRepo.find).toHaveBeenCalledWith({
                where: { questionId: 'q-uuid-1' },
            });
            expect(result).toEqual([mockChoice]);
        });
    });

    describe('create', () => {
        it('should create and save a question choice', async () => {
            const dto: QuestionChoiceCreateDto = {
                questionId: 'q-uuid-1',
                optionText: 'ran',
                isCorrect: true,
            };
            mockRepo.create.mockReturnValue(mockChoice);
            mockRepo.save.mockResolvedValue(mockChoice);

            const result = await service.create(dto);

            expect(mockRepo.create).toHaveBeenCalledWith({
                questionId: dto.questionId,
                optionText: dto.optionText,
                isCorrect: dto.isCorrect,
            });
            expect(result).toEqual(mockChoice);
        });
    });

    describe('update', () => {
        it('should update and return the updated choice', async () => {
            const dto: QuestionChoiceUpdateDto = { optionText: 'running' };
            mockRepo.update.mockResolvedValue({ affected: 1 });
            mockRepo.findOneBy.mockResolvedValue({
                ...mockChoice,
                optionText: 'running',
            });

            const result = await service.update('uuid-1', dto);

            expect(mockRepo.update).toHaveBeenCalledWith('uuid-1', {
                optionText: 'running',
            });
            expect(result.optionText).toBe('running');
        });

        it('should throw NotFoundException when entity is not found after update', async () => {
            mockRepo.update.mockResolvedValue({ affected: 0 });
            mockRepo.findOneBy.mockResolvedValue(null);

            await expect(service.update('missing-uuid', {})).rejects.toThrow(
                NotFoundException,
            );
        });
    });
});
