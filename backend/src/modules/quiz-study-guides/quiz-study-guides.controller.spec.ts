import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StudyGuide } from './entities/study-guide.entity';
import { QuizStudyGuidesController } from './quiz-study-guides.controller';

const mockStudyGuide: StudyGuide = {
    id: 'sg-uuid-1',
    topic: 'Past Tense',
    explanation: 'The past tense is used to describe completed actions.',
};

const mockQueryBuilder = {
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
};

const mockRepo = {
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
};

describe('QuizStudyGuidesController', () => {
    let controller: QuizStudyGuidesController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [QuizStudyGuidesController],
            providers: [
                { provide: getRepositoryToken(StudyGuide), useValue: mockRepo },
            ],
        }).compile();

        controller = module.get<QuizStudyGuidesController>(
            QuizStudyGuidesController,
        );
        jest.clearAllMocks();

        // re-establish fluent chain after clearAllMocks
        mockRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
        mockQueryBuilder.innerJoin.mockReturnThis();
        mockQueryBuilder.where.mockReturnThis();
        mockQueryBuilder.orderBy.mockReturnThis();
    });

    describe('findByQuizId', () => {
        it('should return study guides for the given quizId', async () => {
            mockQueryBuilder.getMany.mockResolvedValue([mockStudyGuide]);

            const result = await controller.findByQuizId('quiz-uuid-1');

            expect(mockRepo.createQueryBuilder).toHaveBeenCalledWith('sg');
            expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith(
                'quiz_study_guides',
                'qsg',
                'qsg.topic_id = sg.id',
            );
            expect(mockQueryBuilder.where).toHaveBeenCalledWith(
                'qsg.quiz_id = :quizId',
                { quizId: 'quiz-uuid-1' },
            );
            expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
                'sg.topic',
                'ASC',
            );
            expect(result).toEqual([mockStudyGuide]);
        });

        it('should return an empty array when no study guides exist for the quiz', async () => {
            mockQueryBuilder.getMany.mockResolvedValue([]);

            const result = await controller.findByQuizId('quiz-uuid-2');

            expect(result).toEqual([]);
        });
    });
});
