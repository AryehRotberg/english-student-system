import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QuestionAcceptedAnswerCreateDto } from './dto/question-accepted-answer.create.dto';
import { QuestionAcceptedAnswerUpdateDto } from './dto/question-accepted-answer.update.dto';
import { QuestionAcceptedAnswer } from './entities/question-accepted-answer.entity';
import { QuestionAcceptedAnswersService } from './question-accepted-answers.service';

const mockAnswer: QuestionAcceptedAnswer = {
    id: 'uuid-1',
    questionId: 'q-uuid-1',
    answer: 'ran',
    blankIndex: 1,
    createdAt: new Date('2024-01-01'),
} as any;

const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
};

describe('QuestionAcceptedAnswersService', () => {
    let service: QuestionAcceptedAnswersService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                QuestionAcceptedAnswersService,
                {
                    provide: getRepositoryToken(QuestionAcceptedAnswer),
                    useValue: mockRepo,
                },
            ],
        }).compile();

        service = module.get<QuestionAcceptedAnswersService>(
            QuestionAcceptedAnswersService,
        );
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create and save a new accepted answer', async () => {
            const dto: QuestionAcceptedAnswerCreateDto = {
                questionId: 'q-uuid-1',
                answer: 'ran',
                blankIndex: 1,
            };
            mockRepo.create.mockReturnValue(mockAnswer);
            mockRepo.save.mockResolvedValue(mockAnswer);

            const result = await service.create(dto);

            expect(mockRepo.create).toHaveBeenCalledWith({
                questionId: dto.questionId,
                answer: dto.answer,
                blankIndex: dto.blankIndex,
            });
            expect(result).toEqual(mockAnswer);
        });
    });

    describe('findAll', () => {
        it('should return all answers ordered by createdAt DESC', async () => {
            mockRepo.find.mockResolvedValue([mockAnswer]);

            const result = await service.findAll();

            expect(mockRepo.find).toHaveBeenCalledWith({
                order: { createdAt: 'DESC' },
            });
            expect(result).toEqual([mockAnswer]);
        });
    });

    describe('findOne', () => {
        it('should return a single answer by id', async () => {
            mockRepo.findOneBy.mockResolvedValue(mockAnswer);

            const result = await service.findOne('uuid-1');

            expect(mockRepo.findOneBy).toHaveBeenCalledWith({ id: 'uuid-1' });
            expect(result).toEqual(mockAnswer);
        });

        it('should return null when not found', async () => {
            mockRepo.findOneBy.mockResolvedValue(null);

            const result = await service.findOne('missing-uuid');

            expect(result).toBeNull();
        });
    });

    describe('update', () => {
        it('should update specified fields and return the updated entity', async () => {
            const dto: QuestionAcceptedAnswerUpdateDto = { answer: 'run' };
            mockRepo.update.mockResolvedValue({ affected: 1 });
            mockRepo.findOneBy.mockResolvedValue({
                ...mockAnswer,
                answer: 'run',
            });

            const result = await service.update('uuid-1', dto);

            expect(mockRepo.update).toHaveBeenCalledWith('uuid-1', {
                answer: 'run',
            });
            expect(result?.answer).toBe('run');
        });

        it('should not include undefined fields in the update payload', async () => {
            const dto: QuestionAcceptedAnswerUpdateDto = {};
            mockRepo.update.mockResolvedValue({ affected: 1 });
            mockRepo.findOneBy.mockResolvedValue(mockAnswer);

            await service.update('uuid-1', dto);

            expect(mockRepo.update).toHaveBeenCalledWith('uuid-1', {});
        });
    });

    describe('remove', () => {
        it('should delete the entity and return it', async () => {
            mockRepo.findOneBy.mockResolvedValue(mockAnswer);
            mockRepo.delete.mockResolvedValue({ affected: 1 });

            const result = await service.remove('uuid-1');

            expect(mockRepo.delete).toHaveBeenCalledWith('uuid-1');
            expect(result).toEqual(mockAnswer);
        });
    });
});
