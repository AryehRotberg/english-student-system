import { Test, TestingModule } from '@nestjs/testing';
import { TeacherGuard } from '../../auth/guards/auth.guard';
import { VocabularyTopicWordCreateDto } from './dto/vocabulary-topic-word.create.dto';
import { VocabularyTopicWordResponseDto } from './dto/vocabulary-topic-word.response.dto';
import { VocabularyTopicWordsController } from './vocabulary-topic-words.controller';
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

const mockService = {
    findByTopicId: jest.fn(),
    create: jest.fn(),
};

describe('VocabularyTopicWordsController', () => {
    let controller: VocabularyTopicWordsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [VocabularyTopicWordsController],
            providers: [
                { provide: VocabularyTopicWordsService, useValue: mockService },
            ],
        })
            .overrideGuard(TeacherGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<VocabularyTopicWordsController>(
            VocabularyTopicWordsController,
        );
        jest.clearAllMocks();
    });

    describe('findByTopicId', () => {
        it('should return words for the given topicId', async () => {
            mockService.findByTopicId.mockResolvedValue([mockResponse]);

            const result = await controller.findByTopicId({
                topicId: 'topic-uuid-1',
            });

            expect(mockService.findByTopicId).toHaveBeenCalledWith({
                topicId: 'topic-uuid-1',
            });
            expect(result).toEqual([mockResponse]);
        });
    });

    describe('create', () => {
        it('should create and return a vocabulary topic word', async () => {
            const dto: VocabularyTopicWordCreateDto = {
                vocabularyId: 'vocab-uuid-1',
                topicId: 'topic-uuid-1',
            };
            mockService.create.mockResolvedValue(mockResponse);

            const result = await controller.create(dto);

            expect(mockService.create).toHaveBeenCalledWith(dto);
            expect(result).toEqual(mockResponse);
        });
    });
});
