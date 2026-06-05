import { Test, TestingModule } from '@nestjs/testing';
import { TeacherGuard } from '../../auth/guards/auth.guard';
import { WritingTaskCreateDto } from './dto/writing-task.create.dto';
import { WritingTask } from './entities/writing-task.entity';
import { WritingTasksController } from './writing-tasks.controller';
import { WritingTasksService } from './writing-tasks.service';

const mockTask: WritingTask = {
    id: 'task-uuid-1',
    title: 'Write about your weekend',
    instructions: 'Write at least 150 words.',
    minWords: 150,
    createdAt: new Date('2024-01-01'),
} as any;

const mockService = {
    findAll: jest.fn(),
    create: jest.fn(),
};

describe('WritingTasksController', () => {
    let controller: WritingTasksController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [WritingTasksController],
            providers: [
                { provide: WritingTasksService, useValue: mockService },
            ],
        })
            .overrideGuard(TeacherGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<WritingTasksController>(WritingTasksController);
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all writing tasks', async () => {
            mockService.findAll.mockResolvedValue([mockTask]);

            const result = await controller.findAll();

            expect(mockService.findAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual([mockTask]);
        });
    });

    describe('create', () => {
        it('should create and return a writing task', async () => {
            const dto: WritingTaskCreateDto = {
                title: 'Write about your weekend',
                instructions: 'Write at least 150 words.',
                minWords: 150,
            };
            mockService.create.mockResolvedValue(mockTask);

            const result = await controller.create(dto);

            expect(mockService.create).toHaveBeenCalledWith(dto);
            expect(result).toEqual(mockTask);
        });
    });
});
