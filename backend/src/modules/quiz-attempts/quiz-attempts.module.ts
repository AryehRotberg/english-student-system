import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard, TeacherGuard } from '../../auth/guards/auth.guard';
import { JwtService } from '../../auth/jwt.service';
import { AssignmentsModule } from '../assignments/assignments.module';
import { Quiz } from '../quizzes/entities/quiz.entity';
import { SendEmailModule } from '../send-email/send-email.module';
import { UsersModule } from '../users/users.module';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { QuizAttemptsController } from './quiz-attempts.controller';
import { QuizAttemptsService } from './quiz-attempts.service';
import { QuizAttemptRepository } from './repositories/quiz-attempt.repository';

@Module({
    imports: [
        UsersModule,
        AssignmentsModule,
        SendEmailModule,
        TypeOrmModule.forFeature([QuizAttempt, Quiz]),
    ],
    controllers: [QuizAttemptsController],
    providers: [
        QuizAttemptsService,
        JwtService,
        AuthGuard,
        TeacherGuard,
        QuizAttemptRepository,
    ],
    exports: [QuizAttemptsService],
})
export class QuizAttemptsModule {}
