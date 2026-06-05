import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WritingSubmissionCreateDto } from './dto/writing-submission.create.dto';
import { WritingSubmissionFilterDto } from './dto/writing-submission.query.dto';
import { WritingSubmissionUpdateDto } from './dto/writing-submission.update.dto';
import { WritingSubmission } from './entities/writing-submission.entity';
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

const mockRepo = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    findOneBy: jest.fn(),
};

describe('WritingSubmissionsService', () => {
    let service: WritingSubmissionsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WritingSubmissionsService,
                {
                    provide: getRepositoryToken(WritingSubmission),
                    useValue: mockRepo,
                },
            ],
        }).compile();

        service = module.get<WritingSubmissionsService>(
            WritingSubmissionsService,
        );
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all submissions when no filter is provided', async () => {
            mockRepo.find.mockResolvedValue([mockSubmission]);

            const result = await service.findAll({});

            expect(mockRepo.find).toHaveBeenCalledWith({
                where: {},
                order: { submittedAt: 'DESC' },
            });
            expect(result).toEqual([mockSubmission]);
        });

        it('should filter by userId when provided', async () => {
            const filter: WritingSubmissionFilterDto = {
                userId: 'user-uuid-1',
            };
            mockRepo.find.mockResolvedValue([mockSubmission]);

            await service.findAll(filter);

            expect(mockRepo.find).toHaveBeenCalledWith({
                where: { userId: 'user-uuid-1' },
                order: { submittedAt: 'DESC' },
            });
        });

        it('should filter by both userId and taskId when provided', async () => {
            const filter: WritingSubmissionFilterDto = {
                userId: 'user-uuid-1',
                taskId: 'task-uuid-1',
            };
            mockRepo.find.mockResolvedValue([mockSubmission]);

            await service.findAll(filter);

            expect(mockRepo.find).toHaveBeenCalledWith({
                where: { userId: 'user-uuid-1', taskId: 'task-uuid-1' },
                order: { submittedAt: 'DESC' },
            });
        });
    });

    describe('create', () => {
        it('should create and save a submission', async () => {
            const dto: WritingSubmissionCreateDto = {
                taskId: 'task-uuid-1',
                userId: 'user-uuid-1',
                content: 'My essay.',
            };
            mockRepo.create.mockReturnValue(mockSubmission);
            mockRepo.save.mockResolvedValue(mockSubmission);

            const result = await service.create(dto);

            expect(mockRepo.create).toHaveBeenCalledWith({
                taskId: dto.taskId,
                userId: dto.userId,
                content: dto.content,
            });
            expect(result).toEqual(mockSubmission);
        });
    });

    describe('update', () => {
        it('should update feedback/score and return the updated submission', async () => {
            const dto: WritingSubmissionUpdateDto = {
                feedback: 'Well done!',
                score: 90,
            };
            mockRepo.update.mockResolvedValue({ affected: 1 });
            mockRepo.findOneBy.mockResolvedValue({
                ...mockSubmission,
                feedback: 'Well done!',
                score: 90,
            });

            const result = await service.update('sub-uuid-1', dto);

            expect(mockRepo.update).toHaveBeenCalledWith(
                'sub-uuid-1',
                expect.objectContaining({ feedback: 'Well done!', score: 90 }),
            );
            expect(result?.feedback).toBe('Well done!');
            expect(result?.score).toBe(90);
        });
    });
});
