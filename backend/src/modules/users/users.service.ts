import { BadRequestException, Injectable } from '@nestjs/common';
import { HashingService } from '../../auth/hashing.service';
import { PostgresService } from '../../config/postgres.client';
import { SendEmailService } from '../send-email/send-email.service';
import { UserCreateDto } from './dto/user.create.dto';
import { UserResponseDto } from './dto/user.response.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        private readonly pgService: PostgresService,
        private readonly hashingService: HashingService,
        private readonly sendEmailService: SendEmailService,
    ) {}

    async create(createUserDto: UserCreateDto): Promise<UserResponseDto> {
        const { name, email, password, teacherId } = createUserDto;

        const existingUser = await this.findOneByEmail(email);
        if (existingUser) {
            throw new BadRequestException(
                'User with this email already exists',
            );
        }

        const hashedPassword = await this.hashingService.hash(password);

        const result = await this.pgService.query<User>(
            this.pgService.getSql(__dirname, 'user.create.sql'),
            [name, email, hashedPassword, 'student', teacherId, false],
        );

        return UserResponseDto.fromEntity(result[0]);
    }

    async findOneByEmail(email: string): Promise<User | null> {
        const [result] = await this.pgService.query<User>(
            this.pgService.getSql(__dirname, 'user.find-by-email.sql'),
            [email],
        );
        return result || null;
    }

    async findStudentsByTeacherId(
        teacherId: string,
        approved = true,
    ): Promise<UserResponseDto[]> {
        const users = await this.pgService.query<User>(
            this.pgService.getSql(__dirname, 'user.find-all.sql'),
        );
        const students = users.filter(
            (user) =>
                user.role === 'student' &&
                user.teacherId === teacherId &&
                user.isApproved === approved,
        );
        return UserResponseDto.fromEntities(students);
    }

    async findAllTeachers(): Promise<UserResponseDto[]> {
        const users = await this.pgService.query<User>(
            this.pgService.getSql(__dirname, 'user.find-all.sql'),
        );
        const teachers = users.filter((user) => user.role === 'teacher');
        return UserResponseDto.fromEntities(teachers);
    }

    async approve(id: string): Promise<UserResponseDto> {
        const [result] = await this.pgService.query<User>(
            this.pgService.getSql(__dirname, 'user.approve.sql'),
            [id],
        );
        const dto = UserResponseDto.fromEntity(result);
        await this.sendEmailService.sendFromDto({
            name: dto.name,
            email: dto.email,
            subject: 'Your account has been approved — welcome!',
            title: `Welcome, ${dto.name}!`,
            body: `Great news — your registration has been approved by your teacher. You can now sign in and start learning.`,
        });
        return dto;
    }

    async remove(id: string): Promise<UserResponseDto> {
        const [result] = await this.pgService.query<User>(
            this.pgService.getSql(__dirname, 'user.delete.sql'),
            [id],
        );
        return UserResponseDto.fromEntity(result);
    }
}
