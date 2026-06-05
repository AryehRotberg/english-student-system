import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VocabularyTopicCreateDto } from './dto/vocabulary-topic.create.dto';
import { VocabularyTopicUpdateDto } from './dto/vocabulary-topic.update.dto';
import { VocabularyTopic } from './entities/vocabulary-topic.entity';
import { VocabularyTopicsService } from './vocabulary-topics.service';

const mockTopic: VocabularyTopic = {
    id: 'topic-uuid-1',
    topic: 'Advanced Vocabulary',
    description: 'Words for C1 learners',
    createdAt: new Date('2024-01-01'),
} as any;

const mockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
};

describe('VocabularyTopicsService', () => {
    let service: VocabularyTopicsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VocabularyTopicsService,
                {
                    provide: getRepositoryToken(VocabularyTopic),
                    useValue: mockRepo,
                },
            ],
        }).compile();

        service = module.get<VocabularyTopicsService>(VocabularyTopicsService);
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all topics ordered by createdAt DESC', async () => {
            mockRepo.find.mockResolvedValue([mockTopic]);

            const result = await service.findAll();

            expect(mockRepo.find).toHaveBeenCalledWith({
                order: { createdAt: 'DESC' },
            });
            expect(result).toEqual([mockTopic]);
        });
    });

    describe('create', () => {
        it('should create and save a vocabulary topic', async () => {
            const dto: VocabularyTopicCreateDto = {
                topic: 'Advanced Vocabulary',
                description: 'Words for C1 learners',
            };
            mockRepo.create.mockReturnValue(mockTopic);
            mockRepo.save.mockResolvedValue(mockTopic);

            const result = await service.create(dto);

            expect(mockRepo.create).toHaveBeenCalledWith(
                expect.objectContaining({ topic: 'Advanced Vocabulary' }),
            );
            expect(result).toEqual(mockTopic);
        });
    });

    describe('update', () => {
        it('should return null when the topic does not exist', async () => {
            mockRepo.findOne.mockResolvedValue(null);

            const result = await service.update('missing-uuid', {});

            expect(result).toBeNull();
        });

        it('should update fields that are provided', async () => {
            mockRepo.findOne.mockResolvedValue({ ...mockTopic });
            mockRepo.save.mockResolvedValue({
                ...mockTopic,
                topic: 'Intermediate Vocab',
            });

            const result = await service.update('topic-uuid-1', {
                topic: 'Intermediate Vocab',
            } as VocabularyTopicUpdateDto);

            expect(result?.topic).toBe('Intermediate Vocab');
        });
    });

    describe('remove', () => {
        it('should delete the topic by id', async () => {
            mockRepo.delete.mockResolvedValue({ affected: 1 });

            await service.remove('topic-uuid-1');

            expect(mockRepo.delete).toHaveBeenCalledWith('topic-uuid-1');
        });
    });
});
