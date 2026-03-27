import { Module } from '@nestjs/common';
import { AuthGuard, TeacherGuard } from '../../auth/auth.guard';
import { HashingService } from '../../auth/hashing.service';
import { JwtService } from '../../auth/jwt.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
    providers: [
        UsersService,
        HashingService,
        JwtService,
        AuthGuard,
        TeacherGuard,
    ],
    exports: [UsersService],
    controllers: [UsersController],
})
export class UsersModule {}
