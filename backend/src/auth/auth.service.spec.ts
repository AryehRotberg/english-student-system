import {
    BadRequestException,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../modules/users/users.service';
import { AuthService } from './auth.service';
import { HashingService } from './hashing.service';
import { JwtService } from './jwt.service';

jest.mock('@sentry/node', () => ({ captureException: jest.fn() }));

const mockUser = {
    id: 'user-uuid-1',
    name: 'Alice',
    email: 'alice@example.com',
    password: 'hashed-password',
    role: 'student',
    isApproved: true,
    teacherId: null,
    get teacherName() {
        return null;
    },
    get teacherEmail() {
        return null;
    },
    createdAt: new Date('2024-01-01'),
} as any;

const mockUsersService = { findOneByEmail: jest.fn() };
const mockJwtService = {
    generateToken: jest.fn(),
    getJwtExpirationMs: jest.fn().mockReturnValue(604800000),
};
const mockHashingService = { compare: jest.fn() };

describe('AuthService', () => {
    let service: AuthService;
    let loggerErrorSpy: jest.SpyInstance;

    beforeEach(async () => {
        process.env.NODE_ENV = 'test';
        loggerErrorSpy = jest
            .spyOn(Logger, 'error')
            .mockImplementation(() => undefined);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UsersService, useValue: mockUsersService },
                { provide: JwtService, useValue: mockJwtService },
                { provide: HashingService, useValue: mockHashingService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        jest.clearAllMocks();
        mockJwtService.getJwtExpirationMs.mockReturnValue(604800000);
    });

    afterEach(() => {
        loggerErrorSpy.mockRestore();
    });

    describe('login', () => {
        const loginDto = {
            email: 'alice@example.com',
            password: 'password123',
        };
        const mockRes = { cookie: jest.fn() } as any;

        it('should return a UserResponseDto and set a cookie on success', async () => {
            mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
            mockHashingService.compare.mockResolvedValue(true);
            mockJwtService.generateToken.mockReturnValue('jwt-token');

            const result = await service.login(loginDto, mockRes);

            expect(mockUsersService.findOneByEmail).toHaveBeenCalledWith(
                loginDto.email,
            );
            expect(mockHashingService.compare).toHaveBeenCalledWith(
                loginDto.password,
                mockUser.password,
            );
            expect(mockJwtService.generateToken).toHaveBeenCalledWith(mockUser);
            expect(mockRes.cookie).toHaveBeenCalledWith(
                'access_token',
                'jwt-token',
                expect.objectContaining({ httpOnly: true }),
            );
            expect(result.email).toBe('alice@example.com');
        });

        it('should throw BadRequestException when user is not found', async () => {
            mockUsersService.findOneByEmail.mockResolvedValue(null);

            await expect(service.login(loginDto, mockRes)).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should throw BadRequestException when password is incorrect', async () => {
            mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
            mockHashingService.compare.mockResolvedValue(false);

            await expect(service.login(loginDto, mockRes)).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should throw InternalServerErrorException when hashing throws', async () => {
            mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
            mockHashingService.compare.mockRejectedValue(
                new Error('argon2 error'),
            );

            await expect(service.login(loginDto, mockRes)).rejects.toThrow(
                InternalServerErrorException,
            );
        });

        it('should throw BadRequestException when user is not approved', async () => {
            mockUsersService.findOneByEmail.mockResolvedValue({
                ...mockUser,
                isApproved: false,
            });
            mockHashingService.compare.mockResolvedValue(true);

            await expect(service.login(loginDto, mockRes)).rejects.toThrow(
                BadRequestException,
            );
        });
    });

    describe('logout', () => {
        it('should call clearCookie on the response', async () => {
            const mockRes = { clearCookie: jest.fn() } as any;

            await service.logout(mockRes);

            expect(mockRes.clearCookie).toHaveBeenCalledWith(
                'access_token',
                expect.objectContaining({ httpOnly: true }),
            );
        });

        it('should throw InternalServerErrorException when clearCookie throws', async () => {
            const mockRes = {
                clearCookie: jest.fn().mockImplementation(() => {
                    throw new Error('cookie error');
                }),
            } as any;

            await expect(service.logout(mockRes)).rejects.toThrow(
                InternalServerErrorException,
            );
        });
    });
});
