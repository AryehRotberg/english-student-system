import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard, TeacherGuard } from '../../auth/guards/auth.guard';
import { UserResponseDto } from '../users/dto/user.response.dto';
import { QuizAttemptCreateDto } from './dto/quiz-attempt.create.dto';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { QuizAttemptsController } from './quiz-attempts.controller';
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
    role: 'student',
    isApproved: true,
} as unknown as UserResponseDto;

const mockService = {
    findByUserIdAndQuizId: jest.fn(),
    findByUserId: jest.fn(),
    create: jest.fn(),
    submitAttempt: jest.fn(),
};

describe('QuizAttemptsController', () => {
    let controller: QuizAttemptsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [QuizAttemptsController],
            providers: [
                { provide: QuizAttemptsService, useValue: mockService },
            ],
        })
            .overrideGuard(TeacherGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(AuthGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<QuizAttemptsController>(QuizAttemptsController);
        jest.clearAllMocks();
    });

    describe('findByUserIdAndQuizId', () => {
        it('should return attempts for the given userId and quizId', async () => {
            mockService.findByUserIdAndQuizId.mockResolvedValue([mockAttempt]);

            const dto = { userId: 'user-uuid-1', quizId: 'quiz-uuid-1' } as any;
            const result = await controller.findByUserIdAndQuizId(dto);

            expect(mockService.findByUserIdAndQuizId).toHaveBeenCalledWith(dto);
            expect(result).toEqual([mockAttempt]);
        });
    });

    describe('findByUserId', () => {
        it('should return all attempts for a userId', async () => {
            mockService.findByUserId.mockResolvedValue([mockAttempt]);

            const result = await controller.findByUserId('user-uuid-1');

            expect(mockService.findByUserId).toHaveBeenCalledWith(
                'user-uuid-1',
            );
            expect(result).toEqual([mockAttempt]);
        });
    });

    describe('create', () => {
        it('should create an attempt for the authenticated user', async () => {
            const dto: QuizAttemptCreateDto = {
                quizId: 'quiz-uuid-1',
                quizTitle: 'Vocab Quiz',
            };
            mockService.create.mockResolvedValue(mockAttempt);

            const result = await controller.create(dto, mockUser);

            expect(mockService.create).toHaveBeenCalledWith(dto, mockUser);
            expect(result).toEqual(mockAttempt);
        });
    });

    describe('submitAttempt', () => {
        it('should submit the attempt for the authenticated user', async () => {
            const submitted = {
                ...mockAttempt,
                completedAt: new Date(),
                points: 8,
            };
            mockService.submitAttempt.mockResolvedValue(submitted);

            const result = await controller.submitAttempt(
                mockUser,
                'attempt-uuid-1',
            );

            expect(mockService.submitAttempt).toHaveBeenCalledWith(
                mockUser,
                'attempt-uuid-1',
            );
            expect(result).toEqual(submitted);
        });
    });
});
