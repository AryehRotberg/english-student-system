import { Test, TestingModule } from '@nestjs/testing';
import { TeacherGuard } from '../../auth/guards/auth.guard';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const mockUserDto = {
    id: 'user-uuid-1',
    name: 'Alice',
    email: 'alice@example.com',
    role: 'student',
    isApproved: true,
    createdAt: new Date('2024-01-01'),
};

const mockService = {
    findStudentsByTeacherId: jest.fn(),
    findAllTeachers: jest.fn(),
    approve: jest.fn(),
    remove: jest.fn(),
};

describe('UsersController', () => {
    let controller: UsersController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [{ provide: UsersService, useValue: mockService }],
        })
            .overrideGuard(TeacherGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<UsersController>(UsersController);
        jest.clearAllMocks();
    });

    describe('findStudentsByTeacherId', () => {
        it('should return approved students for the authenticated teacher by default', async () => {
            mockService.findStudentsByTeacherId.mockResolvedValue([
                mockUserDto,
            ]);

            const result =
                await controller.findStudentsByTeacherId('teacher-uuid-1');

            expect(mockService.findStudentsByTeacherId).toHaveBeenCalledWith(
                'teacher-uuid-1',
                true,
            );
            expect(result).toEqual([mockUserDto]);
        });

        it('should return unapproved students when approved=false is passed', async () => {
            mockService.findStudentsByTeacherId.mockResolvedValue([
                mockUserDto,
            ]);

            await controller.findStudentsByTeacherId('teacher-uuid-1', 'false');

            expect(mockService.findStudentsByTeacherId).toHaveBeenCalledWith(
                'teacher-uuid-1',
                false,
            );
        });
    });

    describe('findAllTeachers', () => {
        it('should return all teachers', async () => {
            mockService.findAllTeachers.mockResolvedValue([mockUserDto]);

            const result = await controller.findAllTeachers();

            expect(mockService.findAllTeachers).toHaveBeenCalledTimes(1);
            expect(result).toEqual([mockUserDto]);
        });
    });

    describe('approve', () => {
        it('should approve a user by id', async () => {
            mockService.approve.mockResolvedValue({
                ...mockUserDto,
                isApproved: true,
            });

            const result = await controller.approve('user-uuid-1');

            expect(mockService.approve).toHaveBeenCalledWith('user-uuid-1');
            expect(result.isApproved).toBe(true);
        });
    });

    describe('remove', () => {
        it('should remove a user by id', async () => {
            mockService.remove.mockResolvedValue(mockUserDto);

            const result = await controller.remove('user-uuid-1');

            expect(mockService.remove).toHaveBeenCalledWith('user-uuid-1');
            expect(result.id).toBe('user-uuid-1');
        });
    });
});
