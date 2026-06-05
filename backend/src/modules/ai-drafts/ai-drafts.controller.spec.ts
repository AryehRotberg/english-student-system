import { Test, TestingModule } from '@nestjs/testing';
import { TeacherGuard } from '../../auth/guards/auth.guard';
import { AiDraftsController } from './ai-drafts.controller';
import { AiDraftsService } from './ai-drafts.service';
import { AiDraftCreateDto } from './dto/ai-draft.create.dto';
import { AiDraft } from './entities/ai-draft.entity';

const mockAiDraft: AiDraft = {
    id: 'uuid-1',
    model: 'claude-3-5-sonnet',
    draft: '{"questions":[]}',
    draftType: 'quiz',
    isApproved: false,
    additionalInstructions: null,
    createdAt: new Date('2024-01-01'),
} as any;

const mockQueue = { add: jest.fn() };

const mockAiDraftsService = {
    findAll: jest.fn(),
    create: jest.fn(),
};

describe('AiDraftsController', () => {
    let controller: AiDraftsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AiDraftsController],
            providers: [
                { provide: AiDraftsService, useValue: mockAiDraftsService },
                { provide: 'BullQueue_generate-quiz', useValue: mockQueue },
            ],
        })
            .overrideGuard(TeacherGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<AiDraftsController>(AiDraftsController);
        jest.clearAllMocks();
    });

    describe('generateQuiz', () => {
        it('should add a job to the queue and return jobId', async () => {
            const dto = { topic: 'Grammar', level: 'B1' } as any;
            mockQueue.add.mockResolvedValue({ id: 'job-1' });

            const result = await controller.generateQuiz(dto);

            expect(mockQueue.add).toHaveBeenCalledWith(
                'generate-quiz',
                dto,
                expect.objectContaining({ attempts: 3 }),
            );
            expect(result).toEqual({
                message: 'Quiz generation started',
                jobId: 'job-1',
            });
        });
    });

    describe('findAll', () => {
        it('should return all AI drafts', async () => {
            mockAiDraftsService.findAll.mockResolvedValue([mockAiDraft]);

            const result = await controller.findAll();

            expect(mockAiDraftsService.findAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual([mockAiDraft]);
        });
    });

    describe('create', () => {
        it('should create and return a new AI draft', async () => {
            const dto: AiDraftCreateDto = {
                model: 'claude-3-5-sonnet',
                draft: '{}',
                draftType: 'quiz',
            };
            mockAiDraftsService.create.mockResolvedValue(mockAiDraft);

            const result = await controller.create(dto);

            expect(mockAiDraftsService.create).toHaveBeenCalledWith(dto);
            expect(result).toEqual(mockAiDraft);
        });
    });
});
