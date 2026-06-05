import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
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

const mockAiDraftRepo = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
};

describe('AiDraftsService', () => {
    let service: AiDraftsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AiDraftsService,
                {
                    provide: getRepositoryToken(AiDraft),
                    useValue: mockAiDraftRepo,
                },
            ],
        }).compile();

        service = module.get<AiDraftsService>(AiDraftsService);
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all AI drafts', async () => {
            mockAiDraftRepo.find.mockResolvedValue([mockAiDraft]);

            const result = await service.findAll();

            expect(mockAiDraftRepo.find).toHaveBeenCalledTimes(1);
            expect(result).toEqual([mockAiDraft]);
        });

        it('should return an empty array when no drafts exist', async () => {
            mockAiDraftRepo.find.mockResolvedValue([]);

            const result = await service.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('create', () => {
        it('should create a draft with isApproved set to false', async () => {
            const dto: AiDraftCreateDto = {
                model: 'claude-3-5-sonnet',
                draft: '{"questions":[]}',
                draftType: 'quiz',
                additionalInstructions: 'Focus on grammar',
            };
            mockAiDraftRepo.create.mockReturnValue(mockAiDraft);
            mockAiDraftRepo.save.mockResolvedValue(mockAiDraft);

            const result = await service.create(dto);

            expect(mockAiDraftRepo.create).toHaveBeenCalledWith({
                model: dto.model,
                draft: dto.draft,
                draftType: dto.draftType,
                isApproved: false,
                additionalInstructions: dto.additionalInstructions,
            });
            expect(mockAiDraftRepo.save).toHaveBeenCalledWith(mockAiDraft);
            expect(result).toEqual(mockAiDraft);
        });

        it('should set additionalInstructions to null when not provided', async () => {
            const dto: AiDraftCreateDto = {
                model: 'claude-3-5-sonnet',
                draft: '{}',
                draftType: 'quiz',
            };
            mockAiDraftRepo.create.mockReturnValue({
                ...mockAiDraft,
                additionalInstructions: null,
            });
            mockAiDraftRepo.save.mockResolvedValue(mockAiDraft);

            await service.create(dto);

            expect(mockAiDraftRepo.create).toHaveBeenCalledWith(
                expect.objectContaining({ additionalInstructions: null }),
            );
        });
    });
});
