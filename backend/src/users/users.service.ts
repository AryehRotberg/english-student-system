import { BadRequestException, Injectable } from '@nestjs/common';
import { HashingService } from '../auth/hashing.service';
import { PostgresService } from '../config/postgres.client';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';
import {
    deleteUserQuery,
    getUserByEmailQuery,
    insertUserQuery,
} from './users.queries';

@Injectable()
export class UsersService {
    constructor(
        private readonly postgresService: PostgresService,
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

        const result = await this.postgresService.query<User>(insertUserQuery, [
            name,
            email,
            hashedPassword,
            'student',
        ]);

        return UserResponseDto.fromEntity(result[0]);
    }

    async findOneByEmail(email: string): Promise<User | null> {
        const [result] = await this.postgresService.query<User>(
            getUserByEmailQuery,
            [email],
        );
        return result || null;
    }

    async remove(id: string): Promise<UserResponseDto> {
        const [result] = await this.postgresService.query<User>(
            deleteUserQuery,
            [id],
        );
        return UserResponseDto.fromEntity(result);
    }
}
