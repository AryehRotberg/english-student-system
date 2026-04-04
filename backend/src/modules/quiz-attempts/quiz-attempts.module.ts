import { Module } from '@nestjs/common';
import { AuthGuard, TeacherGuard } from '../../auth/guards/auth.guard';
import { JwtService } from '../../auth/jwt.service';
import { UsersModule } from '../users/users.module';
import { QuizAttemptsController } from './quiz-attempts.controller';
import { QuizAttemptsService } from './quiz-attempts.service';

@Module({
    imports: [UsersModule],
    controllers: [QuizAttemptsController],
    providers: [QuizAttemptsService, JwtService, AuthGuard, TeacherGuard],
    exports: [QuizAttemptsService],
})
export class QuizAttemptsModule {}
