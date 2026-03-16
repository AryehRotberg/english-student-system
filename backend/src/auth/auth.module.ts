import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthGuard, TeacherGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { HashingService } from './hashing.service';
import { JwtService } from './jwt.service';

@Module({
    imports: [UsersModule],
    controllers: [AuthController],
    providers: [AuthService, AuthGuard, TeacherGuard, JwtService, HashingService],
    exports: [AuthGuard, TeacherGuard, UsersModule, JwtService, HashingService],
})
export class AuthModule { }
