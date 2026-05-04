import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard, TeacherGuard } from '../../auth/guards/auth.guard';
import { HashingService } from '../../auth/hashing.service';
import { JwtService } from '../../auth/jwt.service';
import { SendEmailService } from '../send-email/send-email.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [
        UsersService,
        HashingService,
        JwtService,
        AuthGuard,
        TeacherGuard,
        SendEmailService,
    ],
    exports: [UsersService],
    controllers: [UsersController],
})
export class UsersModule {}
