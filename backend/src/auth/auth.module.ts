import { Module } from '@nestjs/common';
import { UsersModule } from '../modules/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard, TeacherGuard } from './guards/auth.guard';
import { CsrfGuard } from './guards/csrf.guard';
import { HashingService } from './hashing.service';
import { JwtService } from './jwt.service';

@Module({
    imports: [UsersModule],
    controllers: [AuthController],
    providers: [
        AuthService,
        AuthGuard,
        TeacherGuard,
        CsrfGuard,
        JwtService,
        HashingService,
    ],
    exports: [
        AuthGuard,
        TeacherGuard,
        CsrfGuard,
        UsersModule,
        JwtService,
        HashingService,
    ],
})
export class AuthModule {}
