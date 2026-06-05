import { Test, TestingModule } from '@nestjs/testing';
import { TeacherGuard } from '../../auth/guards/auth.guard';
import { ReadingCreateDto } from './dto/reading.create.dto';
import { ReadingUpdateDto } from './dto/reading.update.dto';
import { Reading } from './entities/reading.entity';
import { ReadingsController } from './readings.controller';
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

const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
};

describe('ReadingsController', () => {
    let controller: ReadingsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ReadingsController],
            providers: [{ provide: ReadingsService, useValue: mockService }],
        })
            .overrideGuard(TeacherGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<ReadingsController>(ReadingsController);
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all readings', async () => {
            mockService.findAll.mockResolvedValue([mockReading]);

            const result = await controller.findAll();

            expect(mockService.findAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual([mockReading]);
        });
    });

    describe('findOne', () => {
        it('should return a single reading by id', async () => {
            mockService.findOne.mockResolvedValue(mockReading);

            const result = await controller.findOne('reading-uuid-1');

            expect(mockService.findOne).toHaveBeenCalledWith('reading-uuid-1');
            expect(result).toEqual(mockReading);
        });
    });

    describe('create', () => {
        it('should create and return a reading', async () => {
            const dto: ReadingCreateDto = {
                title: 'The Fox',
                content: 'Once...',
                level: 'A2' as any,
            };
            mockService.create.mockResolvedValue(mockReading);

            const result = await controller.create(dto);

            expect(mockService.create).toHaveBeenCalledWith(dto);
            expect(result).toEqual(mockReading);
        });
    });

    describe('update', () => {
        it('should update and return the reading', async () => {
            const dto: ReadingUpdateDto = { title: 'New Title' } as any;
            mockService.update.mockResolvedValue({
                ...mockReading,
                title: 'New Title',
            });

            const result = await controller.update('reading-uuid-1', dto);

            expect(mockService.update).toHaveBeenCalledWith(
                'reading-uuid-1',
                dto,
            );
            expect(result?.title).toBe('New Title');
        });
    });

    describe('remove', () => {
        it('should remove the reading by id', async () => {
            mockService.remove.mockResolvedValue(undefined);

            await controller.remove('reading-uuid-1');

            expect(mockService.remove).toHaveBeenCalledWith('reading-uuid-1');
        });
    });
});
