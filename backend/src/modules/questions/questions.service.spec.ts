import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { QuestionsService } from './questions.service';

const mockQuestion: Question = {
    id: 'uuid-1',
    question: 'What is the past tense of "run"?',
    questionType: 'multiple-choice',
    hints: null,
    topics: [],
    createdAt: new Date('2024-01-01'),
};

const mockQuestionRepo = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
};

describe('QuestionsService', () => {
    let service: QuestionsService;
    let repo: jest.Mocked<Repository<Question>>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                QuestionsService,
                {
                    provide: getRepositoryToken(Question),
                    useValue: mockQuestionRepo,
                },
            ],
        }).compile();

        service = module.get<QuestionsService>(QuestionsService);
        repo = module.get(getRepositoryToken(Question));

        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all questions ordered by createdAt DESC', async () => {
            repo.find.mockResolvedValue([mockQuestion]);

            const result = await service.findAll();

            expect(repo.find).toHaveBeenCalledWith({
                order: { createdAt: 'DESC' },
            });
            expect(result).toEqual([mockQuestion]);
        });

        it('should return an empty array when no questions exist', async () => {
            repo.find.mockResolvedValue([]);

            const result = await service.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('create', () => {
        const dto = {
            question: 'What is the past tense of "run"?',
            questionType: 'multiple-choice',
        };

        it('should create and save a question entity', async () => {
            repo.create.mockReturnValue(mockQuestion);
            repo.save.mockResolvedValue(mockQuestion);

            const result = await service.create(dto);

            expect(repo.create).toHaveBeenCalledWith({
                question: dto.question,
                questionType: dto.questionType,
            });
            expect(repo.save).toHaveBeenCalledWith(mockQuestion);
            expect(result).toEqual(mockQuestion);
        });
    });

    describe('remove', () => {
        it('should delete a question by id', async () => {
            repo.delete.mockResolvedValue({ affected: 1, raw: [] });

            await service.remove('uuid-1');

            expect(repo.delete).toHaveBeenCalledWith('uuid-1');
        });
    });
});
