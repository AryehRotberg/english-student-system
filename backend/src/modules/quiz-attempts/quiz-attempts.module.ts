import { Module } from '@nestjs/common';
import { AuthGuard, TeacherGuard } from '../../auth/auth.guard';
import { JwtService } from '../../auth/jwt.service';
import { UsersModule } from '../users/users.module';
import { QuizAttemptsController } from './quiz-attempts.controller';
import { QuizAttemptsService } from './quiz-attempts.service';

@Module({
    imports: [UsersModule],
    controllers: [QuizAttemptsController],
    providers: [QuizAttemptsService, JwtService, AuthGuard, TeacherGuard],
})
export class QuizAttemptsModule {}
