import { BadRequestException, Injectable } from '@nestjs/common';
import { HashingService } from '../../auth/hashing.service';
import { PostgresService } from '../../config/postgres.client';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        private readonly pgService: PostgresService,
        private readonly hashingService: HashingService,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
        const { name, email, password } = createUserDto;

        const existingUser = await this.findOneByEmail(email);
        if (existingUser) {
            throw new BadRequestException(
                'User with this email already exists',
            );
        }

        const hashedPassword = await this.hashingService.hash(password);

        const result = await this.pgService.query<User>(
            this.pgService.getSql(__dirname, 'insert-user.sql'),
            [name, email, hashedPassword, 'student'],
        );

        return UserResponseDto.fromEntity(result[0]);
    }

    async findOneByEmail(email: string): Promise<User | null> {
        const [result] = await this.pgService.query<User>(
            this.pgService.getSql(__dirname, 'get-user-by-email.sql'),
            [email],
        );
        return result || null;
    }

    async getAllStudents(): Promise<UserResponseDto[]> {
        const users = await this.pgService.query<User>(
            this.pgService.getSql(__dirname, 'get-all-users.sql'),
        );
        const students = users.filter((user) => user.role === 'student');
        return UserResponseDto.fromEntities(students);
    }

    async remove(id: string): Promise<UserResponseDto> {
        const [result] = await this.pgService.query<User>(
            this.pgService.getSql(__dirname, 'delete-user.sql'),
            [id],
        );
        return UserResponseDto.fromEntity(result);
    }
}
