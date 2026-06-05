import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReadingCreateDto } from './dto/reading.create.dto';
import { ReadingUpdateDto } from './dto/reading.update.dto';
import { Reading } from './entities/reading.entity';
import { ReadingsService } from './readings.service';

const mockReading: Reading = {
    id: 'reading-uuid-1',
    title: 'The Fox and the Crow',
    content: 'Once upon a time...',
    level: 'A2' as any,
    quizId: null,
    vocabularyTopicId: null,
    createdAt: new Date('2024-01-01'),
    quiz: null,
    vocabularyTopic: null,
} as any;

const mockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
};

describe('ReadingsService', () => {
    let service: ReadingsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReadingsService,
                { provide: getRepositoryToken(Reading), useValue: mockRepo },
            ],
        }).compile();

        service = module.get<ReadingsService>(ReadingsService);
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all readings ordered by createdAt DESC', async () => {
            mockRepo.find.mockResolvedValue([mockReading]);

            const result = await service.findAll();

            expect(mockRepo.find).toHaveBeenCalledWith({
                order: { createdAt: 'DESC' },
            });
            expect(result).toEqual([mockReading]);
        });
    });

    describe('findOne', () => {
        it('should return a reading with quiz and vocabularyTopic relations', async () => {
            mockRepo.findOne.mockResolvedValue(mockReading);

            const result = await service.findOne('reading-uuid-1');

            expect(mockRepo.findOne).toHaveBeenCalledWith({
                where: { id: 'reading-uuid-1' },
                relations: ['quiz', 'vocabularyTopic'],
            });
            expect(result).toEqual(mockReading);
        });

        it('should return null when not found', async () => {
            mockRepo.findOne.mockResolvedValue(null);

            const result = await service.findOne('missing-uuid');

            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('should create and save a reading', async () => {
            const dto: ReadingCreateDto = {
                title: 'The Fox',
                content: 'Once...',
                level: 'A2' as any,
            };
            mockRepo.create.mockReturnValue(mockReading);
            mockRepo.save.mockResolvedValue(mockReading);

            const result = await service.create(dto);

            expect(mockRepo.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'The Fox',
                    content: 'Once...',
                }),
            );
            expect(result).toEqual(mockReading);
        });
    });

    describe('update', () => {
        it('should return null when the reading does not exist', async () => {
            mockRepo.findOne.mockResolvedValue(null);

            const result = await service.update('missing-uuid', {
                title: 'New',
            } as ReadingUpdateDto);

            expect(result).toBeNull();
        });

        it('should update provided fields and save', async () => {
            mockRepo.findOne.mockResolvedValue({ ...mockReading });
            mockRepo.save.mockResolvedValue({
                ...mockReading,
                title: 'New Title',
            });

            const result = await service.update('reading-uuid-1', {
                title: 'New Title',
            } as ReadingUpdateDto);

            expect(mockRepo.save).toHaveBeenCalled();
            expect(result?.title).toBe('New Title');
        });
    });

    describe('remove', () => {
        it('should delete the reading by id', async () => {
            mockRepo.delete.mockResolvedValue({ affected: 1 });

            await service.remove('reading-uuid-1');

            expect(mockRepo.delete).toHaveBeenCalledWith('reading-uuid-1');
        });
    });
});
