import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VocabularyCreateDto } from './dto/vocabulary.create.dto';
import { VocabularyUpdateDto } from './dto/vocabulary.update.dto';
import { Vocabulary } from './entities/vocabulary.entity';
import { VocabularyService } from './vocabulary.service';

const mockVocabulary: Vocabulary = {
    id: 'vocab-uuid-1',
    word: 'ephemeral',
    meaning: 'lasting a very short time',
    example: 'The ephemeral beauty of cherry blossoms.',
    translation: null,
    createdAt: new Date('2024-01-01'),
} as any;

const mockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
};

describe('VocabularyService', () => {
    let service: VocabularyService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VocabularyService,
                { provide: getRepositoryToken(Vocabulary), useValue: mockRepo },
            ],
        }).compile();

        service = module.get<VocabularyService>(VocabularyService);
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all vocabulary ordered by createdAt DESC', async () => {
            mockRepo.find.mockResolvedValue([mockVocabulary]);

            const result = await service.findAll();

            expect(mockRepo.find).toHaveBeenCalledWith({
                order: { createdAt: 'DESC' },
            });
            expect(result).toEqual([mockVocabulary]);
        });
    });

    describe('create', () => {
        it('should create and save a vocabulary entry', async () => {
            const dto: VocabularyCreateDto = {
                word: 'ephemeral',
                meaning: 'lasting a very short time',
                example: null,
                translation: null,
            };
            mockRepo.create.mockReturnValue(mockVocabulary);
            mockRepo.save.mockResolvedValue(mockVocabulary);

            const result = await service.create(dto);

            expect(mockRepo.create).toHaveBeenCalledWith(
                expect.objectContaining({ word: 'ephemeral' }),
            );
            expect(result).toEqual(mockVocabulary);
        });
    });

    describe('update', () => {
        it('should return null when the entry does not exist', async () => {
            mockRepo.findOne.mockResolvedValue(null);

            const result = await service.update('missing-uuid', {});

            expect(result).toBeNull();
        });

        it('should update fields that are provided', async () => {
            const entity = { ...mockVocabulary };
            mockRepo.findOne.mockResolvedValue(entity);
            mockRepo.save.mockResolvedValue({ ...entity, word: 'transient' });

            const result = await service.update('vocab-uuid-1', {
                word: 'transient',
            } as VocabularyUpdateDto);

            expect(result?.word).toBe('transient');
        });
    });

    describe('remove', () => {
        it('should delete the vocabulary entry by id', async () => {
            mockRepo.delete.mockResolvedValue({ affected: 1 });

            await service.remove('vocab-uuid-1');

            expect(mockRepo.delete).toHaveBeenCalledWith('vocab-uuid-1');
        });
    });
});
