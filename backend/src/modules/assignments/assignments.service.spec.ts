import { Test, TestingModule } from '@nestjs/testing';
import { SendEmailService } from '../send-email/send-email.service';
import { UserResponseDto } from '../users/dto/user.response.dto';
import { AssignmentsService } from './assignments.service';
import { AssignmentCreateDto } from './dto/assignment.create.dto';
import { AssignmentQueryDto } from './dto/assignment.query.dto';
import { Assignment } from './entities/assignment.entity';
import { AssignmentProgressRepository } from './repositories/assignment-progress.repository';
import { AssignmentRepository } from './repositories/assignment.repository';

const mockAssignment: Assignment = {
    id: 'uuid-1',
    userId: 'user-uuid-1',
    title: 'Week 1 Assignment',
    description: 'Complete all reading tasks',
    dueDate: new Date('2024-02-01'),
    isCompleted: false,
    createdAt: new Date('2024-01-01'),
};

const mockAssignmentRepo = {
    find: jest.fn(),
    create: jest.fn(),
};

const mockAssignmentProgressRepo = {
    findAssignmentCompletionByQuizAttemptId: jest.fn(),
};

const mockSendEmailService = {
    send: jest.fn(),
};

describe('AssignmentsService', () => {
    let service: AssignmentsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AssignmentsService,
                { provide: AssignmentRepository, useValue: mockAssignmentRepo },
                {
                    provide: AssignmentProgressRepository,
                    useValue: mockAssignmentProgressRepo,
                },
                { provide: SendEmailService, useValue: mockSendEmailService },
            ],
        }).compile();

        service = module.get<AssignmentsService>(AssignmentsService);

        jest.clearAllMocks();
    });

    describe('findByUserId', () => {
        it('should return assignments for a given userId ordered by createdAt DESC', async () => {
            const dto: AssignmentQueryDto = { userId: 'user-uuid-1' };
            mockAssignmentRepo.find.mockResolvedValue([mockAssignment]);

            const result = await service.findByUserId(dto);

            expect(mockAssignmentRepo.find).toHaveBeenCalledWith({
                where: { userId: dto.userId },
                order: { createdAt: 'DESC' },
            });
            expect(result).toEqual([mockAssignment]);
        });

        it('should return an empty array when user has no assignments', async () => {
            const dto: AssignmentQueryDto = { userId: 'user-uuid-2' };
            mockAssignmentRepo.find.mockResolvedValue([]);

            const result = await service.findByUserId(dto);

            expect(result).toEqual([]);
        });
    });

    describe('findActiveByUserId', () => {
        it('should return only incomplete assignments for a given userId', async () => {
            mockAssignmentRepo.find.mockResolvedValue([mockAssignment]);

            const result = await service.findActiveByUserId('user-uuid-1');

            expect(mockAssignmentRepo.find).toHaveBeenCalledWith({
                where: { userId: 'user-uuid-1', isCompleted: false },
                order: { createdAt: 'DESC' },
            });
            expect(result).toEqual([mockAssignment]);
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
            mockAssignmentRepo.create.mockReturnValue(mockAssignment);

            const result = await service.create(dto);

            expect(mockAssignmentRepo.create).toHaveBeenCalledWith(dto);
            expect(result).toEqual(mockAssignment);
        });
    });

    describe('sendCompletionEmail', () => {
        const user = {
            id: 'user-uuid-1',
            name: 'Alice',
            email: 'alice@example.com',
            role: 'student',
            isApproved: true,
            teacherName: 'Mr. Smith',
            teacherEmail: 'smith@example.com',
            createdAt: new Date('2024-01-01'),
        } as unknown as UserResponseDto;

        it('should calculate score and progress percentages and send email', async () => {
            mockAssignmentProgressRepo.findAssignmentCompletionByQuizAttemptId.mockResolvedValue(
                {
                    assignmentTitle: 'Week 1',
                    quizTitle: 'Vocab Quiz',
                    points: '8',
                    totalPoints: '10',
                    completedItems: '3',
                    totalItems: '5',
                },
            );
            mockSendEmailService.send.mockResolvedValue(undefined);

            await service.sendCompletionEmail(user, 'attempt-uuid-1');

            expect(
                mockAssignmentProgressRepo.findAssignmentCompletionByQuizAttemptId,
            ).toHaveBeenCalledWith('attempt-uuid-1');

            const sendCall = mockSendEmailService.send.mock.calls[0];
            // subject should contain 80% score (8/10) and 60% progress (3/5)
            expect(sendCall[1]).toContain('80%');
            expect(sendCall[1]).toContain('60%');
            expect(sendCall[1]).toContain('Alice');
            expect(sendCall[1]).toContain('Week 1');
        });

        it('should handle zero totalPoints without dividing by zero', async () => {
            mockAssignmentProgressRepo.findAssignmentCompletionByQuizAttemptId.mockResolvedValue(
                {
                    assignmentTitle: 'Week 1',
                    quizTitle: 'Vocab Quiz',
                    points: '0',
                    totalPoints: '0',
                    completedItems: '0',
                    totalItems: '0',
                },
            );
            mockSendEmailService.send.mockResolvedValue(undefined);

            await service.sendCompletionEmail(user, 'attempt-uuid-1');

            const sendCall = mockSendEmailService.send.mock.calls[0];
            expect(sendCall[1]).toContain('0%');
        });

        it('should fall back to default labels when summary fields are null', async () => {
            mockAssignmentProgressRepo.findAssignmentCompletionByQuizAttemptId.mockResolvedValue(
                {
                    assignmentTitle: null,
                    quizTitle: null,
                    points: '5',
                    totalPoints: '10',
                    completedItems: '2',
                    totalItems: '4',
                },
            );
            mockSendEmailService.send.mockResolvedValue(undefined);

            await service.sendCompletionEmail(user, 'attempt-uuid-1');

            const sendCall = mockSendEmailService.send.mock.calls[0];
            expect(sendCall[1]).toContain('assignment');
            expect(sendCall[2]).toContain('Assignment');
        });

        it('should send email to the teacher email address', async () => {
            mockAssignmentProgressRepo.findAssignmentCompletionByQuizAttemptId.mockResolvedValue(
                {
                    assignmentTitle: 'Week 1',
                    quizTitle: 'Vocab Quiz',
                    points: '5',
                    totalPoints: '10',
                    completedItems: '2',
                    totalItems: '4',
                },
            );
            mockSendEmailService.send.mockResolvedValue(undefined);

            await service.sendCompletionEmail(user, 'attempt-uuid-1');

            expect(mockSendEmailService.send).toHaveBeenCalledWith(
                user.teacherEmail,
                expect.any(String),
                expect.any(String),
                expect.any(String),
                expect.any(String),
            );
        });
    });
});
