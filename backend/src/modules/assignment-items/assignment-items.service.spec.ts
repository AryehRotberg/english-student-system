import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentItemsService } from './assignment-items.service';
import { AssignmentItemCreateDto } from './dto/assignment-item.create.dto';
import { AssignmentItemResponseDto } from './dto/assignment-item.response.dto';
import { AssignmentItem } from './entities/assignment-item.entity';
import { AssignmentItemRepository } from './repositories/assignment-item.repository';

const mockItemResponse: AssignmentItemResponseDto = {
    id: 'item-uuid-1',
    assignmentId: 'assign-uuid-1',
    assignmentTitle: 'Week 1',
    assignmentDescription: 'Complete reading',
    assignmentDueDate: '2024-02-01',
    contentId: 'quiz-uuid-1',
    contentType: 'quiz',
    isCompleted: false,
    title: 'Vocab Quiz',
};

const mockItemRepo = {
    findByUserId: jest.fn(),
    findActiveByUserId: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
};

describe('AssignmentItemsService', () => {
    let service: AssignmentItemsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AssignmentItemsService,
                { provide: AssignmentItemRepository, useValue: mockItemRepo },
            ],
        }).compile();

        service = module.get<AssignmentItemsService>(AssignmentItemsService);
        jest.clearAllMocks();
    });

    describe('findByUserId', () => {
        it('should return assignment items for a given userId', async () => {
            mockItemRepo.findByUserId.mockResolvedValue([mockItemResponse]);

            const result = await service.findByUserId({
                userId: 'user-uuid-1',
            });

            expect(mockItemRepo.findByUserId).toHaveBeenCalledWith(
                'user-uuid-1',
            );
            expect(result).toEqual([mockItemResponse]);
        });
    });

    describe('findActiveByUserId', () => {
        it('should return only active items for a given userId', async () => {
            mockItemRepo.findActiveByUserId.mockResolvedValue([
                mockItemResponse,
            ]);

            const result = await service.findActiveByUserId('user-uuid-1');

            expect(mockItemRepo.findActiveByUserId).toHaveBeenCalledWith(
                'user-uuid-1',
            );
            expect(result).toEqual([mockItemResponse]);
        });
    });

    describe('create', () => {
        it('should create and save a new assignment item', async () => {
            const dto: AssignmentItemCreateDto = {
                assignmentId: 'assign-uuid-1',
                contentType: 'quiz',
                contentId: 'quiz-uuid-1',
            };
            const savedEntity = { id: 'item-uuid-1', ...dto } as AssignmentItem;
            mockItemRepo.create.mockReturnValue(savedEntity);
            mockItemRepo.save.mockResolvedValue(savedEntity);

            const result = await service.create(dto);

            expect(mockItemRepo.create).toHaveBeenCalledWith({
                assignmentId: dto.assignmentId,
                contentType: dto.contentType,
                contentId: dto.contentId,
            });
            expect(mockItemRepo.save).toHaveBeenCalledWith(savedEntity);
            expect(result).toEqual(savedEntity);
        });
    });
});
