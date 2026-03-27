import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { CreateUserDto } from '../modules/users/dto/create-user.dto';
import { UserResponseDto } from '../modules/users/dto/user-response.dto';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { User } from './decorators/user.decorator';
import { LoginDto } from './dto/login.dto';

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
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const user = await this.authService.login(loginDto, res);

        return {
            message: 'Login successful.',
            user: user,
        };
    }

    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
        const user = await this.authService.register(createUserDto);

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
