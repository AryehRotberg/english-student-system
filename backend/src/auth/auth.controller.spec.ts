import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { UsersService } from '../modules/users/users.service';

const mockUserDto = {
    id: 'user-uuid-1',
    name: 'Alice',
    email: 'alice@example.com',
    role: 'student',
    isApproved: true,
    teacherId: null,
    teacherName: null,
    teacherEmail: null,
    createdAt: new Date('2024-01-01'),
};

const mockAuthService = {
    login: jest.fn(),
    logout: jest.fn(),
};

const mockUsersService = {
    create: jest.fn(),
    updatePassword: jest.fn(),
};

describe('AuthController', () => {
    let controller: AuthController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                { provide: AuthService, useValue: mockAuthService },
                { provide: UsersService, useValue: mockUsersService },
            ],
        })
            .overrideGuard(AuthGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<AuthController>(AuthController);
        jest.clearAllMocks();
    });

    describe('getUser', () => {
        it('should return the authenticated user from the decorator', () => {
            const result = controller.getUser(mockUserDto as any);

            expect(result).toEqual(mockUserDto);
        });
    });

    describe('login', () => {
        it('should call authService.login and return message with user', async () => {
            const loginDto = {
                email: 'alice@example.com',
                password: 'password123',
            };
            const mockRes = { cookie: jest.fn() } as any;
            mockAuthService.login.mockResolvedValue(mockUserDto);

            const result = await controller.login(loginDto as any, mockRes);

            expect(mockAuthService.login).toHaveBeenCalledWith(
                loginDto,
                mockRes,
            );
            expect(result).toEqual({
                message: 'Login successful.',
                user: mockUserDto,
            });
        });
    });

    describe('register', () => {
        it('should call usersService.create and return message with user', async () => {
            const createDto = {
                name: 'Alice',
                email: 'alice@example.com',
                password: 'password123',
                teacherId: 'teacher-uuid-1',
            };
            mockUsersService.create.mockResolvedValue(mockUserDto);

            const result = await controller.register(createDto as any);

            expect(mockUsersService.create).toHaveBeenCalledWith(createDto);
            expect(result).toEqual({
                message: 'User registered successfully.',
                user: mockUserDto,
            });
        });
    });

    describe('logout', () => {
        it('should call authService.logout and return success message', () => {
            const mockRes = { clearCookie: jest.fn() } as any;
            mockAuthService.logout.mockReturnValue(undefined);

            const result = controller.logout(mockRes);

            expect(mockAuthService.logout).toHaveBeenCalledWith(mockRes);
            expect(result).toEqual({ message: 'Logout successful.' });
        });
    });

    describe('updatePassword', () => {
        it('should call usersService.updatePassword and return message with updated user', async () => {
            const updatedUser = { ...mockUserDto };
            mockUsersService.updatePassword.mockResolvedValue(updatedUser);

            const result = await controller.updatePassword(
                mockUserDto as any,
                'new-password',
            );

            expect(mockUsersService.updatePassword).toHaveBeenCalledWith(
                mockUserDto.id,
                'new-password',
            );
            expect(result).toEqual({
                message: 'Password updated successfully.',
                user: updatedUser,
            });
        });
    });
});
