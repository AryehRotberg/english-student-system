import { Test, TestingModule } from '@nestjs/testing';
import { TeacherGuard } from '../../auth/guards/auth.guard';
import { AssignmentItemsController } from './assignment-items.controller';
import { AssignmentItemsService } from './assignment-items.service';
import { AssignmentItemCreateDto } from './dto/assignment-item.create.dto';
import { AssignmentItemResponseDto } from './dto/assignment-item.response.dto';

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

const mockService = {
    findByUserId: jest.fn(),
    create: jest.fn(),
};

describe('AssignmentItemsController', () => {
    let controller: AssignmentItemsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AssignmentItemsController],
            providers: [
                { provide: AssignmentItemsService, useValue: mockService },
            ],
        })
            .overrideGuard(TeacherGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<AssignmentItemsController>(
            AssignmentItemsController,
        );
        jest.clearAllMocks();
    });

    describe('findByUserId', () => {
        it('should return items for a given userId', async () => {
            mockService.findByUserId.mockResolvedValue([mockItemResponse]);

            const result = await controller.findByUserId({
                userId: 'user-uuid-1',
            });

            expect(mockService.findByUserId).toHaveBeenCalledWith({
                userId: 'user-uuid-1',
            });
            expect(result).toEqual([mockItemResponse]);
        });

        it('should return an empty array when no items exist', async () => {
            mockService.findByUserId.mockResolvedValue([]);

            const result = await controller.findByUserId({
                userId: 'user-uuid-2',
            });

            expect(result).toEqual([]);
        });
    });

    describe('create', () => {
        it('should create and return a new assignment item', async () => {
            const dto: AssignmentItemCreateDto = {
                assignmentId: 'assign-uuid-1',
                contentType: 'quiz',
                contentId: 'quiz-uuid-1',
            };
            mockService.create.mockResolvedValue(mockItemResponse);

            const result = await controller.create(dto);

            expect(mockService.create).toHaveBeenCalledWith(dto);
            expect(result).toEqual(mockItemResponse);
        });
    });
});
