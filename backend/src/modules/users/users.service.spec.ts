import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HashingService } from '../../auth/hashing.service';
import { SendEmailService } from '../send-email/send-email.service';
import { UserCreateDto } from './dto/user.create.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

const makeUser = (overrides = {}): User =>
    ({
        id: 'user-uuid-1',
        name: 'Alice',
        email: 'alice@example.com',
        password: 'hashed',
        role: 'student',
        isApproved: false,
        teacherId: null,
        teacher: null,
        createdAt: new Date('2024-01-01'),
        get teacherName() {
            return null;
        },
        get teacherEmail() {
            return null;
        },
        ...overrides,
    }) as User;

const mockRepo = {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
};
const mockHashingService = { hash: jest.fn() };
const mockSendEmailService = { send: jest.fn() };

describe('UsersService', () => {
    let service: UsersService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                { provide: getRepositoryToken(User), useValue: mockRepo },
                { provide: HashingService, useValue: mockHashingService },
                { provide: SendEmailService, useValue: mockSendEmailService },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        jest.clearAllMocks();
    });

    describe('create', () => {
        const dto: UserCreateDto = {
            name: 'Alice',
            email: 'alice@example.com',
            password: 'password123',
            teacherId: 'teacher-uuid-1',
        };

        it('should create a new user and return a response DTO', async () => {
            mockRepo.findOne.mockResolvedValue(null); // no existing user
            mockHashingService.hash.mockResolvedValue('hashed');
            mockRepo.create.mockReturnValue(makeUser());
            mockRepo.save.mockResolvedValue(makeUser());

            const result = await service.create(dto);

            expect(mockHashingService.hash).toHaveBeenCalledWith('password123');
            expect(result.email).toBe('alice@example.com');
        });

        it('should throw BadRequestException if email already exists', async () => {
            mockRepo.findOne.mockResolvedValue(makeUser());

            await expect(service.create(dto)).rejects.toThrow(
                BadRequestException,
            );
        });
    });

    describe('findOneByEmail', () => {
        it('should return the user with teacher relation', async () => {
            const user = makeUser();
            mockRepo.findOne.mockResolvedValue(user);

            const result = await service.findOneByEmail('alice@example.com');

            expect(mockRepo.findOne).toHaveBeenCalledWith({
                where: { email: 'alice@example.com' },
                relations: ['teacher'],
            });
            expect(result).toEqual(user);
        });
    });

    describe('findStudentsByTeacherId', () => {
        it('should return students for a teacher ordered by name', async () => {
            const student = makeUser({ isApproved: true });
            mockRepo.find.mockResolvedValue([student]);

            const result =
                await service.findStudentsByTeacherId('teacher-uuid-1');

            expect(mockRepo.find).toHaveBeenCalledWith({
                where: {
                    role: 'student',
                    teacher: { id: 'teacher-uuid-1' },
                    isApproved: true,
                },
                relations: ['teacher'],
                order: { name: 'ASC' },
            });
            expect(result).toHaveLength(1);
        });
    });

    describe('findAllTeachers', () => {
        it('should return all teachers ordered by name', async () => {
            const teacher = makeUser({ role: 'teacher', isApproved: true });
            mockRepo.find.mockResolvedValue([teacher]);

            const result = await service.findAllTeachers();

            expect(mockRepo.find).toHaveBeenCalledWith({
                where: { role: 'teacher' },
                order: { name: 'ASC' },
            });
            expect(result).toHaveLength(1);
        });
    });

    describe('approve', () => {
        it('should approve the user and send a welcome email', async () => {
            const user = makeUser({ isApproved: true });
            mockRepo.update.mockResolvedValue({ affected: 1 });
            mockRepo.findOne.mockResolvedValue(user);
            mockSendEmailService.send.mockResolvedValue(undefined);

            const result = await service.approve('user-uuid-1');

            expect(mockRepo.update).toHaveBeenCalledWith('user-uuid-1', {
                isApproved: true,
            });
            expect(mockSendEmailService.send).toHaveBeenCalledWith(
                'alice@example.com',
                expect.stringContaining('approved'),
                expect.any(String),
                expect.any(String),
            );
            expect(result.isApproved).toBe(true);
        });
    });

    describe('remove', () => {
        it('should delete the user and return the deleted entity as a DTO', async () => {
            const user = makeUser();
            mockRepo.findOneBy.mockResolvedValue(user);
            mockRepo.delete.mockResolvedValue({ affected: 1 });

            const result = await service.remove('user-uuid-1');

            expect(mockRepo.delete).toHaveBeenCalledWith('user-uuid-1');
            expect(result.id).toBe('user-uuid-1');
        });
    });
});
