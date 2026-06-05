import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VocabularyTopicWordCreateDto } from './dto/vocabulary-topic-word.create.dto';
import { VocabularyTopicWordResponseDto } from './dto/vocabulary-topic-word.response.dto';
import { VocabularyTopicWord } from './entities/vocabulary-topic-word.entity';
import { VocabularyTopicWordsService } from './vocabulary-topic-words.service';

const mockResponse = {
    id: 'vtw-uuid-1',
    vocabularyId: 'vocab-uuid-1',
    topicId: 'topic-uuid-1',
    word: 'ephemeral',
    meaning: 'short-lived',
    example: null,
    translation: null,
    topic: 'Advanced Vocabulary',
    createdAt: new Date('2024-01-01'),
} as VocabularyTopicWordResponseDto;

const mockFullEntity = {
    id: 'vtw-uuid-1',
    vocabularyId: 'vocab-uuid-1',
    topicId: 'topic-uuid-1',
    createdAt: new Date('2024-01-01'),
    vocabulary: {
        word: 'ephemeral',
        meaning: 'short-lived',
        example: null,
        translation: null,
    },
    topic: { topic: 'Advanced Vocabulary' },
};

const mockRepo = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
};

// VocabularyTopicWordResponseDto uses static factory methods
jest.spyOn(VocabularyTopicWordResponseDto, 'fromEntities').mockReturnValue([
    mockResponse,
] as any);
jest.spyOn(VocabularyTopicWordResponseDto, 'fromEntity').mockReturnValue(
    mockResponse as any,
);

describe('VocabularyTopicWordsService', () => {
    let service: VocabularyTopicWordsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VocabularyTopicWordsService,
                {
                    provide: getRepositoryToken(VocabularyTopicWord),
                    useValue: mockRepo,
                },
            ],
        }).compile();

        service = module.get<VocabularyTopicWordsService>(
            VocabularyTopicWordsService,
        );
        jest.clearAllMocks();
        jest.spyOn(
            VocabularyTopicWordResponseDto,
            'fromEntities',
        ).mockReturnValue([mockResponse] as any);
        jest.spyOn(
            VocabularyTopicWordResponseDto,
            'fromEntity',
        ).mockReturnValue(mockResponse as any);
    });

    describe('findByTopicId', () => {
        it('should return mapped response DTOs for a given topicId', async () => {
            mockRepo.find.mockResolvedValue([mockFullEntity]);

            const result = await service.findByTopicId({
                topicId: 'topic-uuid-1',
            });

            expect(mockRepo.find).toHaveBeenCalledWith({
                where: { topicId: 'topic-uuid-1' },
                relations: ['vocabulary', 'topic'],
                order: { createdAt: 'DESC' },
            });
            expect(result).toEqual([mockResponse]);
        });
    });

    describe('create', () => {
        it('should create, save, reload with relations, and return a response DTO', async () => {
            const dto: VocabularyTopicWordCreateDto = {
                vocabularyId: 'vocab-uuid-1',
                topicId: 'topic-uuid-1',
            };
            const savedEntity = { id: 'vtw-uuid-1', ...dto };
            mockRepo.create.mockReturnValue(savedEntity);
            mockRepo.save.mockResolvedValue(savedEntity);
            mockRepo.findOne.mockResolvedValue(mockFullEntity);

            const result = await service.create(dto);

            expect(mockRepo.create).toHaveBeenCalledWith({
                vocabularyId: dto.vocabularyId,
                topicId: dto.topicId,
            });
            expect(mockRepo.findOne).toHaveBeenCalledWith({
                where: { id: 'vtw-uuid-1' },
                relations: ['vocabulary', 'topic'],
            });
            expect(result).toEqual(mockResponse);
        });
    });
});
