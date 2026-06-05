import { Test, TestingModule } from '@nestjs/testing';
import { TeacherGuard } from '../../auth/guards/auth.guard';
import { VocabularyCreateDto } from './dto/vocabulary.create.dto';
import { VocabularyUpdateDto } from './dto/vocabulary.update.dto';
import { Vocabulary } from './entities/vocabulary.entity';
import { VocabularyController } from './vocabulary.controller';
import { VocabularyService } from './vocabulary.service';

const mockVocabulary: Vocabulary = {
    id: 'vocab-uuid-1',
    word: 'ephemeral',
    meaning: 'lasting a very short time',
    example: null,
    translation: null,
    createdAt: new Date('2024-01-01'),
} as any;

const mockService = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
};

describe('VocabularyController', () => {
    let controller: VocabularyController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [VocabularyController],
            providers: [{ provide: VocabularyService, useValue: mockService }],
        })
            .overrideGuard(TeacherGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<VocabularyController>(VocabularyController);
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all vocabulary', async () => {
            mockService.findAll.mockResolvedValue([mockVocabulary]);

            const result = await controller.findAll();

            expect(mockService.findAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual([mockVocabulary]);
        });
    });

    describe('create', () => {
        it('should create and return a vocabulary entry', async () => {
            const dto: VocabularyCreateDto = {
                word: 'ephemeral',
                meaning: 'short-lived',
                example: null,
                translation: null,
            };
            mockService.create.mockResolvedValue(mockVocabulary);

            const result = await controller.create(dto);

            expect(mockService.create).toHaveBeenCalledWith(dto);
            expect(result).toEqual(mockVocabulary);
        });
    });

    describe('update', () => {
        it('should update and return the vocabulary entry', async () => {
            const dto: VocabularyUpdateDto = { word: 'transient' };
            mockService.update.mockResolvedValue({
                ...mockVocabulary,
                word: 'transient',
            });

            const result = await controller.update('vocab-uuid-1', dto);

            expect(mockService.update).toHaveBeenCalledWith(
                'vocab-uuid-1',
                dto,
            );
            expect(result?.word).toBe('transient');
        });
    });

    describe('remove', () => {
        it('should remove the vocabulary entry', async () => {
            mockService.remove.mockResolvedValue(undefined);

            await controller.remove('vocab-uuid-1');

            expect(mockService.remove).toHaveBeenCalledWith('vocab-uuid-1');
        });
    });
});
