import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { UserResponseDto } from '../users/dto/user.response.dto';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

const mockUser = {
    id: 'user-uuid-1',
    name: 'Alice',
    email: 'alice@example.com',
    role: 'student',
    isApproved: true,
    createdAt: new Date('2024-01-01'),
} as unknown as UserResponseDto;

const mockOverview = {
    studentName: 'Alice',
    tasks: [],
    assignmentTopics: [],
    activities: [],
    progress: [],
};

const mockDashboardService = { getOverview: jest.fn() };

describe('DashboardController', () => {
    let controller: DashboardController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [DashboardController],
            providers: [
                { provide: DashboardService, useValue: mockDashboardService },
            ],
        })
            .overrideGuard(AuthGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<DashboardController>(DashboardController);
        jest.clearAllMocks();
    });

    describe('getOverview', () => {
        it('should return the dashboard overview for the current user', async () => {
            mockDashboardService.getOverview.mockResolvedValue(mockOverview);

            const result = await controller.getOverview(mockUser);

            expect(mockDashboardService.getOverview).toHaveBeenCalledWith(
                mockUser,
            );
            expect(result).toEqual(mockOverview);
        });
    });
});
