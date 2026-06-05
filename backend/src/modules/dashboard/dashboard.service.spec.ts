import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentItemsService } from '../assignment-items/assignment-items.service';
import { AssignmentsService } from '../assignments/assignments.service';
import { UserResponseDto } from '../users/dto/user.response.dto';
import { DashboardMapper } from './dashboard.mapper';
import { DashboardService } from './dashboard.service';
import { DashboardRepository } from './repositories/dashboard.repository';

const mockUser = {
    id: 'user-uuid-1',
    name: 'Alice',
    email: 'alice@example.com',
    role: 'student',
    isApproved: true,
    createdAt: new Date('2024-01-01'),
} as unknown as UserResponseDto;

const mockAssignment = {
    id: 'assign-uuid-1',
    userId: 'user-uuid-1',
    title: 'Week 1',
    description: 'Reading tasks',
    dueDate: new Date('2024-02-01'),
    isCompleted: false,
    createdAt: new Date('2024-01-01'),
};

const mockItem = {
    id: 'item-uuid-1',
    assignmentId: 'assign-uuid-1',
    assignmentTitle: 'Week 1',
    assignmentDescription: 'Reading tasks',
    assignmentDueDate: '2024-02-01',
    contentId: 'quiz-uuid-1',
    contentType: 'quiz',
    isCompleted: false,
    title: 'Vocab Quiz',
};

const mockAssignmentsService = { findActiveByUserId: jest.fn() };
const mockAssignmentItemsService = { findActiveByUserId: jest.fn() };
const mockDashboardRepo = {
    findQuizProgress: jest.fn(),
    findContentProgress: jest.fn(),
};
const mockMapper = {
    toTask: jest.fn(),
    toAssignmentTopic: jest.fn(),
    toActivity: jest.fn(),
    buildProgressMetrics: jest.fn(),
};

describe('DashboardService', () => {
    let service: DashboardService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DashboardService,
                {
                    provide: AssignmentsService,
                    useValue: mockAssignmentsService,
                },
                {
                    provide: AssignmentItemsService,
                    useValue: mockAssignmentItemsService,
                },
                { provide: DashboardRepository, useValue: mockDashboardRepo },
                { provide: DashboardMapper, useValue: mockMapper },
            ],
        }).compile();

        service = module.get<DashboardService>(DashboardService);
        jest.clearAllMocks();
    });

    describe('getOverview', () => {
        it('should fetch all data in parallel and return a mapped overview', async () => {
            mockAssignmentsService.findActiveByUserId.mockResolvedValue([
                mockAssignment,
            ]);
            mockAssignmentItemsService.findActiveByUserId.mockResolvedValue([
                mockItem,
            ]);
            mockDashboardRepo.findQuizProgress.mockResolvedValue([]);
            mockDashboardRepo.findContentProgress.mockResolvedValue([]);
            mockMapper.toTask.mockReturnValue({
                id: 'item-uuid-1',
                title: 'Vocab Quiz',
            });
            mockMapper.toAssignmentTopic.mockReturnValue({ id: 'item-uuid-1' });
            mockMapper.toActivity.mockReturnValue({ id: 'assign-uuid-1' });
            mockMapper.buildProgressMetrics.mockReturnValue([]);

            const result = await service.getOverview(mockUser);

            expect(
                mockAssignmentsService.findActiveByUserId,
            ).toHaveBeenCalledWith('user-uuid-1');
            expect(
                mockAssignmentItemsService.findActiveByUserId,
            ).toHaveBeenCalledWith('user-uuid-1');
            expect(result.studentName).toBe('Alice');
            expect(result.tasks).toHaveLength(1);
            expect(result.activities).toHaveLength(1);
        });

        it('should limit activities to 5 even when more assignments exist', async () => {
            const manyAssignments = Array.from({ length: 10 }, (_, i) => ({
                ...mockAssignment,
                id: `assign-uuid-${i}`,
            }));
            mockAssignmentsService.findActiveByUserId.mockResolvedValue(
                manyAssignments,
            );
            mockAssignmentItemsService.findActiveByUserId.mockResolvedValue([]);
            mockDashboardRepo.findQuizProgress.mockResolvedValue([]);
            mockDashboardRepo.findContentProgress.mockResolvedValue([]);
            mockMapper.toActivity.mockReturnValue({});
            mockMapper.buildProgressMetrics.mockReturnValue([]);

            const result = await service.getOverview(mockUser);

            expect(result.activities).toHaveLength(5);
        });

        it('should only include items with a contentId in assignmentTopics', async () => {
            const itemWithoutContentId = { ...mockItem, contentId: null };
            mockAssignmentsService.findActiveByUserId.mockResolvedValue([]);
            mockAssignmentItemsService.findActiveByUserId.mockResolvedValue([
                mockItem,
                itemWithoutContentId,
            ]);
            mockDashboardRepo.findQuizProgress.mockResolvedValue([]);
            mockDashboardRepo.findContentProgress.mockResolvedValue([]);
            mockMapper.toTask.mockReturnValue({});
            mockMapper.toAssignmentTopic.mockReturnValue({});
            mockMapper.buildProgressMetrics.mockReturnValue([]);

            const result = await service.getOverview(mockUser);

            expect(result.assignmentTopics).toHaveLength(1);
        });
    });
});
