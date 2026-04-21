import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { UserCreateDto } from '../modules/users/dto/user.create.dto';
import { UserResponseDto } from '../modules/users/dto/user.response.dto';
import { AuthService } from './auth.service';
import { User } from './decorators/user.decorator';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guards/auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get('user')
    @UseGuards(AuthGuard)
    getUser(@User() user: UserResponseDto) {
        return user;
    }

    @Post('login')
    async login(
        @Body() dto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const user = await this.authService.login(dto, res);

        return {
            message: 'Login successful.',
            user: user,
        };
    }

    @Post('register')
    async register(@Body() dto: UserCreateDto) {
        const user = await this.authService.register(dto);

        return {
            message: 'User registered successfully.',
            user: user,
        };
    }

    @Post('logout')
    logout(@Res({ passthrough: true }) res: Response) {
        this.authService.logout(res);
        return { message: 'Logout successful.' };
    }
}
