import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import * as Sentry from '@sentry/node';
import type { Response } from 'express';
import { UserResponseDto } from '../modules/users/dto/user.response.dto';
import { User } from '../modules/users/entities/user.entity';
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

        await this.verifyPassword(user, password);

        if (!user.isApproved) {
            throw new BadRequestException('Your account is pending approval');
        }

        const token = this.jwtService.generateToken(user);

        res.cookie('access_token', token, this.getCookieOptions());

        return UserResponseDto.fromEntity(user);
    }

    async logout(res: Response): Promise<void> {
        try {
            res.clearCookie('access_token', this.getCookieOptions());
        } catch (error) {
            Sentry.captureException(error);
            throw new InternalServerErrorException('Logout failed');
        }
    }

    private async verifyPassword(user: User, plainPassword: string) {
        let isValid = false;
        const dummyHash =
            '$argon2id$v=19$m=65536,t=3,p=1$ZHVtbXlTYWx0$ZHVtbXlIYXNo'; // A dummy hash for timing attack prevention
        try {
            isValid = user
                ? await this.hashingService.compare(
                      plainPassword,
                      user.password,
                  )
                : await this.hashingService.compare(plainPassword, dummyHash);
        } catch (error) {
            Sentry.captureException(error);
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
