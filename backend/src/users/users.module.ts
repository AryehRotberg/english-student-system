import { Module } from '@nestjs/common';
import { TeacherGuard, AuthGuard } from 'src/auth/auth.guard';
import { HashingService } from 'src/auth/hashing.service';
import { JwtService } from 'src/auth/jwt.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService, HashingService, JwtService, AuthGuard, TeacherGuard],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule { }
