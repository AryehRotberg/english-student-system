import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentsService } from '../assignments/assignments.service';
import { SendEmailService } from '../send-email/send-email.service';
import { UserResponseDto } from '../users/dto/user.response.dto';
import { QuizAttemptCreateDto } from './dto/quiz-attempt.create.dto';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { QuizAttemptRepository } from './repositories/quiz-attempt.repository';
import { QuizAttemptsService } from './quiz-attempts.service';

const mockAttempt: QuizAttempt = {
    id: 'attempt-uuid-1',
    userId: 'user-uuid-1',
    quizId: 'quiz-uuid-1',
    points: 0,
    startedAt: new Date('2024-01-01'),
    completedAt: null,
} as any;

const mockUser = {
    id: 'user-uuid-1',
    name: 'Alice',
    email: 'alice@example.com',
    role: 'student',
    isApproved: true,
    teacherEmail: 'teacher@example.com',
    createdAt: new Date('2024-01-01'),
} as unknown as UserResponseDto;

const mockAttemptRepo = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    submitAttempt: jest.fn(),
};
const mockSendEmailService = { send: jest.fn() };
const mockAssignmentsService = { sendCompletionEmail: jest.fn() };

describe('QuizAttemptsService', () => {
    let service: QuizAttemptsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                QuizAttemptsService,
                { provide: QuizAttemptRepository, useValue: mockAttemptRepo },
                { provide: SendEmailService, useValue: mockSendEmailService },
                {
                    provide: AssignmentsService,
                    useValue: mockAssignmentsService,
                },
            ],
        }).compile();

        service = module.get<QuizAttemptsService>(QuizAttemptsService);
        jest.clearAllMocks();
    });

    describe('findByUserIdAndQuizId', () => {
        it('should return attempts matching userId and quizId', async () => {
            mockAttemptRepo.find.mockResolvedValue([mockAttempt]);

            const result = await service.findByUserIdAndQuizId({
                userId: 'user-uuid-1',
                quizId: 'quiz-uuid-1',
            });

            expect(mockAttemptRepo.find).toHaveBeenCalledWith({
                where: { userId: 'user-uuid-1', quizId: 'quiz-uuid-1' },
            });
            expect(result).toEqual([mockAttempt]);
        });
    });

    describe('findByUserId', () => {
        it('should return attempts for a user ordered by startedAt DESC', async () => {
            mockAttemptRepo.find.mockResolvedValue([mockAttempt]);

            const result = await service.findByUserId('user-uuid-1');

            expect(mockAttemptRepo.find).toHaveBeenCalledWith({
                where: { userId: 'user-uuid-1' },
                order: { startedAt: 'DESC' },
            });
            expect(result).toEqual([mockAttempt]);
        });
    });

    describe('create', () => {
        it('should create an attempt and fire a notification email', async () => {
            const dto: QuizAttemptCreateDto = {
                quizId: 'quiz-uuid-1',
            };
            mockAttemptRepo.create.mockReturnValue(mockAttempt);
            mockAttemptRepo.save.mockResolvedValue(mockAttempt);
            mockSendEmailService.send.mockResolvedValue(undefined);

            const result = await service.create(dto, mockUser);

            expect(mockAttemptRepo.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    quizId: 'quiz-uuid-1',
                    userId: 'user-uuid-1',
                    points: 0,
                }),
            );
            expect(mockAttemptRepo.save).toHaveBeenCalled();
            expect(mockSendEmailService.send).toHaveBeenCalledWith(
                'teacher@example.com',
                expect.stringContaining('Vocab Quiz'),
                expect.any(String),
                expect.any(String),
            );
            expect(result).toEqual(mockAttempt);
        });
    });

    describe('submitAttempt', () => {
        it('should submit the attempt and fire the completion email', async () => {
            const submitted = {
                ...mockAttempt,
                completedAt: new Date(),
                points: 8,
            };
            mockAttemptRepo.submitAttempt.mockResolvedValue(submitted);
            mockAssignmentsService.sendCompletionEmail.mockResolvedValue(
                undefined,
            );

            const result = await service.submitAttempt(
                mockUser,
                'attempt-uuid-1',
            );

            expect(mockAttemptRepo.submitAttempt).toHaveBeenCalledWith(
                'attempt-uuid-1',
            );
            expect(result).toEqual(submitted);
        });
    });
});
