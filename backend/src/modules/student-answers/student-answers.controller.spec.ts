import { Test, TestingModule } from '@nestjs/testing';
import { StudentAnswer } from './entities/student-answer.entity';
import { StudentAnswersController } from './student-answers.controller';
import { StudentAnswersService } from './student-answers.service';

const mockAnswer: StudentAnswer = {
    id: 'sa-uuid-1',
    attemptId: 'attempt-uuid-1',
    questionId: 'q-uuid-1',
    points: 2,
} as any;

const mockService = {
    upsert: jest.fn(),
    findOne: jest.fn(),
    findByAttempt: jest.fn(),
    remove: jest.fn(),
};

describe('StudentAnswersController', () => {
    let controller: StudentAnswersController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [StudentAnswersController],
            providers: [
                { provide: StudentAnswersService, useValue: mockService },
            ],
        }).compile();

        controller = module.get<StudentAnswersController>(
            StudentAnswersController,
        );
        jest.clearAllMocks();
    });

    describe('upsert', () => {
        it('should call service.upsert and return the results', async () => {
            const dto = {
                attemptId: 'attempt-uuid-1',
                questionId: 'q-uuid-1',
                selectedOptionId: 'option-uuid-1',
            } as any;
            mockService.upsert.mockResolvedValue([mockAnswer]);

            const result = await controller.upsert(dto);

            expect(mockService.upsert).toHaveBeenCalledWith(dto);
            expect(result).toEqual([mockAnswer]);
        });
    });

    describe('findOne', () => {
        it('should return a single student answer by id', async () => {
            mockService.findOne.mockResolvedValue(mockAnswer);

            const result = await controller.findOne('sa-uuid-1');

            expect(mockService.findOne).toHaveBeenCalledWith('sa-uuid-1');
            expect(result).toEqual(mockAnswer);
        });
    });

    describe('findByAttempt', () => {
        it('should return all answers for an attemptId', async () => {
            mockService.findByAttempt.mockResolvedValue([mockAnswer]);

            const result = await controller.findByAttempt('attempt-uuid-1');

            expect(mockService.findByAttempt).toHaveBeenCalledWith(
                'attempt-uuid-1',
            );
            expect(result).toEqual([mockAnswer]);
        });
    });

    describe('remove', () => {
        it('should remove and return the deleted answer', async () => {
            mockService.remove.mockResolvedValue(mockAnswer);

            const result = await controller.remove('sa-uuid-1');

            expect(mockService.remove).toHaveBeenCalledWith('sa-uuid-1');
            expect(result).toEqual(mockAnswer);
        });
    });
});
