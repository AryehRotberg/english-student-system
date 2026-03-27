import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import * as Sentry from '@sentry/node';
import type { Response } from 'express';
import { CreateUserDto } from '../modules/users/dto/create-user.dto';
import { UserResponseDto } from '../modules/users/dto/user-response.dto';
import { UsersService } from '../modules/users/users.service';
import { LoginDto } from './dto/login.dto';
import { HashingService } from './hashing.service';
import { JwtService } from './jwt.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly hashingService: HashingService,
    ) {}

    async login(loginDto: LoginDto, res: Response): Promise<UserResponseDto> {
        const { email, password } = loginDto;

        const user = await this.usersService.findOneByEmail(email);

        if (!user) {
            throw new BadRequestException('Invalid email or password');
        }

        await this.verifyPassword(user.password, password);

        const token = this.jwtService.generateToken(user);
        res.cookie('access_token', token, this.getCookieOptions());

        return UserResponseDto.fromEntity(user);
    }

    async register(createUserDto: CreateUserDto): Promise<UserResponseDto> {
        return this.usersService.create(createUserDto);
    }

    async logout(res: Response): Promise<void> {
        try {
            res.clearCookie('access_token', this.getCookieOptions());
        } catch (error) {
            Sentry.captureException(error);
            Logger.error('Logout error:', error);
            throw new InternalServerErrorException('Logout failed');
        }
    }

    private async verifyPassword(
        hashedPassword: string,
        plainPassword: string,
    ) {
        let isValid = false;
        try {
            isValid = await this.hashingService.compare(
                plainPassword,
                hashedPassword,
            );
        } catch (error) {
            Sentry.captureException(error);
            Logger.error('Password verification error:', error);
            throw new InternalServerErrorException(
                'An error occurred during login',
            );
        }

        if (!isValid) {
            throw new BadRequestException('Invalid email or password');
        }
    }

    private getCookieOptions(): Record<string, any> {
        const isProduction = process.env.NODE_ENV === 'production';
        return {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            maxAge: this.jwtService.getJwtExpirationMs(),
            path: '/',
        };
    }
}
