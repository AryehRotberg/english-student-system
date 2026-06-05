import { Test, TestingModule } from '@nestjs/testing';
import { TeacherGuard } from '../../auth/guards/auth.guard';
import { QuestionCreateDto } from './dto/question.create.dto';
import { Question } from './entities/question.entity';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';

const mockQuestion: Question = {
    id: 'uuid-1',
    question: 'What is the past tense of "run"?',
    questionType: 'multiple-choice',
    hints: null,
    topics: [],
    createdAt: new Date('2024-01-01'),
};

const mockQuestionsService = {
    findAll: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
};

describe('QuestionsController', () => {
    let controller: QuestionsController;
    let service: jest.Mocked<QuestionsService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [QuestionsController],
            providers: [
                {
                    provide: QuestionsService,
                    useValue: mockQuestionsService,
                },
            ],
        })
            .overrideGuard(TeacherGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<QuestionsController>(QuestionsController);
        service = module.get(QuestionsService);

        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return an array of questions', async () => {
            service.findAll.mockResolvedValue([mockQuestion]);

            const result = await controller.findAll();

            expect(service.findAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual([mockQuestion]);
        });

        it('should return an empty array when no questions exist', async () => {
            service.findAll.mockResolvedValue([]);

            const result = await controller.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('create', () => {
        it('should create and return a new question', async () => {
            const dto: QuestionCreateDto = {
                question: 'What is the past tense of "run"?',
                questionType: 'multiple-choice',
            };
            service.create.mockResolvedValue(mockQuestion);

            const result = await controller.create(dto);

            expect(service.create).toHaveBeenCalledWith(dto);
            expect(result).toEqual(mockQuestion);
        });
    });

    describe('remove', () => {
        it('should remove a question by id', async () => {
            service.remove.mockResolvedValue(undefined);

            const result = await controller.remove('uuid-1');

            expect(service.remove).toHaveBeenCalledWith('uuid-1');
            expect(result).toBeUndefined();
        });
    });
});
