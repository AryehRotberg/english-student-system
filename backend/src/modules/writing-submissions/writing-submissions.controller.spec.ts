import { Test, TestingModule } from '@nestjs/testing';
import { TeacherGuard } from '../../auth/guards/auth.guard';
import { WritingSubmissionCreateDto } from './dto/writing-submission.create.dto';
import { WritingSubmissionUpdateDto } from './dto/writing-submission.update.dto';
import { WritingSubmission } from './entities/writing-submission.entity';
import { WritingSubmissionsController } from './writing-submissions.controller';
import { WritingSubmissionsService } from './writing-submissions.service';

const mockSubmission: WritingSubmission = {
    id: 'sub-uuid-1',
    taskId: 'task-uuid-1',
    userId: 'user-uuid-1',
    content: 'My essay content.',
    feedback: null,
    score: null,
    submittedAt: new Date('2024-01-01'),
    reviewedAt: null,
} as any;

const mockService = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
};

describe('WritingSubmissionsController', () => {
    let controller: WritingSubmissionsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [WritingSubmissionsController],
            providers: [
                { provide: WritingSubmissionsService, useValue: mockService },
            ],
        })
            .overrideGuard(TeacherGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<WritingSubmissionsController>(
            WritingSubmissionsController,
        );
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all submissions matching the filter', async () => {
            mockService.findAll.mockResolvedValue([mockSubmission]);

            const result = await controller.findAll({
                userId: 'user-uuid-1',
            } as any);

            expect(mockService.findAll).toHaveBeenCalledWith({
                userId: 'user-uuid-1',
            });
            expect(result).toEqual([mockSubmission]);
        });
    });

    describe('create', () => {
        it('should create and return a writing submission', async () => {
            const dto: WritingSubmissionCreateDto = {
                taskId: 'task-uuid-1',
                userId: 'user-uuid-1',
                content: 'My essay.',
            };
            mockService.create.mockResolvedValue(mockSubmission);

            const result = await controller.create(dto);

            expect(mockService.create).toHaveBeenCalledWith(dto);
            expect(result).toEqual(mockSubmission);
        });
    });

    describe('update', () => {
        it('should update and return the submission', async () => {
            const dto: WritingSubmissionUpdateDto = {
                feedback: 'Well done!',
                score: 90,
            };
            mockService.update.mockResolvedValue({
                ...mockSubmission,
                feedback: 'Well done!',
                score: 90,
            });

            const result = await controller.update('sub-uuid-1', dto);

            expect(mockService.update).toHaveBeenCalledWith('sub-uuid-1', dto);
            expect(result?.feedback).toBe('Well done!');
        });
    });
});
