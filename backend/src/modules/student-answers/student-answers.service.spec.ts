import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { StudentAnswerUpsertDto } from './dto/student-answer.upsert.dto';
import { StudentAnswer } from './entities/student-answer.entity';
import { StudentAnswerRepository } from './repositories/student-answer.repository';
import { StudentAnswersCommon } from './student-answers.common';
import { StudentAnswersService } from './student-answers.service';

const mockAnswer: StudentAnswer = {
    id: 'sa-uuid-1',
    attemptId: 'attempt-uuid-1',
    questionId: 'q-uuid-1',
    points: 2,
} as any;

const mockRepo = {
    upsertAnswers: jest.fn(),
    findOneBy: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
    findCorrectOption: jest.fn(),
    findValidTextAnswers: jest.fn(),
};

const mockCommon = {
    groupResultsByBlankIndex: jest.fn(),
    distributePoints: jest.fn(),
    normalizeAnswer: jest.fn(),
};

describe('StudentAnswersService', () => {
    let service: StudentAnswersService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StudentAnswersService,
                { provide: StudentAnswerRepository, useValue: mockRepo },
                { provide: StudentAnswersCommon, useValue: mockCommon },
            ],
        }).compile();

        service = module.get<StudentAnswersService>(StudentAnswersService);
        jest.clearAllMocks();
    });

    describe('upsert — multiple-choice', () => {
        it('should grade a correct multiple-choice answer with full points', async () => {
            const dto: StudentAnswerUpsertDto = {
                attemptId: 'attempt-uuid-1',
                questionId: 'q-uuid-1',
                selectedOptionId: 'option-correct',
            };
            mockRepo.findCorrectOption.mockResolvedValue({
                correctOptionId: 'option-correct',
                maxPoints: '2',
            });
            mockRepo.upsertAnswers.mockResolvedValue([mockAnswer]);

            const result = await service.upsert(dto);

            expect(mockRepo.upsertAnswers).toHaveBeenCalledWith(
                'attempt-uuid-1',
                'q-uuid-1',
                [
                    expect.objectContaining({
                        points: 2,
                        selectedOptionId: 'option-correct',
                    }),
                ],
            );
            expect(result).toEqual([mockAnswer]);
        });

        it('should award 0 points for an incorrect multiple-choice answer', async () => {
            const dto: StudentAnswerUpsertDto = {
                attemptId: 'attempt-uuid-1',
                questionId: 'q-uuid-1',
                selectedOptionId: 'option-wrong',
            };
            mockRepo.findCorrectOption.mockResolvedValue({
                correctOptionId: 'option-correct',
                maxPoints: '2',
            });
            mockRepo.upsertAnswers.mockResolvedValue([
                { ...mockAnswer, points: 0 },
            ]);

            await service.upsert(dto);

            expect(mockRepo.upsertAnswers).toHaveBeenCalledWith(
                'attempt-uuid-1',
                'q-uuid-1',
                [expect.objectContaining({ points: 0 })],
            );
        });

        it('should throw NotFoundException when correct option mapping is missing', async () => {
            mockRepo.findCorrectOption.mockResolvedValue(null);

            await expect(
                service.upsert({
                    attemptId: 'attempt-uuid-1',
                    questionId: 'q-uuid-1',
                    selectedOptionId: 'option-correct',
                }),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('upsert — open-ended', () => {
        it('should award points for a correct text answer', async () => {
            const dto: StudentAnswerUpsertDto = {
                attemptId: 'attempt-uuid-1',
                questionId: 'q-uuid-1',
                textAnswers: ['ran'],
            };
            mockRepo.findValidTextAnswers.mockResolvedValue([
                { blankIndex: '1', validAnswer: 'ran', questionMaxPoints: 2 },
            ]);
            mockCommon.groupResultsByBlankIndex.mockReturnValue([
                {
                    blankIndex: '1',
                    validAnswers: ['ran'],
                    questionMaxPoints: 2,
                },
            ]);
            mockCommon.distributePoints.mockReturnValue([2]);
            mockCommon.normalizeAnswer.mockImplementation((v: string) =>
                v.toLowerCase().trim(),
            );
            mockRepo.upsertAnswers.mockResolvedValue([mockAnswer]);

            await service.upsert(dto);

            expect(mockRepo.upsertAnswers).toHaveBeenCalledWith(
                'attempt-uuid-1',
                'q-uuid-1',
                [expect.objectContaining({ points: 2, textAnswer: 'ran' })],
            );
        });

        it('should throw NotFoundException when valid text answer mapping is missing', async () => {
            mockRepo.findValidTextAnswers.mockResolvedValue([]);

            await expect(
                service.upsert({
                    attemptId: 'attempt-uuid-1',
                    questionId: 'q-uuid-1',
                    textAnswers: ['ran'],
                }),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('upsert — validation', () => {
        it('should throw BadRequestException when both selectedOptionId and textAnswers are provided', async () => {
            await expect(
                service.upsert({
                    attemptId: 'attempt-uuid-1',
                    questionId: 'q-uuid-1',
                    selectedOptionId: 'option-correct',
                    textAnswers: ['ran'],
                }),
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException when neither selectedOptionId nor textAnswers is provided', async () => {
            await expect(
                service.upsert({
                    attemptId: 'attempt-uuid-1',
                    questionId: 'q-uuid-1',
                }),
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('findOne', () => {
        it('should return a single answer by id', async () => {
            mockRepo.findOneBy.mockResolvedValue(mockAnswer);

            const result = await service.findOne('sa-uuid-1');

            expect(mockRepo.findOneBy).toHaveBeenCalledWith({
                id: 'sa-uuid-1',
            });
            expect(result).toEqual(mockAnswer);
        });
    });

    describe('findByAttempt', () => {
        it('should return all answers for a given attemptId', async () => {
            mockRepo.find.mockResolvedValue([mockAnswer]);

            const result = await service.findByAttempt('attempt-uuid-1');

            expect(mockRepo.find).toHaveBeenCalledWith({
                where: { attemptId: 'attempt-uuid-1' },
            });
            expect(result).toEqual([mockAnswer]);
        });
    });

    describe('remove', () => {
        it('should delete and return the removed answer', async () => {
            mockRepo.findOneBy.mockResolvedValue(mockAnswer);
            mockRepo.delete.mockResolvedValue({ affected: 1 });

            const result = await service.remove('sa-uuid-1');

            expect(mockRepo.delete).toHaveBeenCalledWith('sa-uuid-1');
            expect(result).toEqual(mockAnswer);
        });
    });
});
