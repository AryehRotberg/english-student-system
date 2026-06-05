import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WritingTaskCreateDto } from './dto/writing-task.create.dto';
import { WritingTask } from './entities/writing-task.entity';
import { WritingTasksService } from './writing-tasks.service';

const mockTask: WritingTask = {
    id: 'task-uuid-1',
    title: 'Write about your weekend',
    instructions: 'Write at least 150 words.',
    minWords: 150,
    createdAt: new Date('2024-01-01'),
} as any;

const mockRepo = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
};

describe('WritingTasksService', () => {
    let service: WritingTasksService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WritingTasksService,
                {
                    provide: getRepositoryToken(WritingTask),
                    useValue: mockRepo,
                },
            ],
        }).compile();

        service = module.get<WritingTasksService>(WritingTasksService);
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all writing tasks ordered by createdAt DESC', async () => {
            mockRepo.find.mockResolvedValue([mockTask]);

            const result = await service.findAll();

            expect(mockRepo.find).toHaveBeenCalledWith({
                order: { createdAt: 'DESC' },
            });
            expect(result).toEqual([mockTask]);
        });
    });

    describe('create', () => {
        it('should create and save a writing task', async () => {
            const dto: WritingTaskCreateDto = {
                title: 'Write about your weekend',
                instructions: 'Write at least 150 words.',
                minWords: 150,
            };
            mockRepo.create.mockReturnValue(mockTask);
            mockRepo.save.mockResolvedValue(mockTask);

            const result = await service.create(dto);

            expect(mockRepo.create).toHaveBeenCalledWith({
                title: dto.title,
                instructions: dto.instructions,
                minWords: dto.minWords,
            });
            expect(result).toEqual(mockTask);
        });

        it('should set minWords to null when not provided', async () => {
            const dto: WritingTaskCreateDto = {
                title: 'Write a story',
                instructions: 'Be creative.',
            };
            mockRepo.create.mockReturnValue({ ...mockTask, minWords: null });
            mockRepo.save.mockResolvedValue({ ...mockTask, minWords: null });

            await service.create(dto);

            expect(mockRepo.create).toHaveBeenCalledWith(
                expect.objectContaining({ minWords: null }),
            );
        });
    });
});
