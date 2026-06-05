import { Test, TestingModule } from '@nestjs/testing';
import { TeacherGuard } from '../../auth/guards/auth.guard';
import { VocabularyTopicCreateDto } from './dto/vocabulary-topic.create.dto';
import { VocabularyTopicUpdateDto } from './dto/vocabulary-topic.update.dto';
import { VocabularyTopic } from './entities/vocabulary-topic.entity';
import { VocabularyTopicsController } from './vocabulary-topics.controller';
import { VocabularyTopicsService } from './vocabulary-topics.service';

const mockTopic: VocabularyTopic = {
    id: 'topic-uuid-1',
    topic: 'Advanced Vocabulary',
    description: 'Words for C1 learners',
    createdAt: new Date('2024-01-01'),
} as any;

const mockService = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
};

describe('VocabularyTopicsController', () => {
    let controller: VocabularyTopicsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [VocabularyTopicsController],
            providers: [
                { provide: VocabularyTopicsService, useValue: mockService },
            ],
        })
            .overrideGuard(TeacherGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<VocabularyTopicsController>(
            VocabularyTopicsController,
        );
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all vocabulary topics', async () => {
            mockService.findAll.mockResolvedValue([mockTopic]);

            const result = await controller.findAll();

            expect(mockService.findAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual([mockTopic]);
        });
    });

    describe('create', () => {
        it('should create and return a vocabulary topic', async () => {
            const dto: VocabularyTopicCreateDto = {
                topic: 'Advanced Vocabulary',
                description: null,
            };
            mockService.create.mockResolvedValue(mockTopic);

            const result = await controller.create(dto);

            expect(mockService.create).toHaveBeenCalledWith(dto);
            expect(result).toEqual(mockTopic);
        });
    });

    describe('update', () => {
        it('should update and return the topic', async () => {
            const dto: VocabularyTopicUpdateDto = {
                topic: 'Intermediate Vocab',
            };
            mockService.update.mockResolvedValue({
                ...mockTopic,
                topic: 'Intermediate Vocab',
            });

            const result = await controller.update('topic-uuid-1', dto);

            expect(mockService.update).toHaveBeenCalledWith(
                'topic-uuid-1',
                dto,
            );
            expect(result?.topic).toBe('Intermediate Vocab');
        });
    });

    describe('remove', () => {
        it('should remove the vocabulary topic', async () => {
            mockService.remove.mockResolvedValue(undefined);

            await controller.remove('topic-uuid-1');

            expect(mockService.remove).toHaveBeenCalledWith('topic-uuid-1');
        });
    });
});
