import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HashingService } from '../../auth/hashing.service';
import { SendEmailService } from '../send-email/send-email.service';
import { UserCreateDto } from './dto/user.create.dto';
import { UserResponseDto } from './dto/user.response.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
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

        const entity = this.userRepo.create({
            name,
            email,
            password: hashedPassword,
            role: 'student',
            isApproved: false,
            teacherId: teacherId ?? null,
        });
        const saved = await this.userRepo.save(entity);
        return UserResponseDto.fromEntity(saved);
    }

    async findOneByEmail(email: string): Promise<User | null> {
        return this.userRepo.findOne({
            where: { email },
            relations: ['teacher'],
        });
    }

    async findStudentsByTeacherId(
        teacherId: string,
        approved = true,
    ): Promise<UserResponseDto[]> {
        const students = await this.userRepo.find({
            where: {
                role: 'student',
                teacher: { id: teacherId },
                isApproved: approved,
            },
            relations: ['teacher'],
            order: { name: 'ASC' },
        });
        return UserResponseDto.fromEntities(students);
    }

    async findAllTeachers(): Promise<UserResponseDto[]> {
        const teachers = await this.userRepo.find({
            where: { role: 'teacher' },
            order: { name: 'ASC' },
        });
        return UserResponseDto.fromEntities(teachers);
    }

    async approve(id: string): Promise<UserResponseDto> {
        await this.userRepo.update(id, { isApproved: true });
        const entity = await this.userRepo.findOne({
            where: { id },
            relations: ['teacher'],
        });
        const dto = UserResponseDto.fromEntity(entity!);
        await this.sendEmailService.send(
            dto.email,
            'Your account has been approved — welcome!',
            `Welcome, ${dto.name}!`,
            `Great news — your registration has been approved by your teacher. You can now sign in and start learning.`,
        );
        return dto;
    }

    async updatePassword(
        id: string,
        newPassword: string,
    ): Promise<UserResponseDto> {
        const hashedPassword = await this.hashingService.hash(newPassword);
        Logger.debug(`Updating password for user ${id}. Hashed password: ${hashedPassword}`);
        await this.userRepo.update(id, { password: hashedPassword });
        const entity = await this.userRepo.findOne({
            where: { id },
        });
        return UserResponseDto.fromEntity(entity!);
    }

    async remove(id: string): Promise<UserResponseDto> {
        const entity = await this.userRepo.findOneBy({ id });
        await this.userRepo.delete(id);
        return UserResponseDto.fromEntity(entity!);
    }
}
