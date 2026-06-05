import { Test, TestingModule } from '@nestjs/testing';
import { TeacherGuard } from '../../auth/guards/auth.guard';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';
import { AssignmentCreateDto } from './dto/assignment.create.dto';
import { AssignmentQueryDto } from './dto/assignment.query.dto';
import { Assignment } from './entities/assignment.entity';

const mockAssignment: Assignment = {
    id: 'uuid-1',
    userId: 'user-uuid-1',
    title: 'Week 1 Assignment',
    description: 'Complete all reading tasks',
    dueDate: new Date('2024-02-01'),
    isCompleted: false,
    createdAt: new Date('2024-01-01'),
};

const mockAssignmentsService = {
    findByUserId: jest.fn(),
    create: jest.fn(),
};

describe('AssignmentsController', () => {
    let controller: AssignmentsController;
    let service: jest.Mocked<AssignmentsService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AssignmentsController],
            providers: [
                {
                    provide: AssignmentsService,
                    useValue: mockAssignmentsService,
                },
            ],
        })
            .overrideGuard(TeacherGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<AssignmentsController>(AssignmentsController);
        service = module.get(AssignmentsService);

        jest.clearAllMocks();
    });

    describe('findByUserId', () => {
        it('should return assignments for a given userId', async () => {
            const dto: AssignmentQueryDto = { userId: 'user-uuid-1' };
            service.findByUserId.mockResolvedValue([mockAssignment]);

            const result = await controller.findByUserId(dto);

            expect(service.findByUserId).toHaveBeenCalledWith(dto);
            expect(result).toEqual([mockAssignment]);
        });

        it('should return an empty array when user has no assignments', async () => {
            const dto: AssignmentQueryDto = { userId: 'user-uuid-2' };
            service.findByUserId.mockResolvedValue([]);

            const result = await controller.findByUserId(dto);

            expect(result).toEqual([]);
        });
    });

    describe('create', () => {
        it('should create and return a new assignment', async () => {
            const dto: AssignmentCreateDto = {
                userId: 'user-uuid-1',
                title: 'Week 1 Assignment',
                description: 'Complete all reading tasks',
                dueDate: new Date('2024-02-01'),
            };
            service.create.mockResolvedValue(mockAssignment);

            const result = await controller.create(dto);

            expect(service.create).toHaveBeenCalledWith(dto);
            expect(result).toEqual(mockAssignment);
        });
    });
});
